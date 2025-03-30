"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TeamDisplay from "@/components/TeamDisplay";
import { Player } from "@/types/player";
import { Role } from "@/enums/role";
import { Room, subscribeToRoom, addPlayerToRoom, updateGeneratedTeam, updateIncludeChampions } from "@/lib/rooms";
import { randomizeRoles } from "@/lib/randomizer";
import { META_CHAMPIONS_BY_ROLE } from "@/lib/api";
import { FirebaseError } from "firebase/app";
import { motion } from "framer-motion";

export default function RoomPage() {
  const params = useParams();
  const roomCode = params?.roomCode as string;
  
  const router = useRouter();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [generatingTeam, setGeneratingTeam] = useState(false);
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (!roomCode) {
      router.push("/rooms");
      return;
    }
    
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      router.push("/rooms");
      return;
    }
    
    setUsername(storedUsername);
    
    const unsubscribe = subscribeToRoom(roomCode, (roomData) => {
      setRoom(roomData);
      setLoading(false);
    });
    
    return () => {
      unsubscribe();
    };
  }, [roomCode, router]);
  
  useEffect(() => {
    const joinRoom = async () => {
      if (room && username && !joined) {
        try {
          await addPlayerToRoom(roomCode, username);
          setJoined(true);
        } catch (error: unknown) {
          console.error("Erreur lors de l'ajout du joueur à la room:", error);
          if (error instanceof Error && error.message.includes("Room complète")) {
            setError(`${error.message} - Impossible de rejoindre cette room car elle est déjà pleine.`);
            setTimeout(() => {
              router.push("/rooms");
            }, 3000);
          } else if (error instanceof FirebaseError) {
            setError(`Erreur Firebase: ${error.message}`);
          } else if (error instanceof Error) {
            setError(error.message);
          } else {
            setError("Impossible de rejoindre la room.");
          }
        }
      }
    };
    
    joinRoom();
  }, [room, username, roomCode, joined, router]);
  
  const handleGenerateTeam = async () => {
    if (!room || !room.players || room.players.length < 1) {
      setError("Ajoutez des joueurs avant de générer une équipe");
      return;
    }
    
    if (room.owner !== username) {
      setError("Seul l'hôte de la room peut générer l'équipe");
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
    if (room && room.owner !== username) {
      setError("Seul l'hôte de la room peut modifier les options");
      return;
    }
    
    try {
      await updateIncludeChampions(roomCode, include);
      
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
    
    const availableChampions = championsForRole.filter((champion: string) => !usedChampions.has(champion));
    
    if (availableChampions.length === 0) {
      console.warn(`Tous les champions pour le rôle ${role} ont déjà été assignés`);
      return undefined;
    }
    
    const randomIndex = Math.floor(Math.random() * availableChampions.length);
    return availableChampions[randomIndex];
  };
  
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  if (loading) {
    return (
      <main className="min-h-screen text-gray-100 p-4 md:p-8 relative overflow-hidden bg-zinc-900">
        <div className="flex justify-center items-center h-screen">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg">Chargement...</p>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }
  
  if (!room) {
    return (
      <main className="min-h-screen text-gray-100 p-4 md:p-8 relative overflow-hidden bg-zinc-900">
        <div className="container mx-auto max-w-4xl text-center h-screen flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-zinc-800/70 backdrop-blur-xl p-8 rounded-xl shadow-2xl"
          >
            <div className="text-red-500 text-5xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Room introuvable</h2>
            <p className="text-lg mb-6 text-zinc-300">Le code de room est peut-être incorrect.</p>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" 
              onClick={() => router.push("/rooms")}
            >
              Retour
            </Button>
          </motion.div>
        </div>
      </main>
    );
  }
  
  if (error && error.includes("Room complète")) {
    return (
      <main className="min-h-screen text-gray-100 p-4 md:p-8 relative overflow-hidden bg-zinc-900">
        <div className="container mx-auto max-w-4xl text-center h-screen flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-zinc-800/70 backdrop-blur-xl p-8 rounded-xl shadow-2xl"
          >
            <div className="text-amber-500 text-5xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Room complète</h2>
            <p className="text-lg mb-6 text-zinc-300">{error}</p>
            <p className="text-sm text-zinc-400 mb-4">Redirection vers la page des rooms dans quelques secondes...</p>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" 
              onClick={() => router.push("/rooms")}
            >
              Retour
            </Button>
          </motion.div>
        </div>
      </main>
    );
  }
  
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
              <CardTitle className="text-3xl font-bold text-center flex flex-col gap-2 mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                  Randomiseur de rôles LoL
                </span>
                <div className="flex items-center justify-center gap-2 text-xl mt-2">
                  <span className="text-gray-400">Room:</span>
                  <div className="flex items-center">
                    <span className="font-mono bg-zinc-700/80 px-3 py-1 rounded-md">{roomCode}</span>
                    <button 
                      onClick={copyRoomCode}
                      className="ml-2 p-1.5 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors"
                      title="Copier le code"
                    >
                      {copied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-sm mt-2 text-gray-400 flex flex-wrap justify-center gap-2">
                  {room.owner === username ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-800/70 text-blue-100">
                      Vous êtes l&apos;hôte
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-zinc-700/70">
                      Hôte: {room.owner}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-zinc-700/70">
                    Joueurs: {room.connectedPlayers.length}/{room.maxPlayers}
                  </span>
                </div>
              </CardTitle>
            </motion.div>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="text-lg font-medium mb-3 text-blue-400">Joueurs dans la room</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {room.players.map((player) => (
                  <motion.div 
                    key={player.id} 
                    className={`p-3 rounded-md ${player.name === username ? 'bg-blue-900/60 border border-blue-700/50' : 'bg-zinc-700/60'}`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{player.name}</span>
                        {player.name === username && (
                          <span className="ml-2 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">Vous</span>
                        )}
                        {player.name === room.owner && (
                          <span className="ml-2 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full">Hôte</span>
                        )}
                      </div>
                      {player.role && (
                        <span className="text-sm px-2 py-0.5 rounded bg-zinc-800/70 text-gray-300">{player.role}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="mt-8 flex flex-col space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center space-x-4 justify-center">
                <Button
                  onClick={handleGenerateTeam}
                  className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all duration-200 ${room.owner !== username ? 'opacity-50' : ''}`}
                  disabled={generatingTeam || room.owner !== username}
                >
                  {generatingTeam ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Génération...
                    </div>
                  ) : "Générer l'équipe"}
                </Button>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="champions-toggle"
                    checked={room.includeChampions}
                    onChange={(e) => handleToggleChampions(e.target.checked)}
                    disabled={room.owner !== username}
                    className="h-4 w-4 rounded border-zinc-500 focus:ring-blue-500 transition duration-200"
                  />
                  <label htmlFor="champions-toggle" className={`text-sm ${room.owner !== username ? 'text-zinc-500' : 'text-zinc-300'}`}>
                    Inclure champions
                  </label>
                </div>
              </div>
            </motion.div>
            
            {room.generatedTeam && room.generatedTeam.length > 0 && (
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <TeamDisplay team={room.generatedTeam} includeChampions={room.includeChampions} />
              </motion.div>
            )}
            
            {error && (
              <motion.p 
                className="mt-4 text-red-400 text-center bg-red-500/10 py-2 px-3 rounded-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {error}
              </motion.p>
            )}
            
            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                className="border-zinc-600 hover:bg-zinc-700/60 transition-colors"
                onClick={() => router.push("/")}
              >
                Quitter la Room
              </Button>
            </div>
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