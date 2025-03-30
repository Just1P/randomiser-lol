import { Role } from './constants';

// Types pour les champions de l'API Riot
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
  tags: string[]; // rôles du champion (Fighter, Tank, Mage, etc.)
}

// Type étendu avec le rôle assigné
export interface ChampionWithRole extends Champion {
  assignedRole: Role;
}

export type ChampionsData = Record<string, Champion>;

// Champions par rôle selon la méta actuelle (basé sur les captures d'écran)
const META_CHAMPIONS_BY_ROLE: Record<Role, string[]> = {
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

// URL de base pour l'API Ddragon (ne nécessite pas de clé API)
const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com/cdn';

// Fonction pour obtenir la dernière version de l'API
export async function getLatestVersion(): Promise<string> {
  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await response.json();
    return versions[0]; // Première version est la plus récente
  } catch (error) {
    console.error('Erreur lors de la récupération de la version:', error);
    return '14.10.1'; // Version de secours
  }
}

// Fonction pour récupérer tous les champions
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

// Fonction pour trouver un champion par son nom (insensible à la casse)
function findChampionByName(champions: ChampionsData, name: string): Champion | null {
  const normalizedName = name.toLowerCase().trim();
  
  // Correspondance exacte d'abord (insensible à la casse)
  for (const champId in champions) {
    const champion = champions[champId];
    if (champion.name.toLowerCase() === normalizedName) {
      return champion;
    }
  }
  
  // Cas spéciaux pour les champions dont le nom peut varier
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
  
  // Vérifier si c'est un cas spécial
  for (const [standardName, alternatives] of Object.entries(specialCases)) {
    if (standardName === normalizedName || alternatives.includes(normalizedName)) {
      // Rechercher par nom standard ou par alternative
      const searchName = standardName.includes("'") 
        ? standardName.replace(/'/g, "") // Supprimer les apostrophes
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
  
  // Si aucune correspondance n'est trouvée, essayer une recherche partielle
  for (const champId in champions) {
    const champion = champions[champId];
    const champNameLower = champion.name.toLowerCase();
    
    // Chercher si le nom normalisé est contenu dans le nom du champion,
    // ou si le nom du champion est contenu dans le nom normalisé
    if (champNameLower.includes(normalizedName) || normalizedName.includes(champNameLower)) {
      return champion;
    }
  }
  
  // Si toujours aucune correspondance, log et retourne null
  console.warn(`Champion non trouvé: "${name}"`);
  return null;
}

// Fonction pour obtenir les champions par rôle selon la méta actuelle
export async function getChampionsByRole(role: Role): Promise<ChampionWithRole[]> {
  const allChampions = await getAllChampions();
  const metaChampionNames = META_CHAMPIONS_BY_ROLE[role];
  const roleChampions: ChampionWithRole[] = [];
  
  console.log(`Récupération des champions pour le rôle ${role}. Total dans la liste: ${metaChampionNames.length}`);
  
  for (const name of metaChampionNames) {
    const champion = findChampionByName(allChampions, name);
    if (champion) {
      // Convertir en ChampionWithRole
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

// Fonction pour récupérer les URL d'images des champions
export function getChampionImageUrl(championId: string, version?: string): string {
  const v = version || '14.10.1';
  return `${DDRAGON_BASE_URL}/${v}/img/champion/${championId}.png`;
} 