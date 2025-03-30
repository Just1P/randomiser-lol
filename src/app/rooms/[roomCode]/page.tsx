"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PlayerForm from "@/components/PlayerForm";
import TeamDisplay from "@/components/TeamDisplay";
import { Player } from "@/types/player";
import { Role } from "@/enums/role";
import { Room, subscribeToRoom, updatePlayersInRoom, updateGeneratedTeam, updateIncludeChampions } from "@/lib/rooms";
import { randomizeRoles } from "@/lib/randomizer";
import { META_CHAMPIONS_BY_ROLE } from "@/lib/api";
import { FirebaseError } from "firebase/app";

export default function RoomPage() {
  // Utiliser useParams pour récupérer le code de la room
  const params = useParams();
  const roomCode = params?.roomCode as string;
  
  const router = useRouter();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [generatingTeam, setGeneratingTeam] = useState(false);
  
  useEffect(() => {
    if (!roomCode) {
      router.push("/rooms");
      return;
    }
    
    // Vérifier si l'utilisateur a un nom
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      router.push("/rooms");
      return;
    }
    
    setUsername(storedUsername);
    
    // S'abonner aux mises à jour de la room
    const unsubscribe = subscribeToRoom(roomCode, (roomData) => {
      setRoom(roomData);
      setLoading(false);
    });
    
    return () => {
      unsubscribe();
    };
  }, [roomCode, router]);
  
  const handleUpdatePlayers = async (playersList: Player[]) => {
    try {
      await updatePlayersInRoom(roomCode, playersList);
    } catch (error: unknown) {
      console.error("Erreur lors de la mise à jour des joueurs:", error);
      if (error instanceof FirebaseError) {
        setError(`Erreur Firebase: ${error.message}`);
      } else {
        setError("Impossible de mettre à jour les joueurs. Veuillez réessayer.");
      }
    }
  };
  
  const handleGenerateTeam = async () => {
    if (!room || !room.players || room.players.length < 1) {
      setError("Ajoutez des joueurs avant de générer une équipe");
      return;
    }
    
    setGeneratingTeam(true);
    setError("");
    
    try {
      const generatedTeam = generateTeam(room.players);
      await updateGeneratedTeam(roomCode, generatedTeam);
    } catch (error: unknown) {
      console.error("Erreur lors de la génération de l'équipe:", error);
      if (error instanceof FirebaseError) {
        setError(`Erreur Firebase: ${error.message}`);
      } else {
        setError("Impossible de générer l'équipe. Veuillez réessayer.");
      }
    } finally {
      setGeneratingTeam(false);
    }
  };
  
  const handleToggleChampions = async (include: boolean) => {
    try {
      await updateIncludeChampions(roomCode, include);
      
      // Mettre à jour l'équipe générée si elle existe déjà
      if (room?.generatedTeam && room.generatedTeam.length > 0) {
        const updatedTeam = include 
          ? room.generatedTeam.map(player => {
              if (player.role) {
                const usedChampions: Set<string> = new Set();
                return {
                  ...player,
                  champion: getRandomChampionForRole(player.role, usedChampions)
                };
              }
              return player;
            })
          : room.generatedTeam.map(player => ({
              ...player,
              champion: undefined
            }));
            
        await updateGeneratedTeam(roomCode, updatedTeam);
      }
    } catch (error: unknown) {
      console.error("Erreur lors de la mise à jour des options:", error);
      if (error instanceof FirebaseError) {
        setError(`Erreur Firebase: ${error.message}`);
      } else {
        setError("Impossible de mettre à jour les options. Veuillez réessayer.");
      }
    }
  };
  
  const generateTeam = (playersList: Player[]): Player[] => {
    const updatedPlayers = [...playersList];
    const assignedPlayers = randomizeRoles(updatedPlayers);
    
    if (room?.includeChampions) {
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
  
  const getRandomChampionForRole = (role: Role, usedChampions: Set<string> = new Set()): string | undefined => {
    const championsForRole = META_CHAMPIONS_BY_ROLE[role as keyof typeof META_CHAMPIONS_BY_ROLE] || [];
    
    if (championsForRole.length === 0) {
      console.error(`Aucun champion trouvé pour le rôle ${role}`);
      return undefined;
    }
    
    // Filtrer les champions déjà utilisés
    const availableChampions = championsForRole.filter((champion: string) => !usedChampions.has(champion));
    
    // S'il ne reste plus de champions disponibles pour ce rôle, retourner undefined
    if (availableChampions.length === 0) {
      console.warn(`Tous les champions pour le rôle ${role} ont déjà été assignés`);
      return undefined;
    }
    
    // Sélectionner un champion aléatoire parmi les disponibles
    const randomIndex = Math.floor(Math.random() * availableChampions.length);
    return availableChampions[randomIndex];
  };
  
  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-900 text-gray-100 p-8">
        <div className="container mx-auto max-w-4xl text-center">
          <p>Chargement de la room...</p>
        </div>
      </main>
    );
  }
  
  if (!room) {
    return (
      <main className="min-h-screen bg-zinc-900 text-gray-100 p-8">
        <div className="container mx-auto max-w-4xl text-center">
          <p>Room introuvable. Le code est peut-être incorrect.</p>
          <Button 
            className="mt-4 bg-[#3b82f6] hover:bg-blue-600" 
            onClick={() => router.push("/rooms")}
          >
            Retour
          </Button>
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-zinc-900 text-gray-100 p-8">
      <div className="container mx-auto max-w-4xl">
        <Card className="bg-zinc-800 border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-[#3b82f6] flex flex-col gap-2 mb-6">
              <span>Randomiseur de rôles LoL</span>
              <div className="flex items-center justify-center gap-2 text-xl">
                <span className="text-gray-400">Room:</span>
                <span className="font-mono bg-zinc-700 px-3 py-1 rounded">{roomCode}</span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <PlayerForm 
              players={room.players} 
              setPlayers={handleUpdatePlayers} 
              onSubmit={handleGenerateTeam}
              includeChampions={room.includeChampions}
              onToggleChampions={handleToggleChampions}
              isLoading={generatingTeam}
              isRoom={true}
              currentUser={username}
            />
            
            {room.generatedTeam && room.generatedTeam.length > 0 && (
              <div className="mt-8">
                <TeamDisplay team={room.generatedTeam} includeChampions={room.includeChampions} />
              </div>
            )}
            
            {error && (
              <p className="mt-4 text-red-400 text-center">{error}</p>
            )}
            
            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                className="border-zinc-600 hover:bg-zinc-700"
                onClick={() => router.push("/")}
              >
                Quitter la Room
              </Button>
            </div>
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