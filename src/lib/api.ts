import { Role } from './constants';

export interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
    sprite: string;
    group: string;
  };
  tags: string[];
}

export interface ChampionWithRole extends Champion {
  assignedRole: Role;
}

export type ChampionsData = Record<string, Champion>;

export const META_CHAMPIONS_BY_ROLE: Record<Role, string[]> = {
  TOP: [
    "Aatrox", "Ambessa", "Camille", "Cho'Gath", "Darius", 
    "Dr. Mundo", "Fiora", "Gangplank", "Garen", "Gnar", 
    "Gragas", "Gwen", "Heimerdinger", "Illaoi", "Irelia", 
    "Jax", "Jayce", "Kayle", "Kennen", "Kled", 
    "K'Sante", "Malphite", "Mordekaiser", "Nasus", "Olaf", 
    "Ornn", "Pantheon", "Quinn", "Renekton", "Riven", 
    "Rumble", "Sett", "Shen", "Singed", "Sion", 
    "Teemo", "Trundle", "Tryndamere", "Urgot", "Vladimir", 
    "Volibear", "Warwick", "Wukong", "Yasuo", "Yorick", 
    "Yone"
  ],
  JUNGLE: [
    "Amumu", "Bel'Veth", "Briar", "Darius", "Diana",
    "Ekko", "Elise", "Evelynn", "Fiddlesticks", "Gragas",
    "Graves", "Hecarim", "Ivern", "Jarvan IV", "Karthus",
    "Kayn", "Kha'Zix", "Kindred", "Lee Sin", "Lillia",
    "Master Yi", "Nidalee", "Nocturne", "Nunu & Willump", "Pantheon",
    "Rammus", "Rek'Sai", "Rengar", "Sejuani", "Shaco",
    "Shyvana", "Skarner", "Talon", "Udyr", "Vi",
    "Viego", "Volibear", "Warwick", "Wukong", "Xin Zhao",
    "Zac", "Zed", "Zyra"
  ],
  MID: [
    "Ahri", "Akali", "Akshan", "Anivia", "Annie",
    "Aurelion Sol", "Aurora", "Azir", "Cassiopeia", "Cho'Gath",
    "Diana", "Ekko", "Fizz", "Galio", "Hwei",
    "Irelia", "Kassadin", "Katarina", "LeBlanc", "Lissandra",
    "Lux", "Malzahar", "Mel", "Naafiri", "Orianna",
    "Qiyana", "Ryze", "Sylas", "Syndra", "Taliyah",
    "Talon", "Twisted Fate", "Veigar", "Vex", "Viktor",
    "Vladimir", "Xerath", "Yasuo", "Yone", "Zed",
    "Zoe"
  ],
  ADC: [
    "Aphelios", "Ashe", "Caitlyn", "Corki", "Draven",
    "Ezreal", "Jhin", "Jinx", "Kai'Sa", "Kalista",
    "Kog'Maw", "Lucian", "Mel", "Miss Fortune", "Nilah",
    "Samira", "Sivir", "Smolder", "Tristana", "Twitch",
    "Varus", "Vayne", "Xayah", "Zeri", "Ziggs"
  ],
  SUPPORT: [
    "Alistar", "Bard", "Blitzcrank", "Brand", "Braum",
    "Elise", "Janna", "Karma", "Leona", "Lulu",
    "Lux", "Maokai", "Mel", "Milio", "Morgana",
    "Nami", "Nautilus", "Neeko", "Pantheon", "Poppy",
    "Pyke", "Rakan", "Rell", "Renata Glasc", "Senna",
    "Seraphine", "Sona", "Soraka", "Swain", "Tahm Kench",
    "Taric", "Thresh", "Vel'Koz", "Xerath", "Yuumi",
    "Zilean", "Zyra"
  ]
};

const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com/cdn';

