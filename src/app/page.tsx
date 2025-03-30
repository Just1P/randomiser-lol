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

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [team, setTeam] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState("form");
  const [includeChampions, setIncludeChampions] = useState(false);
  
  const { addEntry } = useHistoryStore();

  // Load saved players and champion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load player data if exists
      const savedPlayers = localStorage.getItem("players");
      if (savedPlayers) {
        setPlayers(JSON.parse(savedPlayers));
      }

      // Load champions preference if exists
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
    // For each player in our list, randomize a role
    const assignedPlayers = randomizeRoles(updatedPlayers);
    
    // For each player, get a champion based on their role if includeChampions is true
    if (includeChampions) {
      return assignedPlayers.map(player => {
        if (player.role) {
          return {
            ...player,
            champion: getRandomChampionForRole(player.role)
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
    
    // Add to history
    addEntry({
      timestamp: new Date().getTime(),
      team: generatedTeam,
      includesChampions: includeChampions
    });
  };

  const handleToggleChampions = (include: boolean) => {
    setIncludeChampions(include);
    
    // If champions are toggled on, regenerate the team with champions
    if (team.length > 0) {
      if (include) {
        // Add champions to existing team
        setTeam(team.map(player => {
          if (player.role) {
            return {
              ...player,
              champion: getRandomChampionForRole(player.role)
            };
          }
          return player;
        }));
      } else {
        // Remove champions from existing team
        setTeam(team.map(player => ({
          ...player,
          champion: undefined
        })));
      }
    }
  };

  const handleSelectHistoryTeam = (historyTeam: Player[]) => {
    setTeam(historyTeam);
    setActiveTab("form"); // Switch back to form tab to see the team
  };

  const getRandomChampionForRole = (role: Role): string => {
    // These are placeholder champion lists - in a real app, you would have a more complete list
    const champions: Record<Role, string[]> = {
      [Role.TOP]: ["Darius", "Fiora", "Garen", "Jax", "Malphite"],
      [Role.JUNGLE]: ["Lee Sin", "Elise", "Vi", "Warwick", "Zac"],
      [Role.MID]: ["Ahri", "LeBlanc", "Syndra", "Zed", "Yasuo"],
      [Role.ADC]: ["Ashe", "Caitlyn", "Ezreal", "Jinx", "Jhin"],
      [Role.SUPPORT]: ["Leona", "Lulu", "Morgana", "Thresh", "Pyke"]
    };
    
    const championsForRole = champions[role];
    const randomIndex = Math.floor(Math.random() * championsForRole.length);
    return championsForRole[randomIndex];
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
