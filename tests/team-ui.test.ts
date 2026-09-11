// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { mount, shallowMount, flushPromises } from '@vue/test-utils'
import { computed, defineComponent, h, nextTick, onMounted, onUnmounted, readonly, ref, shallowRef, toValue, unref, watch } from 'vue'
import PokemonCard from '../app/components/ui/PokemonCard.vue'
import TeamEditModal from '../app/components/ui/TeamEditModal.vue'
import CoveragePage from '../app/pages/teams/[id]/coverage.vue'
import ResistancePage from '../app/pages/teams/[id]/resistance.vue'
import { useTeamTabs } from '../app/composables/useTeamTabs'
import { useTeamOptions } from '../app/composables/useTeamOptions'
import { parseAndValidateTeam } from '../app/lib/parser/teamParser'
import { CoverageAnalyzer } from '../app/lib/analyzer/coverageAnalyzer'
import { ResistanceAnalyzer } from '../app/lib/analyzer/resistanceAnalyzer'
import type { Team } from '../app/types/team'

vi.mock('../app/composables/usePokemonTranslations', () => ({
  usePokemonTranslations: () => ({ getTranslatedName: (name: string) => name }),
}))

const parsed = parseAndValidateTeam('Rillaboom @ Assault Vest\nAbility: Grassy Surge\n- Wood Hammer', 'doublesRegI')
const initial: Team = {
  id: 'test-team', name: 'Example', gameVersion: 'sv', rules: 'doublesRegI',
  teamRawData: '', teamData: parsed.teamParsed, errors: [], createdAt: new Date(),
}
const TeamLayout = defineComponent({
  name: 'TeamDetailLayout', emits: ['team-change'],
  setup(_props, { emit, slots }) {
    onMounted(() => emit('team-change', initial))
    return () => h('div', slots.default?.({ team: initial, translateName: (name: string) => name }))
  },
})
const Slot = defineComponent({ setup(_props, { slots }) { return () => h('div', slots.default?.()) } })
const wrappers: Array<{ unmount(): void }> = []

beforeEach(() => {
  for (const [name, value] of Object.entries({ computed, nextTick, onMounted, onUnmounted, readonly, ref, shallowRef, toValue, unref, watch })) {
    vi.stubGlobal(name, value)
  }
  vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
  vi.stubGlobal('useRoute', () => ({ params: { id: 'test-team' } }))
  vi.stubGlobal('useTeamTabs', useTeamTabs)
  vi.stubGlobal('useTeamOptions', useTeamOptions)
  vi.stubGlobal('useUserPreferences', () => ({ preferences: ref({ useTranslation: false }) }))
})
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('renders an unknown move with an editable text fallback', () => {
  const pokemon = parseAndValidateTeam('Rillaboom\nAbility: Grassy Surge\n- Wood Hamer', 'doublesRegI').teamParsed[0]!
  const wrapper = shallowMount(PokemonCard, {
    props: { pokemon, translateName: (name: string) => name },
    global: { stubs: { NuxtImg: true } },
  })
  wrappers.push(wrapper)
  expect(wrapper.text()).toContain('Wood Hamer')
  expect(wrapper.text()).toContain('Rillaboom')
})

it('recalculates coverage from the edited team and preserves selected types', async () => {
  const analyze = vi.spyOn(CoverageAnalyzer.prototype, 'analyze')
  const wrapper = shallowMount(CoveragePage, {
    global: { stubs: { TeamDetailLayout: TeamLayout, ClientOnly: Slot, TabNavigation: true, TypeSelector: true, MoveCategory: true, NuxtImg: true } },
  })
  wrappers.push(wrapper)
  await flushPromises()
  wrapper.findComponent({ name: 'TypeSelector' }).vm.$emit('update:selectedTypes', ['Water'])
  await nextTick()
  const edited = { ...initial, teamData: parseAndValidateTeam('Pikachu\nAbility: Static\n- Thunderbolt', 'doublesRegI').teamParsed }
  wrapper.findComponent(TeamLayout).vm.$emit('team-change', edited)
  await nextTick()
  expect(analyze.mock.calls.at(-1)?.[0][0]?.species).toBe('Pikachu')
  expect(analyze.mock.calls.at(-1)?.[1]?.combination?.type1).toBe('Water')
})

it('does not recalculate resistance merely because the template rerenders', async () => {
  const analyze = vi.spyOn(ResistanceAnalyzer.prototype, 'analyze')
  const wrapper = shallowMount(ResistancePage, {
    global: { stubs: { TeamDetailLayout: TeamLayout, ClientOnly: Slot, TabNavigation: true, NuxtImg: true } },
  })
  wrappers.push(wrapper)
  await flushPromises()
  const count = analyze.mock.calls.length
  expect(count).toBe(1)
  wrapper.vm.$forceUpdate()
  await nextTick()
  expect(analyze).toHaveBeenCalledTimes(count)
})

it('keeps unsaved text visible when persistence fails and resets a cancelled edit on reopening', async () => {
  const wrapper = mount(TeamEditModal, {
    props: { isOpen: true, mode: 'edit', team: { ...initial, teamRawData: 'original text' } },
    global: { stubs: { Teleport: true, Transition: false } },
  })
  wrappers.push(wrapper)
  await wrapper.get('#team-data').setValue('edited text')
  const save = wrapper.findAll('button').find(button => button.text() === 'teamEditModal.saveButton')!
  await save.trigger('click')
  await wrapper.setProps({ error: true })
  expect(wrapper.emitted('update')?.[0]?.[0]).toMatchObject({ teamRawData: 'edited text' })
  expect(wrapper.emitted('close')).toBeUndefined()
  expect(wrapper.get('#team-data').element).toHaveProperty('value', 'edited text')
  expect(wrapper.get('[role="alert"]').text()).toBe('common.error.savingTeam')
  await wrapper.setProps({ isOpen: false })
  await wrapper.setProps({ isOpen: true, error: false })
  expect(wrapper.get('#team-data').element).toHaveProperty('value', 'original text')
})