const CHAMPION_IMAGE_MAPPING: Record<string, string> = {
  "Aurelion Sol": "AurelionSol",
  "Bel'Veth": "Belveth",
  "Cho'Gath": "Chogath",
  "Dr. Mundo": "DrMundo",
  "Jarvan IV": "JarvanIV",
  "K'Sante": "KSante",
  "Kai'Sa": "Kaisa",
  "Kha'Zix": "Khazix",
  "Kog'Maw": "KogMaw",
  "LeBlanc": "Leblanc",
  "Lee Sin": "LeeSin",
  "Master Yi": "MasterYi",
  "Miss Fortune": "MissFortune",
  "Nunu & Willump": "Nunu",
  "Rek'Sai": "RekSai",
  "Renata Glasc": "Renata",
  "Tahm Kench": "TahmKench",
  "Twisted Fate": "TwistedFate",
  "Vel'Koz": "Velkoz",
  "Xin Zhao": "XinZhao",
  "Wukong": "MonkeyKing"
};

export async function getLatestVersion(): Promise<string> {
  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await response.json();
    return versions[0];
  } catch (error) {
    console.error('Erreur lors de la récupération de la version:', error);
    return '14.10.1';
  }
}

export async function getAllChampions(): Promise<ChampionsData> {
  try {
    const version = await getLatestVersion();
    const response = await fetch(`${DDRAGON_BASE_URL}/${version}/data/fr_FR/champion.json`);
    const data = await response.json();
    return data.data as ChampionsData;
  } catch (error) {
    console.error('Erreur lors de la récupération des champions:', error);
    throw new Error('Impossible de récupérer les champions');
  }
}

function findChampionByName(champions: ChampionsData, name: string): Champion | null {
  const normalizedName = name.toLowerCase().trim();
  
 
  for (const champId in champions) {
    const champion = champions[champId];
    if (champion.name.toLowerCase() === normalizedName) {
      return champion;
    }
  }
  
 
  const specialCases: Record<string, string[]> = {
    "nunu & willump": ["nunu"],
    "renata glasc": ["renata"],
    "dr. mundo": ["mundo", "dr mundo"],
    "aurelion sol": ["asol"],
    "master yi": ["yi"],
    "tahm kench": ["tahm"],
    "twisted fate": ["tf"],
    "vel'koz": ["velkoz"],
    "rek'sai": ["reksai"],
    "k'sante": ["ksante"],
    "bel'veth": ["belveth"],
    "kha'zix": ["khazix"],
    "cho'gath": ["chogath"]
  };
  
 
  for (const [standardName, alternatives] of Object.entries(specialCases)) {
    if (standardName === normalizedName || alternatives.includes(normalizedName)) {
     
      const searchName = standardName.includes("'") 
        ? standardName.replace(/'/g, "")
        : standardName;
        
      for (const champId in champions) {
        const champion = champions[champId];
        const champNameLower = champion.name.toLowerCase();
        
        if (champNameLower.includes(searchName) || 
            alternatives.some(alt => champNameLower.includes(alt))) {
          return champion;
        }
      }
    }
  }
  
 
  for (const champId in champions) {
    const champion = champions[champId];
    const champNameLower = champion.name.toLowerCase();
    
   
   
    if (champNameLower.includes(normalizedName) || normalizedName.includes(champNameLower)) {
      return champion;
    }
  }
  
 
  console.warn(`Champion non trouvé: "${name}"`);
  return null;
}

export async function getChampionsByRole(role: Role): Promise<ChampionWithRole[]> {
  const allChampions = await getAllChampions();
  const metaChampionNames = META_CHAMPIONS_BY_ROLE[role];
  const roleChampions: ChampionWithRole[] = [];
  
  console.log(`Récupération des champions pour le rôle ${role}. Total dans la liste: ${metaChampionNames.length}`);
  
  for (const name of metaChampionNames) {
    const champion = findChampionByName(allChampions, name);
    if (champion) {
     
      const championWithRole: ChampionWithRole = {
        ...champion,
        assignedRole: role
      };
      roleChampions.push(championWithRole);
    } else {
      console.warn(`Champion ${name} non trouvé pour le rôle ${role}`);
    }
  }
  
  console.log(`Champions trouvés pour ${role}: ${roleChampions.length}/${metaChampionNames.length}`);
  return roleChampions;
}

export function getChampionImageUrl(championName: string, version?: string): string {
  const v = version || '14.10.1';
  
  let imageId = CHAMPION_IMAGE_MAPPING[championName];
  
  if (!imageId) {
    imageId = championName
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('')
      .replace(/['\.]/g, '');
  }
  
  return `${DDRAGON_BASE_URL}/${v}/img/champion/${imageId}.png`;
} 