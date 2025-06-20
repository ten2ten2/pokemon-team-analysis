import type { Team } from '../../types/team';
import { Generations, type Move } from '@pkmn/data';
import { Dex } from '@pkmn/dex';

const teamString = `{
  "id": "mc1a0rth-w9lj",
  "name": "UntitledX",
  "gameVersion": "sv",
  "rules": "doublesRegI",
  "teamRawData": "Incineroar (M) @ Safety Goggles\\nAbility: Intimidate\\nLevel: 50\\nShiny: Yes \\nTera Type: Fairy\\nEVs: 244 HP / 188 Def / 76 SpD\\nImpish Nature\\nIVs: 0 Spe\\n  - U - turn\\n  - Fake Out\\n  - Flare Blitz\\n  - Knock Off\\n\\nLunala @ Leftovers\\nAbility: Shadow Shield\\nLevel: 50\\nTera Type: Fairy\\nEVs: 132 HP / 20 Def / 180 SpA / 172 SpD / 4 Spe\\nModest Nature\\nIVs: 0 Atk\\n  - Moongeist Beam\\n  - Moonblast\\n  - Wide Guard\\n  - Trick Room\\n\\nAmoonguss (F) @ Covert Cloak\\nAbility: Regenerator\\nLevel: 50\\nTera Type: Dark\\nEVs: 236 HP / 196 Def / 76 SpD\\nSassy Nature\\nIVs: 0 Atk / 0 Spe\\n  - Rage Powder\\n  - Spore\\n  - Pollen Puff\\n  - Protect\\n\\nUrsaluna (M) @ Flame Orb\\nAbility: Guts\\nLevel: 50\\nTera Type: Ghost\\nEVs: 140 HP / 252 Atk / 116 SpD\\nBrave Nature\\nIVs: 14 SpA / 0 Spe\\n  - Facade\\n  - Headlong Rush\\n  - Earthquake\\n  - Protect\\n\\nKoraidon @ Life Orb\\nAbility: Orichalcum Pulse\\nLevel: 50\\nTera Type: Fire\\nEVs: 4 HP / 252 Atk / 252 Spe\\nJolly Nature\\n  - Flare Blitz\\n  - Close Combat\\n  - Flame Charge\\n  - Protect\\n\\nFlutter Mane @ Focus Sash\\nAbility: Protosynthesis\\nLevel: 50\\nShiny: Yes\\nTera Type: Fairy\\nEVs: 4 Def / 252 SpA / 252 Spe\\nTimid Nature\\nIVs: 3 Atk\\n  - Moonblast\\n  - Shadow Ball\\n  - Icy Wind\\n  - Protect",
  "teamData": [
    {
      "name": "",
      "species": "Incineroar",
      "gender": "M",
      "item": "Safety Goggles",
      "ability": "Intimidate",
      "level": 50,
      "shiny": true,
      "teraType": "Fairy",
      "evs": {
        "hp": 244,
        "atk": 0,
        "def": 188,
        "spa": 0,
        "spd": 76,
        "spe": 0
      },
      "nature": "Impish",
      "ivs": {
        "hp": 31,
        "atk": 31,
        "def": 31,
        "spa": 31,
        "spd": 31,
        "spe": 0
      },
      "moves": [
        "U - turn",
        "Fake Out",
        "Flare Blitz",
        "Knock Off"
      ],
      "types": [
        "Fire",
        "Dark"
      ],
      "pokeapiNum": 727,
      "movesDetails": {
        "U - turn": {
          "exists": true,
          "num": 369,
          "accuracy": 100,
          "basePower": 70,
          "category": "Physical",
          "name": "U-turn",
          "pp": 20,
          "priority": 0,
          "flags": {
            "contact": 1,
            "protect": 1,
            "mirror": 1,
            "metronome": 1
          },
          "selfSwitch": true,
          "secondary": null,
          "target": "normal",
          "type": "Bug",
          "desc": "If this move is successful and the user has not fainted, the user switches out even if it is trapped and is replaced immediately by a selected party member. The user does not switch out if there are no unfainted party members, or if the target switched out using an Eject Button or through the effect of the Emergency Exit or Wimp Out Abilities.",
          "shortDesc": "User switches out after damaging the target.",
          "id": "uturn",
          "fullname": "move: U-turn",
          "effectType": "Move",
          "kind": "Move",
          "gen": 4,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 120
          },
          "zMove": {
            "basePower": 140
          }
        },
        "Fake Out": {
          "exists": true,
          "num": 252,
          "accuracy": 100,
          "basePower": 40,
          "category": "Physical",
          "name": "Fake Out",
          "pp": 10,
          "priority": 3,
          "flags": {
            "contact": 1,
            "protect": 1,
            "mirror": 1,
            "metronome": 1
          },
          "secondary": {
            "chance": 100,
            "volatileStatus": "flinch"
          },
          "target": "normal",
          "type": "Normal",
          "desc": "Has a 100% chance to make the target flinch. Fails unless it is the user's first turn on the field.",
          "shortDesc": "Hits first. First turn out only. 100% flinch chance.",
          "id": "fakeout",
          "fullname": "move: Fake Out",
          "effectType": "Move",
          "kind": "Move",
          "gen": 3,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": [
            {
              "chance": 100,
              "volatileStatus": "flinch"
            }
          ],
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 90
          },
          "zMove": {
            "basePower": 100
          }
        },
        "Flare Blitz": {
          "exists": true,
          "num": 394,
          "accuracy": 100,
          "basePower": 120,
          "category": "Physical",
          "name": "Flare Blitz",
          "pp": 15,
          "priority": 0,
          "flags": {
            "contact": 1,
            "protect": 1,
            "mirror": 1,
            "defrost": 1,
            "metronome": 1
          },
          "recoil": [
            33,
            100
          ],
          "secondary": {
            "chance": 10,
            "status": "brn"
          },
          "target": "normal",
          "type": "Fire",
          "desc": "Has a 10% chance to burn the target. If the target lost HP, the user takes recoil damage equal to 33% the HP lost by the target, rounded half up, but not less than 1 HP.",
          "shortDesc": "Has 33% recoil. 10% chance to burn. Thaws user.",
          "id": "flareblitz",
          "fullname": "move: Flare Blitz",
          "effectType": "Move",
          "kind": "Move",
          "gen": 4,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": [
            {
              "chance": 10,
              "status": "brn"
            }
          ],
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 140
          },
          "zMove": {
            "basePower": 190
          }
        },
        "Knock Off": {
          "exists": true,
          "num": 282,
          "accuracy": 100,
          "basePower": 65,
          "category": "Physical",
          "name": "Knock Off",
          "pp": 20,
          "priority": 0,
          "flags": {
            "contact": 1,
            "protect": 1,
            "mirror": 1,
            "metronome": 1
          },
          "secondary": null,
          "target": "normal",
          "type": "Dark",
          "desc": "If the target is holding an item that can be removed from it, ignoring the Sticky Hold Ability, this move's power is multiplied by 1.5. If the user has not fainted, the target loses its held item. This move cannot cause Pokemon with the Sticky Hold Ability to lose their held item or cause a Kyogre, a Groudon, a Giratina, an Arceus, a Genesect, a Silvally, a Zacian, or a Zamazenta to lose their Blue Orb, Red Orb, Griseous Orb, Plate, Drive, Memory, Rusted Sword, or Rusted Shield respectively. Items lost to this move cannot be regained with Recycle or the Harvest Ability.",
          "shortDesc": "1.5x damage if foe holds an item. Removes item.",
          "id": "knockoff",
          "fullname": "move: Knock Off",
          "effectType": "Move",
          "kind": "Move",
          "gen": 3,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 120
          },
          "zMove": {
            "basePower": 120
          }
        }
      }
    },
    {
      "name": "",
      "species": "Lunala",
      "gender": "",
      "item": "Leftovers",
      "ability": "Shadow Shield",
      "level": 50,
      "teraType": "Fairy",
      "evs": {
        "hp": 132,
        "atk": 0,
        "def": 20,
        "spa": 180,
        "spd": 172,
        "spe": 4
      },
      "nature": "Modest",
      "ivs": {
        "hp": 31,
        "atk": 0,
        "def": 31,
        "spa": 31,
        "spd": 31,
        "spe": 31
      },
      "moves": [
        "Moongeist Beam",
        "Moonblast",
        "Wide Guard",
        "Trick Room"
      ],
      "types": [
        "Psychic",
        "Ghost"
      ],
      "pokeapiNum": 792,
      "movesDetails": {
        "Moongeist Beam": {
          "exists": true,
          "num": 714,
          "accuracy": 100,
          "basePower": 100,
          "category": "Special",
          "name": "Moongeist Beam",
          "pp": 5,
          "priority": 0,
          "flags": {
            "protect": 1,
            "mirror": 1
          },
          "ignoreAbility": true,
          "secondary": null,
          "target": "normal",
          "type": "Ghost",
          "desc": "This move and its effects ignore the Abilities of other Pokemon.",
          "shortDesc": "Ignores the Abilities of other Pokemon.",
          "id": "moongeistbeam",
          "fullname": "move: Moongeist Beam",
          "effectType": "Move",
          "kind": "Move",
          "gen": 7,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "maxMove": {
            "basePower": 130
          },
          "zMove": {
            "basePower": 180
          }
        },
        "Moonblast": {
          "exists": true,
          "num": 585,
          "accuracy": 100,
          "basePower": 95,
          "category": "Special",
          "name": "Moonblast",
          "pp": 15,
          "priority": 0,
          "flags": {
            "protect": 1,
            "mirror": 1,
            "metronome": 1
          },
          "secondary": {
            "chance": 30,
            "boosts": {
              "spa": -1
            }
          },
          "target": "normal",
          "type": "Fairy",
          "desc": "Has a 30% chance to lower the target's Special Attack by 1 stage.",
          "shortDesc": "30% chance to lower the target's Sp. Atk by 1.",
          "id": "moonblast",
          "fullname": "move: Moonblast",
          "effectType": "Move",
          "kind": "Move",
          "gen": 6,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": [
            {
              "chance": 30,
              "boosts": {
                "spa": -1
              }
            }
          ],
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 130
          },
          "zMove": {
            "basePower": 175
          }
        },
        "Wide Guard": {
          "exists": true,
          "num": 469,
          "accuracy": true,
          "basePower": 0,
          "category": "Status",
          "name": "Wide Guard",
          "pp": 10,
          "priority": 3,
          "flags": {
            "snatch": 1
          },
          "sideCondition": "wideguard",
          "condition": {
            "duration": 1,
            "onTryHitPriority": 4
          },
          "secondary": null,
          "target": "allySide",
          "type": "Rock",
          "zMove": {
            "boost": {
              "def": 1
            }
          },
          "desc": "The user and its party members are protected from moves made by other Pokemon, including allies, during this turn that target all adjacent foes or all adjacent Pokemon. This move modifies the same 1/X chance of being successful used by other protection moves, where X starts at 1 and triples each time this move is successfully used, but does not use the chance to check for failure. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Burning Bulwark, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Silk Trap, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn or if this move is already in effect for the user's side.",
          "shortDesc": "Protects allies from multi-target moves this turn.",
          "id": "wideguard",
          "fullname": "move: Wide Guard",
          "effectType": "Move",
          "kind": "Move",
          "gen": 5,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": true,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false
        },
        "Trick Room": {
          "exists": true,
          "num": 433,
          "accuracy": true,
          "basePower": 0,
          "category": "Status",
          "name": "Trick Room",
          "pp": 5,
          "priority": -7,
          "flags": {
            "mirror": 1,
            "metronome": 1
          },
          "pseudoWeather": "trickroom",
          "condition": {
            "duration": 5,
            "onFieldResidualOrder": 27,
            "onFieldResidualSubOrder": 1
          },
          "secondary": null,
          "target": "all",
          "type": "Psychic",
          "zMove": {
            "boost": {
              "accuracy": 1
            }
          },
          "desc": "For 5 turns, the Speed of every Pokemon is recalculated for the purposes of determining turn order. During the effect, each Pokemon's Speed is considered to be (10000 - its normal Speed), and if this value is greater than 8191, 8192 is subtracted from it. If this move is used during the effect, the effect ends.",
          "shortDesc": "Goes last. For 5 turns, turn order is reversed.",
          "id": "trickroom",
          "fullname": "move: Trick Room",
          "effectType": "Move",
          "kind": "Move",
          "gen": 4,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": true,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false
        }
      }
    },
    {
      "name": "",
      "species": "Amoonguss",
      "gender": "F",
      "item": "Covert Cloak",
      "ability": "Regenerator",
      "level": 50,
      "teraType": "Dark",
      "evs": {
        "hp": 236,
        "atk": 0,
        "def": 196,
        "spa": 0,
        "spd": 76,
        "spe": 0
      },
      "nature": "Sassy",
      "ivs": {
        "hp": 31,
        "atk": 0,
        "def": 31,
        "spa": 31,
        "spd": 31,
        "spe": 0
      },
      "moves": [
        "Rage Powder",
        "Spore",
        "Pollen Puff",
        "Protect"
      ],
      "types": [
        "Grass",
        "Poison"
      ],
      "pokeapiNum": 591,
      "movesDetails": {
        "Rage Powder": {
          "exists": true,
          "num": 476,
          "accuracy": true,
          "basePower": 0,
          "category": "Status",
          "name": "Rage Powder",
          "pp": 20,
          "priority": 2,
          "flags": {
            "noassist": 1,
            "failcopycat": 1,
            "powder": 1
          },
          "volatileStatus": "ragepowder",
          "condition": {
            "duration": 1,
            "onFoeRedirectTargetPriority": 1
          },
          "secondary": null,
          "target": "self",
          "type": "Bug",
          "zMove": {
            "effect": "clearnegativeboost"
          },
          "desc": "Until the end of the turn, all single-target attacks from the opposing side are redirected to the user. Such attacks are redirected to the user before they can be reflected by Magic Coat or the Magic Bounce Ability, or drawn in by the Lightning Rod or Storm Drain Abilities. Fails if it is not a Double Battle or Battle Royal. This effect is ignored while the user is under the effect of Sky Drop.",
          "shortDesc": "The foes' moves target the user on the turn used.",
          "id": "ragepowder",
          "fullname": "move: Rage Powder",
          "effectType": "Move",
          "kind": "Move",
          "gen": 5,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": true,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false
        },
        "Spore": {
          "exists": true,
          "num": 147,
          "accuracy": 100,
          "basePower": 0,
          "category": "Status",
          "name": "Spore",
          "pp": 15,
          "priority": 0,
          "flags": {
            "protect": 1,
            "reflectable": 1,
            "mirror": 1,
            "metronome": 1,
            "powder": 1
          },
          "status": "slp",
          "secondary": null,
          "target": "normal",
          "type": "Grass",
          "zMove": {
            "effect": "clearnegativeboost"
          },
          "shortDesc": "Causes the target to fall asleep.",
          "id": "spore",
          "fullname": "move: Spore",
          "effectType": "Move",
          "kind": "Move",
          "gen": 1,
          "desc": "Causes the target to fall asleep.",
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": true,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false
        },
        "Pollen Puff": {
          "exists": true,
          "num": 676,
          "accuracy": 100,
          "basePower": 90,
          "category": "Special",
          "name": "Pollen Puff",
          "pp": 15,
          "priority": 0,
          "flags": {
            "protect": 1,
            "mirror": 1,
            "allyanim": 1,
            "metronome": 1,
            "bullet": 1
          },
          "secondary": null,
          "target": "normal",
          "type": "Bug",
          "desc": "If the target is an ally, this move restores 1/2 of its maximum HP, rounded down, instead of dealing damage.",
          "shortDesc": "If the target is an ally, heals 50% of its max HP.",
          "id": "pollenpuff",
          "fullname": "move: Pollen Puff",
          "effectType": "Move",
          "kind": "Move",
          "gen": 7,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 130
          },
          "zMove": {
            "basePower": 175
          }
        },
        "Protect": {
          "exists": true,
          "num": 182,
          "accuracy": true,
          "basePower": 0,
          "category": "Status",
          "name": "Protect",
          "pp": 10,
          "priority": 4,
          "flags": {
            "noassist": 1,
            "failcopycat": 1
          },
          "stallingMove": true,
          "volatileStatus": "protect",
          "condition": {
            "duration": 1,
            "onTryHitPriority": 3
          },
          "secondary": null,
          "target": "self",
          "type": "Normal",
          "zMove": {
            "effect": "clearnegativeboost"
          },
          "desc": "The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Burning Bulwark, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Silk Trap, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",
          "shortDesc": "Prevents moves from affecting the user this turn.",
          "id": "protect",
          "fullname": "move: Protect",
          "effectType": "Move",
          "kind": "Move",
          "gen": 2,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": true,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false
        }
      }
    },
    {
      "name": "",
      "species": "Ursaluna",
      "gender": "M",
      "item": "Flame Orb",
      "ability": "Guts",
      "level": 50,
      "teraType": "Ghost",
      "evs": {
        "hp": 140,
        "atk": 252,
        "def": 0,
        "spa": 0,
        "spd": 116,
        "spe": 0
      },
      "nature": "Brave",
      "ivs": {
        "hp": 31,
        "atk": 31,
        "def": 31,
        "spa": 14,
        "spd": 31,
        "spe": 0
      },
      "moves": [
        "Facade",
        "Headlong Rush",
        "Earthquake",
        "Protect"
      ],
      "types": [
        "Ground",
        "Normal"
      ],
      "pokeapiNum": 901,
      "movesDetails": {
        "Facade": {
          "exists": true,
          "num": 263,
          "accuracy": 100,
          "basePower": 70,
          "category": "Physical",
          "name": "Facade",
          "pp": 20,
          "priority": 0,
          "flags": {
            "contact": 1,
            "protect": 1,
            "mirror": 1,
            "metronome": 1
          },
          "secondary": null,
          "target": "normal",
          "type": "Normal",
          "desc": "Power doubles if the user is burned, paralyzed, or poisoned. The physical damage halving effect from the user's burn is ignored.",
          "shortDesc": "Power doubles if user is burn/poison/paralyzed.",
          "id": "facade",
          "fullname": "move: Facade",
          "effectType": "Move",
          "kind": "Move",
          "gen": 3,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 120
          },
          "zMove": {
            "basePower": 140
          }
        },
        "Headlong Rush": {
          "exists": true,
          "num": 838,
          "accuracy": 100,
          "basePower": 120,
          "category": "Physical",
          "name": "Headlong Rush",
          "pp": 5,
          "priority": 0,
          "flags": {
            "contact": 1,
            "protect": 1,
            "mirror": 1,
            "punch": 1,
            "metronome": 1
          },
          "self": {
            "boosts": {
              "def": -1,
              "spd": -1
            }
          },
          "secondary": null,
          "target": "normal",
          "type": "Ground",
          "desc": "Lowers the user's Defense and Special Defense by 1 stage.",
          "shortDesc": "Lowers the user's Defense and Sp. Def by 1.",
          "id": "headlongrush",
          "fullname": "move: Headlong Rush",
          "effectType": "Move",
          "kind": "Move",
          "gen": 9,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 140
          },
          "zMove": {
            "basePower": 190
          }
        },
        "Earthquake": {
          "exists": true,
          "num": 89,
          "accuracy": 100,
          "basePower": 100,
          "category": "Physical",
          "name": "Earthquake",
          "pp": 10,
          "priority": 0,
          "flags": {
            "protect": 1,
            "mirror": 1,
            "nonsky": 1,
            "metronome": 1
          },
          "secondary": null,
          "target": "allAdjacent",
          "type": "Ground",
          "desc": "Damage doubles if the target is using Dig.",
          "shortDesc": "Hits adjacent Pokemon. Double damage on Dig.",
          "id": "earthquake",
          "fullname": "move: Earthquake",
          "effectType": "Move",
          "kind": "Move",
          "gen": 1,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 130
          },
          "zMove": {
            "basePower": 180
          }
        },
        "Protect": {
          "exists": true,
          "num": 182,
          "accuracy": true,
          "basePower": 0,
          "category": "Status",
          "name": "Protect",
          "pp": 10,
          "priority": 4,
          "flags": {
            "noassist": 1,
            "failcopycat": 1
          },
          "stallingMove": true,
          "volatileStatus": "protect",
          "condition": {
            "duration": 1,
            "onTryHitPriority": 3
          },
          "secondary": null,
          "target": "self",
          "type": "Normal",
          "zMove": {
            "effect": "clearnegativeboost"
          },
          "desc": "The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Burning Bulwark, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Silk Trap, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",
          "shortDesc": "Prevents moves from affecting the user this turn.",
          "id": "protect",
          "fullname": "move: Protect",
          "effectType": "Move",
          "kind": "Move",
          "gen": 2,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": true,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false
        }
      }
    },
    {
      "name": "",
      "species": "Koraidon",
      "gender": "",
      "item": "Life Orb",
      "ability": "Orichalcum Pulse",
      "level": 50,
      "teraType": "Fire",
      "evs": {
        "hp": 4,
        "atk": 252,
        "def": 0,
        "spa": 0,
        "spd": 0,
        "spe": 252
      },
      "nature": "Jolly",
      "moves": [
        "Flare Blitz",
        "Close Combat",
        "Flame Charge",
        "Protect"
      ],
      "types": [
        "Fighting",
        "Dragon"
      ],
      "pokeapiNum": 1007,
      "movesDetails": {
        "Flare Blitz": {
          "exists": true,
          "num": 394,
          "accuracy": 100,
          "basePower": 120,
          "category": "Physical",
          "name": "Flare Blitz",
          "pp": 15,
          "priority": 0,
          "flags": {
            "contact": 1,
            "protect": 1,
            "mirror": 1,
            "defrost": 1,
            "metronome": 1
          },
          "recoil": [
            33,
            100
          ],
          "secondary": {
            "chance": 10,
            "status": "brn"
          },
          "target": "normal",
          "type": "Fire",
          "desc": "Has a 10% chance to burn the target. If the target lost HP, the user takes recoil damage equal to 33% the HP lost by the target, rounded half up, but not less than 1 HP.",
          "shortDesc": "Has 33% recoil. 10% chance to burn. Thaws user.",
          "id": "flareblitz",
          "fullname": "move: Flare Blitz",
          "effectType": "Move",
          "kind": "Move",
          "gen": 4,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": [
            {
              "chance": 10,
              "status": "brn"
            }
          ],
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 140
          },
          "zMove": {
            "basePower": 190
          }
        },
        "Close Combat": {
          "exists": true,
          "num": 370,
          "accuracy": 100,
          "basePower": 120,
          "category": "Physical",
          "name": "Close Combat",
          "pp": 5,
          "priority": 0,
          "flags": {
            "contact": 1,
            "protect": 1,
            "mirror": 1,
            "metronome": 1
          },
          "self": {
            "boosts": {
              "def": -1,
              "spd": -1
            }
          },
          "secondary": null,
          "target": "normal",
          "type": "Fighting",
          "desc": "Lowers the user's Defense and Special Defense by 1 stage.",
          "shortDesc": "Lowers the user's Defense and Sp. Def by 1.",
          "id": "closecombat",
          "fullname": "move: Close Combat",
          "effectType": "Move",
          "kind": "Move",
          "gen": 4,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 95
          },
          "zMove": {
            "basePower": 190
          }
        },
        "Flame Charge": {
          "exists": true,
          "num": 488,
          "accuracy": 100,
          "basePower": 50,
          "category": "Physical",
          "name": "Flame Charge",
          "pp": 20,
          "priority": 0,
          "flags": {
            "contact": 1,
            "protect": 1,
            "mirror": 1,
            "metronome": 1
          },
          "secondary": {
            "chance": 100,
            "self": {
              "boosts": {
                "spe": 1
              }
            }
          },
          "target": "normal",
          "type": "Fire",
          "desc": "Has a 100% chance to raise the user's Speed by 1 stage.",
          "shortDesc": "100% chance to raise the user's Speed by 1.",
          "id": "flamecharge",
          "fullname": "move: Flame Charge",
          "effectType": "Move",
          "kind": "Move",
          "gen": 5,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": [
            {
              "chance": 100,
              "self": {
                "boosts": {
                  "spe": 1
                }
              }
            }
          ],
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 100
          },
          "zMove": {
            "basePower": 100
          }
        },
        "Protect": {
          "exists": true,
          "num": 182,
          "accuracy": true,
          "basePower": 0,
          "category": "Status",
          "name": "Protect",
          "pp": 10,
          "priority": 4,
          "flags": {
            "noassist": 1,
            "failcopycat": 1
          },
          "stallingMove": true,
          "volatileStatus": "protect",
          "condition": {
            "duration": 1,
            "onTryHitPriority": 3
          },
          "secondary": null,
          "target": "self",
          "type": "Normal",
          "zMove": {
            "effect": "clearnegativeboost"
          },
          "desc": "The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Burning Bulwark, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Silk Trap, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",
          "shortDesc": "Prevents moves from affecting the user this turn.",
          "id": "protect",
          "fullname": "move: Protect",
          "effectType": "Move",
          "kind": "Move",
          "gen": 2,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": true,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false
        }
      }
    },
    {
      "name": "",
      "species": "Flutter Mane",
      "gender": "",
      "item": "Focus Sash",
      "ability": "Protosynthesis",
      "level": 50,
      "shiny": true,
      "teraType": "Fairy",
      "evs": {
        "hp": 0,
        "atk": 0,
        "def": 4,
        "spa": 252,
        "spd": 0,
        "spe": 252
      },
      "nature": "Timid",
      "ivs": {
        "hp": 31,
        "atk": 3,
        "def": 31,
        "spa": 31,
        "spd": 31,
        "spe": 31
      },
      "moves": [
        "Moonblast",
        "Shadow Ball",
        "Icy Wind",
        "Protect"
      ],
      "types": [
        "Ghost",
        "Fairy"
      ],
      "pokeapiNum": 987,
      "movesDetails": {
        "Moonblast": {
          "exists": true,
          "num": 585,
          "accuracy": 100,
          "basePower": 95,
          "category": "Special",
          "name": "Moonblast",
          "pp": 15,
          "priority": 0,
          "flags": {
            "protect": 1,
            "mirror": 1,
            "metronome": 1
          },
          "secondary": {
            "chance": 30,
            "boosts": {
              "spa": -1
            }
          },
          "target": "normal",
          "type": "Fairy",
          "desc": "Has a 30% chance to lower the target's Special Attack by 1 stage.",
          "shortDesc": "30% chance to lower the target's Sp. Atk by 1.",
          "id": "moonblast",
          "fullname": "move: Moonblast",
          "effectType": "Move",
          "kind": "Move",
          "gen": 6,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": [
            {
              "chance": 30,
              "boosts": {
                "spa": -1
              }
            }
          ],
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 130
          },
          "zMove": {
            "basePower": 175
          }
        },
        "Shadow Ball": {
          "exists": true,
          "num": 247,
          "accuracy": 100,
          "basePower": 80,
          "category": "Special",
          "name": "Shadow Ball",
          "pp": 15,
          "priority": 0,
          "flags": {
            "protect": 1,
            "mirror": 1,
            "metronome": 1,
            "bullet": 1
          },
          "secondary": {
            "chance": 20,
            "boosts": {
              "spd": -1
            }
          },
          "target": "normal",
          "type": "Ghost",
          "desc": "Has a 20% chance to lower the target's Special Defense by 1 stage.",
          "shortDesc": "20% chance to lower the target's Sp. Def by 1.",
          "id": "shadowball",
          "fullname": "move: Shadow Ball",
          "effectType": "Move",
          "kind": "Move",
          "gen": 2,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": [
            {
              "chance": 20,
              "boosts": {
                "spd": -1
              }
            }
          ],
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 130
          },
          "zMove": {
            "basePower": 160
          }
        },
        "Icy Wind": {
          "exists": true,
          "num": 196,
          "accuracy": 95,
          "basePower": 55,
          "category": "Special",
          "name": "Icy Wind",
          "pp": 15,
          "priority": 0,
          "flags": {
            "protect": 1,
            "mirror": 1,
            "metronome": 1,
            "wind": 1
          },
          "secondary": {
            "chance": 100,
            "boosts": {
              "spe": -1
            }
          },
          "target": "allAdjacentFoes",
          "type": "Ice",
          "desc": "Has a 100% chance to lower the target's Speed by 1 stage.",
          "shortDesc": "100% chance to lower the foe(s) Speed by 1.",
          "id": "icywind",
          "fullname": "move: Icy Wind",
          "effectType": "Move",
          "kind": "Move",
          "gen": 2,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": [
            {
              "chance": 100,
              "boosts": {
                "spe": -1
              }
            }
          ],
          "hasSheerForce": false,
          "ignoreImmunity": false,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false,
          "maxMove": {
            "basePower": 110
          },
          "zMove": {
            "basePower": 100
          }
        },
        "Protect": {
          "exists": true,
          "num": 182,
          "accuracy": true,
          "basePower": 0,
          "category": "Status",
          "name": "Protect",
          "pp": 10,
          "priority": 4,
          "flags": {
            "noassist": 1,
            "failcopycat": 1
          },
          "stallingMove": true,
          "volatileStatus": "protect",
          "condition": {
            "duration": 1,
            "onTryHitPriority": 3
          },
          "secondary": null,
          "target": "self",
          "type": "Normal",
          "zMove": {
            "effect": "clearnegativeboost"
          },
          "desc": "The user is protected from most attacks made by other Pokemon during this turn. This move has a 1/X chance of being successful, where X starts at 1 and triples each time this move is successfully used. X resets to 1 if this move fails, if the user's last move used is not Baneful Bunker, Burning Bulwark, Detect, Endure, King's Shield, Max Guard, Obstruct, Protect, Quick Guard, Silk Trap, Spiky Shield, or Wide Guard, or if it was one of those moves and the user's protection was broken. Fails if the user moves last this turn.",
          "shortDesc": "Prevents moves from affecting the user this turn.",
          "id": "protect",
          "fullname": "move: Protect",
          "effectType": "Move",
          "kind": "Move",
          "gen": 2,
          "isNonstandard": null,
          "critRatio": 1,
          "secondaries": null,
          "hasSheerForce": false,
          "ignoreImmunity": true,
          "isZ": false,
          "isMax": false,
          "ignoreAbility": false
        }
      }
    }
  ],
  "errors": null,
  "createdAt": "2025-06-18T01:31:36.509Z"
}`;

