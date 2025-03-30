"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player } from "@/types/player";
import { Role } from "@/enums/role";
import Image from "next/image";

interface TeamDisplayProps {
  team: Player[];
  includeChampions: boolean;
}

export default function TeamDisplay({ team, includeChampions }: TeamDisplayProps) {
  // Sort players by role order (TOP, JUNGLE, MID, ADC, SUPPORT)
  const roleOrder = [Role.TOP, Role.JUNGLE, Role.MID, Role.ADC, Role.SUPPORT];
  
  const sortedTeam = [...team].sort((a, b) => {
    if (!a.role || !b.role) return 0;
    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
  });

  // Calculate optimal grid columns based on team size
  const getGridCols = () => {
    const count = team.length;
    if (count <= 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 3) return "grid-cols-1 md:grid-cols-3";
    if (count <= 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-5";
  };

  // Role color mapping
  const roleColors: Record<Role, string> = {
    [Role.TOP]: "bg-amber-500",
    [Role.JUNGLE]: "bg-emerald-500",
    [Role.MID]: "bg-blue-500",
    [Role.ADC]: "bg-rose-500",
    [Role.SUPPORT]: "bg-purple-500"
  };

  // Helper function to get champion image URL (placeholder)
  const getChampionImageUrl = (champion: string) => {
    return `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${champion}.png`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          <span className="text-[#3b82f6]">Équipe</span> générée
        </h2>
        <p className="text-zinc-400 text-sm">
          {team.length} joueur{team.length > 1 ? 's' : ''} avec des rôles aléatoires
        </p>
      </div>
      
      <div className={`grid ${getGridCols()} gap-4`}>
        {sortedTeam.map((player) => (
          <Card key={player.id} className="overflow-hidden bg-zinc-700 border-[#3b82f6]/30 border">
            <CardHeader className="p-4 pb-2 border-b border-zinc-600 bg-zinc-800">
              <CardTitle className="text-base font-semibold">
                {player.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col h-full">
              {player.role && (
                <div className={`px-2 py-1 rounded text-xs font-medium inline-block mb-3 text-black ${roleColors[player.role]}`}>
                  {player.role}
                </div>
              )}
              {includeChampions && player.champion && (
                <div className="mt-2 flex-grow">
                  <div className="relative w-full h-32 mb-3 overflow-hidden rounded">
                    <Image 
                      src={getChampionImageUrl(player.champion)}
                      alt={player.champion}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform hover:scale-110 duration-300"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <p className="absolute bottom-2 left-2 text-sm font-medium">
                      {player.champion}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 