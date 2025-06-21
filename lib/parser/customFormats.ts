// FormatList type based on @pkmn/sim internal structure
type FormatList = (FormatData | { section: string; column?: number })[];

interface FormatData {
  name: string;
  [key: string]: any;
}

export const customFormatNames = ['doublesregg', 'doublesregh', 'doublesregi', 'singlesregg', 'singlesregh', 'singlesregi'];

export const Formats: FormatList = [
  {
    section: "Custom",
  },
  {
    name: "doublesRegG",
    mod: 'gen9',
    gameType: 'doubles',
    bestOfDefault: true,
    ruleset: ['Flat Rules', '!! Adjust Level = 50', 'Min Source Gen = 9', 'VGC Timer', 'Open Team Sheets', 'Limit One Restricted'],
    restricted: ['Restricted Legendary'],
  },
  {
    name: "doublesRegH",
    mod: 'gen9',
    gameType: 'doubles',
    bestOfDefault: true,
    ruleset: ['Flat Rules', '!! Adjust Level = 50', 'Min Source Gen = 9', 'VGC Timer', 'Open Team Sheets'],
    banned: ['Restricted Legendary', 'Mythical', 'Legendary'],
  },
  {
    name: "doublesRegI",
    mod: 'gen9',
    gameType: 'doubles',
    bestOfDefault: true,
    ruleset: ['Flat Rules', '!! Adjust Level = 50', 'Min Source Gen = 9', 'VGC Timer', 'Open Team Sheets', 'Limit Two Restricted'],
    restricted: ['Restricted Legendary'],
  },
  {
    name: "singlesRegG",
    mod: 'gen9',
    gameType: 'singles',
    bestOfDefault: true,
    ruleset: ['Flat Rules', '!! Adjust Level = 50', 'Min Source Gen = 9', 'VGC Timer', 'Open Team Sheets', 'Limit One Restricted'],
    restricted: ['Restricted Legendary'],
  },
  {
    name: "singlesRegH",
    mod: 'gen9',
    gameType: 'singles',
    bestOfDefault: true,
    ruleset: ['Flat Rules', '!! Adjust Level = 50', 'Min Source Gen = 9', 'VGC Timer', 'Open Team Sheets'],
    banned: ['Restricted Legendary', 'Mythical', 'Legendary'],
  },
  {
    name: "singlesRegI",
    mod: 'gen9',
    gameType: 'singles',
    bestOfDefault: true,
    ruleset: ['Flat Rules', '!! Adjust Level = 50', 'Min Source Gen = 9', 'VGC Timer', 'Open Team Sheets', 'Limit Two Restricted'],
    restricted: ['Restricted Legendary'],
  }
];
