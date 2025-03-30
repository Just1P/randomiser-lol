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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <main className="min-h-screen text-gray-100 p-4 md:p-8 relative overflow-hidden bg-zinc-900">
      <motion.div 
        className="container mx-auto max-w-4xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-zinc-800/70 backdrop-blur-xl border-none shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="border-b border-zinc-700/40 pb-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <CardTitle className="text-3xl sm:text-4xl font-bold text-center text-[#3b82f6] flex justify-center items-center gap-3 mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                  Randomiseur de rôles LoL
                </span>
              </CardTitle>
              <p className="text-center text-zinc-400 text-sm">
                Générez aléatoirement des rôles et des champions pour votre équipe
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            <Tabs defaultValue="form" value={activeTab} onValueChange={(value) => setActiveTab(value)}>
              <TabsList className="mb-6 w-full bg-zinc-700/50 p-1">
                <TabsTrigger 
                  value="form" 
                  className="flex-1 rounded-md data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white hover:text-white transition-all"
                >
                  Équipe
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex-1 rounded-md data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white hover:text-white transition-all"
                >
                  Historique
                </TabsTrigger>
              </TabsList>

              <TabsContent value="form">
                <div className="mb-4 flex justify-center">
                  <Link href="/rooms" passHref>
                    <Button variant="outline" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      Mode multijoueur
                    </Button>
                  </Link>
                </div>
                
                <PlayerForm 
                  players={players} 
                  setPlayers={setPlayers} 
                  onSubmit={handleSubmit}
                  includeChampions={includeChampions}
                  onToggleChampions={handleToggleChampions}
                />
                
                {team.length > 0 && (
                  <motion.div 
                    className="mt-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TeamDisplay team={team} includeChampions={includeChampions} />
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="history">
                <HistoryList onSelectTeam={handleSelectHistoryTeam} />
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-center pb-6 border-t border-zinc-700/40 pt-4">
            <p className="text-sm text-zinc-400">
              Développé avec ❤️ pour les joueurs de LoL
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </main>
  );
}