export interface MoveInfo extends Move {
  effectiveness: number;
  pokemon: string;
}

export interface CoverageForCombinationUnit {
  type1: string;
  type2: string;

  effectiveMovesPhysical: MoveInfo[];
  neutralMovesPhysical: MoveInfo[];
  resistantMovesPhysical: MoveInfo[];
  immuneMovesPhysical: MoveInfo[];

  effectiveMovesSpecial: MoveInfo[];
  neutralMovesSpecial: MoveInfo[];
  resistantMovesSpecial: MoveInfo[];
  immuneMovesSpecial: MoveInfo[];

  level?: string;
  score?: number;

  levelPhysical?: string;
  scorePhysical?: number;

  levelSpecial?: string;
  scoreSpecial?: number;
}

function calculateLevelAndScore(unit: CoverageForCombinationUnit) {
  const numEffectivePhysical = unit.effectiveMovesPhysical.length;
  const numNeutralPhysical = unit.neutralMovesPhysical.length;
  const numResistantPhysical = unit.resistantMovesPhysical.length;

  const numEffectiveSpecial = unit.effectiveMovesSpecial.length;
  const numNeutralSpecial = unit.neutralMovesSpecial.length;
  const numResistantSpecial = unit.resistantMovesSpecial.length;

  if (numEffectivePhysical > 0) {
    unit.levelPhysical = 'Effective';
    unit.scorePhysical = numEffectivePhysical * unit.effectiveMovesPhysical[0].basePower;
  } else if (numNeutralPhysical > 0) {
    unit.levelPhysical = 'Neutral';
    unit.scorePhysical = numNeutralPhysical * unit.neutralMovesPhysical[0].basePower;
  } else if (numResistantPhysical > 0) {
    unit.levelPhysical = 'Resistant';
    unit.scorePhysical = numResistantPhysical * unit.resistantMovesPhysical[0].basePower;
  } else {
    unit.levelPhysical = 'Immune';
    unit.scorePhysical = 0;
  }

  if (numEffectiveSpecial > 0) {
    unit.levelSpecial = 'Effective';
    unit.scoreSpecial = numEffectiveSpecial * unit.effectiveMovesSpecial[0].basePower;
  } else if (numNeutralSpecial > 0) {
    unit.levelSpecial = 'Neutral';
    unit.scoreSpecial = numNeutralSpecial * unit.neutralMovesSpecial[0].basePower;
  } else if (numResistantSpecial > 0) {
    unit.levelSpecial = 'Resistant';
    unit.scoreSpecial = numResistantSpecial * unit.resistantMovesSpecial[0].basePower;
  } else {
    unit.levelSpecial = 'Immune';
    unit.scoreSpecial = 0;
  }

  if (numEffectivePhysical + numEffectiveSpecial > 0) {
    unit.level = 'Effective';
    unit.score = (numEffectivePhysical + numEffectiveSpecial) * Math.max(unit.effectiveMovesPhysical[0]?.basePower ?? 0, unit.effectiveMovesSpecial[0]?.basePower ?? 0);
  } else if (numNeutralPhysical + numNeutralSpecial > 0) {
    unit.level = 'Neutral';
    unit.score = (numNeutralPhysical + numNeutralSpecial) * Math.max(unit.neutralMovesPhysical[0]?.basePower ?? 0, unit.neutralMovesSpecial[0]?.basePower ?? 0);
  } else if (numResistantPhysical + numResistantSpecial > 0) {
    unit.level = 'Resistant';
    unit.score = (numResistantPhysical + numResistantSpecial) * Math.max(unit.resistantMovesPhysical[0]?.basePower ?? 0, unit.resistantMovesSpecial[0]?.basePower ?? 0);
  } else {
    unit.level = 'Immune';
    unit.score = 0;
  }
}

