"use client";

import { useState, useEffect } from "react";
import { Player } from "@/types/player";
import { Role } from "@/enums/role";
import TeamDisplay from "@/components/TeamDisplay";
import PlayerForm from "@/components/PlayerForm";
import { randomizeRoles } from "@/lib/randomizer";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import HistoryList from "@/components/HistoryList";
import { useHistoryStore } from "@/lib/history-store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { META_CHAMPIONS_BY_ROLE } from "@/lib/api";

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [team, setTeam] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState("form");
  const [includeChampions, setIncludeChampions] = useState(false);
  
  const { addEntry } = useHistoryStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPlayers = localStorage.getItem("players");
      if (savedPlayers) {
        setPlayers(JSON.parse(savedPlayers));
      }

      const savedIncludeChampions = localStorage.getItem("includeChampions");
      if (savedIncludeChampions) {
        setIncludeChampions(savedIncludeChampions === "true");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && players.length > 0) {
      localStorage.setItem("players", JSON.stringify(players));
    }
  }, [players]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("includeChampions", String(includeChampions));
    }
  }, [includeChampions]);

  const generateTeam = (playersList: Player[]): Player[] => {
    const updatedPlayers = [...playersList];
    const assignedPlayers = randomizeRoles(updatedPlayers);
    
    if (includeChampions) {
      const usedChampions: Set<string> = new Set();
      
      return assignedPlayers.map(player => {
        if (player.role) {
          const champion = getRandomChampionForRole(player.role, usedChampions);
          if (champion) {
            usedChampions.add(champion);
          }
          
          return {
            ...player,
            champion: champion
          };
        }
        return player;
      });
    }
    
    return assignedPlayers;
  };

  const handleSubmit = (playersList: Player[]) => {
    const generatedTeam = generateTeam(playersList);
    setTeam(generatedTeam);
    
    addEntry({
      timestamp: new Date().getTime(),
      team: generatedTeam,
      includesChampions: includeChampions
    });
  };

  const handleToggleChampions = (include: boolean) => {
    setIncludeChampions(include);
    
    if (team.length > 0) {
      if (include) {
        const usedChampions: Set<string> = new Set();
        
        setTeam(team.map(player => {
          if (player.role) {
            const champion = getRandomChampionForRole(player.role, usedChampions);
            if (champion) {
              usedChampions.add(champion);
            }
            
            return {
              ...player,
              champion: champion
            };
          }
          return player;
        }));
      } else {
        setTeam(team.map(player => ({
          ...player,
          champion: undefined
        })));
      }
    }
  };

  const handleSelectHistoryTeam = (historyTeam: Player[]) => {
    setTeam(historyTeam);
    setActiveTab("form");
  };

  const getRandomChampionForRole = (role: Role, usedChampions: Set<string> = new Set()): string | undefined => {
    const championsForRole = META_CHAMPIONS_BY_ROLE[role] || [];
    
    if (championsForRole.length === 0) {
      console.error(`Aucun champion trouvé pour le rôle ${role}`);
      return undefined;
    }
    
    const availableChampions = championsForRole.filter(champion => !usedChampions.has(champion));
    
    if (availableChampions.length === 0) {
      console.warn(`Tous les champions pour le rôle ${role} ont déjà été assignés`);
      return undefined;
    }
    
    const randomIndex = Math.floor(Math.random() * availableChampions.length);
    return availableChampions[randomIndex];
  };

  return (
    <main className="min-h-screen bg-zinc-900 text-gray-100 p-8">
      <div className="container mx-auto max-w-4xl">
        <Card className="bg-zinc-800 border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-[#3b82f6] flex justify-center items-center gap-3 mb-6">
              <span>Randomiseur de rôles LoL</span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="form" value={activeTab} onValueChange={(value) => setActiveTab(value)}>
              <TabsList className="mb-6 w-full">
                <TabsTrigger value="form" className="flex-1 hover:bg-zinc-700 data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white">
                  Équipe
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 hover:bg-zinc-700 data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white">
                  Historique
                </TabsTrigger>
              </TabsList>

              <TabsContent value="form">
                <PlayerForm 
                  players={players} 
                  setPlayers={setPlayers} 
                  onSubmit={handleSubmit}
                  includeChampions={includeChampions}
                  onToggleChampions={handleToggleChampions}
                />
                
                {team.length > 0 && (
                  <div className="mt-8">
                    <TeamDisplay team={team} includeChampions={includeChampions} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history">
                <HistoryList onSelectTeam={handleSelectHistoryTeam} />
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-center pb-6">
            <p className="text-sm text-gray-500">
              Développé avec ❤️ pour les joueurs de LoL
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
