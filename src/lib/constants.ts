export const ROLES = [
  "TOP",
  "JUNGLE",
  "MID",
  "ADC",
  "SUPPORT"
] as const;

export type Role = typeof ROLES[number];

export const ROLE_COLORS: Record<Role, string> = {
  TOP: "top",
  JUNGLE: "jungle",
  MID: "mid",
  ADC: "adc",
  SUPPORT: "support"
};

// Example champions for each role
export const CHAMPIONS_BY_ROLE: Record<Role, string[]> = {
  TOP: [
    "Aatrox", "Camille", "Darius", "Fiora", "Garen", 
    "Irelia", "Jax", "Kayle", "Malphite", "Mordekaiser", 
    "Nasus", "Ornn", "Poppy", "Renekton", "Riven", 
    "Sett", "Shen", "Teemo", "Urgot", "Volibear"
  ],
  JUNGLE: [
    "Amumu", "Bel'Veth", "Diana", "Ekko", "Elise", 
    "Evelynn", "Fiddle", "Graves", "Hecarim", "Jarvan IV", 
    "Karthus", "Kayn", "Kindred", "Lee Sin", "Master Yi", 
    "Nidalee", "Nunu", "Rek'Sai", "Sejuani", "Warwick"
  ],
  MID: [
    "Ahri", "Akali", "Anivia", "Annie", "Azir", 
    "Cassiopeia", "Fizz", "Galio", "Kassadin", "Katarina", 
    "LeBlanc", "Lissandra", "Lux", "Malzahar", "Orianna", 
    "Syndra", "Talon", "Veigar", "Viktor", "Zed"
  ],
  ADC: [
    "Aphelios", "Ashe", "Caitlyn", "Draven", "Ezreal", 
    "Jhin", "Jinx", "Kai'Sa", "Kalista", "Kog'Maw", 
    "Lucian", "Miss Fortune", "Samira", "Senna", "Sivir", 
    "Tristana", "Twitch", "Varus", "Vayne", "Xayah"
  ],
  SUPPORT: [
    "Alistar", "Bard", "Blitzcrank", "Braum", "Janna", 
    "Karma", "Leona", "Lulu", "Morgana", "Nami", 
    "Nautilus", "Pyke", "Rakan", "Sona", "Soraka", 
    "Thresh", "Yuumi", "Zyra", "Zilean", "Seraphine"
  ]
}; 