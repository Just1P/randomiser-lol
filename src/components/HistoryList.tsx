"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/stores/historyStore";
import { Player } from "@/types/player";
import { Role } from "@/enums/role";
import Image from "next/image";
import { getChampionImageUrl as getChampionImage } from "@/lib/api";

interface HistoryListProps {
  onSelectTeam: (team: Player[]) => void;
}

export default function HistoryList({ onSelectTeam }: HistoryListProps) {
  const { entries, clearHistory, deleteEntry } = useHistoryStore();
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const roleOrder = [Role.TOP, Role.JUNGLE, Role.MID, Role.ADC, Role.SUPPORT];

  const roleColors: Record<Role, string> = {
    [Role.TOP]: "bg-amber-500",
    [Role.JUNGLE]: "bg-emerald-500",
    [Role.MID]: "bg-blue-500",
    [Role.ADC]: "bg-rose-500",
    [Role.SUPPORT]: "bg-purple-500"
  };

  const sortPlayersByRole = (players: Player[]): Player[] => {
    return [...players].sort((a, b) => {
      if (!a.role || !b.role) return 0;
      return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
    });
  };

  if (entries.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center justify-center gap-3">
            Historique
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-zinc-400">Aucune composition d&apos;équipe dans l&apos;historique.</p>
          <p className="text-sm mt-2">Les compositions générées s&apos;afficheront ici.</p>
        </CardContent>
      </Card>
    );
  }

  const toggleExpand = (id: string) => {
    if (expandedEntry === id) {
      setExpandedEntry(null);
    } else {
      setExpandedEntry(id);
    }
  };

  const getPlayerCountInfo = (players: Player[]): string => {
    return `${players.length} joueur${players.length > 1 ? 's' : ''}`;
  };
  
  const getLolalytics = (champion: string): string => {
    return `https://lolalytics.com/lol/${champion.toLowerCase().replace(/[^a-z0-9]/g, '')}/build/`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4 border-b border-zinc-700 bg-zinc-800">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">
            Historique
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs bg-zinc-700 hover:bg-zinc-600 border-zinc-600"
            onClick={() => clearHistory()}
          >
            Tout effacer
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-zinc-700">
          {entries.map((entry) => {
            const sortedPlayers = sortPlayersByRole(entry.players.map(p => ({
              ...p,
              id: `${p.name}-${p.role || 'unknown'}-${entry.id}`
            } as Player)));
            
            return (
              <li key={entry.id} className="px-4 py-3 hover:bg-zinc-700/50 transition-colors">
                <div className="flex justify-between items-center">
                  <div 
                    className="flex-1 cursor-pointer" 
                    onClick={() => toggleExpand(entry.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        {entry.date}
                      </p>
                      <span className="text-xs text-zinc-400">
                        {getPlayerCountInfo(sortedPlayers)}
                      </span>
                    </div>
                    
                    <div className="flex mt-1.5 gap-1.5">
                      {sortedPlayers.map((player: Player) => (
                        <div 
                          key={player.id} 
                          className="w-8 h-8 flex items-center justify-center rounded-full text-xs bg-zinc-800 relative border border-zinc-700"
                          title={`${player.name} - ${player.role}`}
                        >
                          {player.role && (
                            <span className={`w-2 h-2 rounded-full absolute top-0 right-0 ${roleColors[player.role]}`}></span>
                          )}
                          {player.name.substring(0, 1).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-2">
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 hover:bg-zinc-700 text-blue-400 hover:text-blue-300"
                      onClick={() => onSelectTeam(sortedPlayers)}
                      title="Réutiliser cette composition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M9 20v-4M15 20v-2M5 20v-9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9"/><path d="M5 11V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/></svg>
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-zinc-700"
                      onClick={() => deleteEntry(entry.id)}
                      title="Supprimer de l'historique"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </Button>
                  </div>
                </div>
                
                {expandedEntry === entry.id && (
                  <div className="mt-3 pt-3 border-t border-zinc-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {sortedPlayers.map((player: Player) => (
                      <div key={player.id} className="flex flex-col bg-zinc-800 p-2 rounded border border-zinc-700">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{player.name}</span>
                          {player.role && (
                            <span className={`text-xs ${roleColors[player.role]} py-0.5 px-1.5 rounded-sm text-black`}>
                              {player.role}
                            </span>
                          )}
                        </div>
                        
                        {player.champion && (
                          <div className="mt-2 flex flex-col">
                            <div className="flex items-center gap-2">
                              <div className="relative w-8 h-8 overflow-hidden rounded">
                                <Image 
                                  src={getChampionImage(player.champion)}
                                  alt={player.champion}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              </div>
                              <span className="text-xs">{player.champion}</span>
                            </div>
                            <a 
                              href={getLolalytics(player.champion)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors mt-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                              Guide Lolalytics
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
} 