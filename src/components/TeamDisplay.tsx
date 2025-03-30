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
  const roleOrder = [Role.TOP, Role.JUNGLE, Role.MID, Role.ADC, Role.SUPPORT];
  
  const sortedTeam = [...team].sort((a, b) => {
    if (!a.role || !b.role) return 0;
    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
  });

  const getGridCols = () => {
    const count = team.length;
    if (count <= 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 3) return "grid-cols-1 md:grid-cols-3";
    if (count <= 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-5";
  };

  const roleColors: Record<Role, string> = {
    [Role.TOP]: "bg-amber-500",
    [Role.JUNGLE]: "bg-emerald-500",
    [Role.MID]: "bg-blue-500",
    [Role.ADC]: "bg-rose-500",
    [Role.SUPPORT]: "bg-purple-500"
  };

  const getChampionImageUrl = (champion: string) => {
    return `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${champion}.png`;
  };
  
  const getLolalytics = (champion: string) => {
    return `https://lolalytics.com/lol/${champion.toLowerCase().replace(/[^a-z0-9]/g, '')}/build/`;
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
                  <a 
                    href={getLolalytics(player.champion)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors mt-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Voir le guide sur Lolalytics
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 