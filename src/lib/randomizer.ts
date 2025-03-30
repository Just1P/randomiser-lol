import { Role } from "@/enums/role";
import { Player } from "@/types/player";

/**
 * Randomly assigns roles to players
 */
export function randomizeRoles(players: Player[]): Player[] {
  // Check if there's at least one player
  if (players.length === 0) {
    throw new Error("L'équipe doit avoir au moins un joueur");
  }
  
  // Check maximum number of players
  if (players.length > 5) {
    throw new Error("Une équipe ne peut pas avoir plus de 5 joueurs");
  }

  // Get the appropriate number of roles based on player count
  const allRoles = Object.values(Role);
  const availableRoles = [...allRoles].slice(0, players.length);
  
  // Fisher-Yates shuffle algorithm
  for (let i = availableRoles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableRoles[i], availableRoles[j]] = [availableRoles[j], availableRoles[i]];
  }
  
  // Assign roles to players
  return players.map((player, index) => ({
    ...player,
    role: availableRoles[index]
  }));
} 