function coverageAnalyze(team: Team) {
  const gen = new Generations(Dex).get(9);
  const types = gen.types;
  // const species = gen.species;
  const allTypes = Array.from(types, (t: any) => t.name).filter((t: any) => t !== 'Stellar');
  // const allTypeCombinations = chooseTwoCombinations(allTypes) as string[][];

  const pokemonList = team.teamData;

  const matrix = new Map<string, Map<string, CoverageForCombinationUnit | null>>();

  for (let i = 0; i < allTypes.length; i++) {
    const type1 = allTypes[i];
    matrix.set(type1, new Map<string, CoverageForCombinationUnit | null>());
    for (let j = 0; j < allTypes.length; j++) {
      const type2 = allTypes[j];
      if (j < i) {
        matrix.get(type1)?.set(type2, null);
        continue;
      } else {
        const unit: CoverageForCombinationUnit = {
          type1,
          type2,
          effectiveMovesPhysical: [],
          neutralMovesPhysical: [],
          resistantMovesPhysical: [],
          immuneMovesPhysical: [],
          effectiveMovesSpecial: [],
          neutralMovesSpecial: [],
          resistantMovesSpecial: [],
          immuneMovesSpecial: [],
        };
        for (const pokemon of pokemonList) {
          const pokemonMoves = pokemon.moves;
          for (const move of pokemonMoves) {
            const moveData = gen.moves.get(move);
            if (moveData && moveData.category !== 'Status') {
              const combanationTypes = j === i ? [type1] : [type1, type2];
              const effectiveness = types.totalEffectiveness(moveData.type, combanationTypes);
              const moveInfo: MoveInfo = {
                ...moveData,
                pokemon: pokemon.species,
                name: moveData.name,
                category: moveData.category,
                effectiveness
              }
              if (effectiveness <= 0) {
                if (moveData.category === 'Physical') {
                  unit.immuneMovesPhysical.push(moveInfo);
                } else {
                  unit.immuneMovesSpecial.push(moveInfo);
                }
              } else if (effectiveness > 0 && effectiveness < 1) {
                if (moveData.category === 'Physical') {
                  unit.resistantMovesPhysical.push(moveInfo);
                } else {
                  unit.resistantMovesSpecial.push(moveInfo);
                }
              } else if (effectiveness === 1) {
                if (moveData.category === 'Physical') {
                  unit.neutralMovesPhysical.push(moveInfo);
                } else {
                  unit.neutralMovesSpecial.push(moveInfo);
                }
              } else {
                if (moveData.category === 'Physical') {
                  unit.effectiveMovesPhysical.push(moveInfo);
                } else {
                  unit.effectiveMovesSpecial.push(moveInfo);
                }
              }
            }
          }
        }
        matrix.get(type1)?.set(type2, unit);
        unit.effectiveMovesPhysical.sort((a, b) => b.basePower - a.basePower);
        unit.effectiveMovesSpecial.sort((a, b) => b.basePower - a.basePower);
        unit.neutralMovesPhysical.sort((a, b) => b.basePower - a.basePower);
        unit.neutralMovesSpecial.sort((a, b) => b.basePower - a.basePower);
        unit.resistantMovesPhysical.sort((a, b) => b.basePower - a.basePower);
        unit.resistantMovesSpecial.sort((a, b) => b.basePower - a.basePower);
        unit.immuneMovesPhysical.sort((a, b) => b.basePower - a.basePower);
        unit.immuneMovesSpecial.sort((a, b) => b.basePower - a.basePower);
        calculateLevelAndScore(unit);
      }
    }
  }

  // Convert the matrix to a serializable object
  const serializableMatrix: Record<string, Record<string, CoverageForCombinationUnit | null>> = {};
  matrix.forEach((typeMap, type1) => {
    serializableMatrix[type1] = {};
    typeMap.forEach((value, type2) => {
      serializableMatrix[type1][type2] = value;
    });
  });
  console.log(JSON.stringify(serializableMatrix, null, 2));
}

coverageAnalyze(JSON.parse(teamString) as Team);
