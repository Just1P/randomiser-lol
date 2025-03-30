import { Role } from "@/enums/role";
import { Player } from "@/types/player";

/**
 * Randomly assigns roles to players
 */
export function randomizeRoles(players: Player[]): Player[] {
  if (players.length === 0) {
    throw new Error("L'équipe doit avoir au moins un joueur");
  }
  
  if (players.length > 5) {
    throw new Error("Une équipe ne peut pas avoir plus de 5 joueurs");
  }

  const allRoles = Object.values(Role);
  const availableRoles = [...allRoles].slice(0, players.length);
  
  for (let i = availableRoles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableRoles[i], availableRoles[j]] = [availableRoles[j], availableRoles[i]];
  }
  
  return players.map((player, index) => ({
    ...player,
    role: availableRoles[index]
  }));
} 