import type { Dex } from '@pkmn/sim'
type FormatList = Parameters<typeof Dex.formats.extend>[0]

export const Formats = ['doubles', 'singles'].flatMap(gameType =>
  ['G', 'H', 'I'].map(regulation => ({
    name: `${gameType}Reg${regulation}`,
    mod: 'gen9',
    gameType: gameType as 'doubles' | 'singles',
    ruleset: [
      'Flat Rules', '!! Adjust Level = 50', 'Min Source Gen = 9',
      ...(gameType === 'doubles' ? ['VGC Timer', 'Open Team Sheets'] : []),
      ...(regulation === 'G' ? ['Limit One Restricted'] : []),
      ...(regulation === 'I' ? ['Limit Two Restricted'] : []),
    ],
    ...(regulation === 'H'
      ? { banlist: ['Sub-Legendary', 'Paradox'] }
      : { restricted: ['Restricted Legendary'] }),
  })),
) satisfies FormatList
