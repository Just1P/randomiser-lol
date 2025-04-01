"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player } from "@/types/player";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";

interface PlayerFormProps {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  onSubmit: (players: Player[]) => void;
  includeChampions: boolean;
  onToggleChampions: (include: boolean) => void;
  isRoom?: boolean;
  currentUser?: string;
  isLoading?: boolean;
}


const MAX_PLAYERS = 5;

export default function PlayerForm({ 
  players, 
  setPlayers, 
  onSubmit, 
  includeChampions, 
  onToggleChampions,
  isRoom = false,
  currentUser = "",
  isLoading = false
}: PlayerFormProps) {
  const allPlayersRef = useRef<Player[]>(players.length > 0 ? 
    [...players] : 
    Array(MAX_PLAYERS).fill(null).map(() => ({ id: uuidv4(), name: "" }))
  );
  
  const [playerCount, setPlayerCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedCount = localStorage.getItem("playerCount");
      return savedCount ? parseInt(savedCount) : 5;
    }
    return 5;
  });

  const [displayedPlayers, setDisplayedPlayers] = useState<Player[]>(() => {
    if (players.length > 0) {
      const allPlayers = [...players];
      
      while (allPlayers.length < MAX_PLAYERS) {
        allPlayers.push({ id: uuidv4(), name: "" });
      }
      
      allPlayersRef.current = allPlayers;
      
      return allPlayers.slice(0, playerCount);
    }
    
    return Array(playerCount).fill(null).map(() => ({ id: uuidv4(), name: "" }));
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setDisplayedPlayers(allPlayersRef.current.slice(0, playerCount));
    
    if (typeof window !== 'undefined') {
      localStorage.setItem("playerCount", playerCount.toString());
    }
  }, [playerCount]);

  const handlePlayerNameChange = (index: number, name: string) => {
    const newDisplayedPlayers = [...displayedPlayers];
    newDisplayedPlayers[index] = { ...newDisplayedPlayers[index], name };
    setDisplayedPlayers(newDisplayedPlayers);
    
    const allPlayers = [...allPlayersRef.current];
    allPlayers[index] = { ...allPlayers[index], name };
    allPlayersRef.current = allPlayers;
    
    setPlayers(allPlayers.slice(0, playerCount));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (displayedPlayers.some(player => !player.name.trim())) {
      setErrorMessage("Veuillez entrer tous les noms des joueurs");
      return;
    }
    
    const uniqueNames = new Set(displayedPlayers.map(player => player.name.trim()));
    if (uniqueNames.size !== displayedPlayers.length) {
      setErrorMessage("Tous les noms des joueurs doivent être uniques");
      return;
    }
    
    onSubmit(displayedPlayers);
  };

  const handlePlayerCountChange = (count: number) => {
    if (count >= 1 && count <= MAX_PLAYERS) {
      console.log("Changing player count to:", count);
      setPlayerCount(count);
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="pb-4 border-b border-zinc-700 bg-zinc-800">
        <CardTitle className="text-xl font-semibold flex items-center justify-center gap-3">
          <div className="glass-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          {isRoom ? "Joueurs dans la room" : "Configurer l'équipe"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {errorMessage && (
          <div data-testid="error-message" className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
            {errorMessage}
          </div>
        )}
        <div className="mb-6 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Nombre de joueurs:</span>
            <div className="flex border border-zinc-700 rounded-md overflow-hidden">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  type="button"
                  data-testid={`player-count-${count}`}
                  className={`px-3 py-1.5 min-w-10 text-sm ${
                    playerCount === count 
                      ? "bg-blue-500 text-white font-medium" 
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                  onClick={() => handlePlayerCountChange(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedPlayers.map((player, index) => (
              <div key={player.id} className="space-y-2">
                <label htmlFor={`player-${index}`} className="text-sm font-medium flex items-center">
                  Joueur {index + 1}
                  {isRoom && player.name === currentUser && (
                    <span className="ml-2 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">Vous</span>
                  )}
                </label>
                <Input
                  id={`player-${index}`}
                  data-testid={`player-input-${index + 1}`}
                  value={player.name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  placeholder={`Nom du joueur ${index + 1}`}
                  className="bg-zinc-800 border-zinc-700"
                  disabled={isRoom && player.name !== "" && player.name !== currentUser}
                />
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="champions-mode"
              data-testid="champions-mode-switch"
              checked={includeChampions}
              onCheckedChange={onToggleChampions}
            />
            <Label htmlFor="champions-mode">Inclure des champions aléatoires</Label>
          </div>

          <div className="flex justify-center mt-6">
            <Button 
              type="submit" 
              data-testid="generate-team-button"
              className="bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-all font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Génération en cours..." : "Générer l'équipe"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 