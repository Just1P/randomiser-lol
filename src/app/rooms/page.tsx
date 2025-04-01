"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRoom, joinRoom } from "@/lib/rooms";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { motion } from "framer-motion";

export default function RoomsPage() {
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playerCount, setPlayerCount] = useState(5);

  const handleCreateRoom = async () => {
    if (!ownerName.trim()) {
      setError("Veuillez entrer votre nom");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const code = await createRoom(ownerName, playerCount);
      localStorage.setItem("username", ownerName);
      router.push(`/rooms/${code}`);
    } catch (error: unknown) {
      console.error("Erreur lors de la création de la room:", error);
      if (error instanceof FirebaseError) {
        setError(`Erreur Firebase: ${error.message}`);
      } else {
        setError("Impossible de créer la room. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError("Veuillez entrer un code de room");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const room = await joinRoom(roomCode.toUpperCase());
      
      if (!room) {
        setError("Room introuvable. Vérifiez le code et réessayez.");
        setLoading(false);
        return;
      }

      if (!localStorage.getItem("username")) {
        const username = prompt("Entrez votre nom pour rejoindre la room") || "";
        if (!username.trim()) {
          setError("Un nom est requis pour rejoindre la room");
          setLoading(false);
          return;
        }
        localStorage.setItem("username", username);
      }

      router.push(`/rooms/${roomCode.toUpperCase()}`);
    } catch (error: unknown) {
      console.error("Erreur lors de la connexion à la room:", error);
      if (error instanceof FirebaseError) {
        setError(`Erreur Firebase: ${error.message}`);
      } else {
        setError("Impossible de rejoindre la room. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestFirebase = async () => {
    setLoading(true);
    setError("");
    
    try {
      const roomsCollection = collection(db, "rooms");
      const snapshot = await getDocs(roomsCollection);
      console.log(`Collection rooms contient ${snapshot.size} documents`);
      
      const testDoc = await addDoc(collection(db, "tests"), {
        message: "Test de connexion Firebase",
        timestamp: Timestamp.now()
      });
      
      console.log("Connexion Firebase OK! Document créé avec ID:", testDoc.id);
      alert("Connexion Firebase OK! Document test créé avec succès.");
      
    } catch (error: unknown) {
      console.error("Erreur de test Firebase:", error);
      if (error instanceof FirebaseError) {
        setError(`Erreur Firebase: ${error.message}`);
      } else {
        setError("Erreur inconnue lors du test Firebase");
      }
    } finally {
      setLoading(false);
    }
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
              <CardTitle className="text-3xl font-bold text-center flex justify-center items-center gap-3 mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                  Randomiseur LoL - Rooms
                </span>
              </CardTitle>
              <p className="text-center text-zinc-400 text-sm">
                Créez ou rejoignez une partie multijoueur
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            <Tabs defaultValue="create">
              <TabsList className="mb-6 w-full bg-zinc-700/50 p-1">
                <TabsTrigger 
                  value="create" 
                  className="flex-1 rounded-md data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white hover:text-white transition-all"
                >
                  Créer une Room
                </TabsTrigger>
                <TabsTrigger 
                  value="join" 
                  className="flex-1 rounded-md data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white hover:text-white transition-all"
                >
                  Rejoindre
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="text-zinc-300">Votre nom</Label>
                    <Input
                      id="ownerName"
                      data-testid="owner-name-input"
                      placeholder="Entrez votre nom"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="bg-zinc-700/70 border-zinc-600 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="playerCount" className="text-zinc-300">Nombre de joueurs</Label>
                    <div className="flex border border-zinc-600 rounded-md overflow-hidden bg-zinc-700/50">
                      {[1, 2, 3, 4, 5].map((count) => (
                        <button
                          key={count}
                          type="button"
                          data-testid={`room-player-count-${count}`}
                          className={`px-3 py-1.5 min-w-10 text-sm ${
                            playerCount === count 
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium" 
                              : "bg-transparent text-zinc-300 hover:bg-zinc-600 transition-colors"
                          }`}
                          onClick={() => setPlayerCount(count)}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    data-testid="create-room-button"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={loading}
                    onClick={handleCreateRoom}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création...
                      </div>
                    ) : "Créer la Room"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="join">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomCode" className="text-zinc-300">Code de la Room</Label>
                    <Input
                      id="roomCode"
                      data-testid="room-code-input"
                      placeholder="Entrez le code (ex: ABC123)"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      className="bg-zinc-700/70 border-zinc-600 focus:border-blue-500 transition-colors uppercase"
                    />
                  </div>
                  <Button 
                    data-testid="join-room-button"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={loading}
                    onClick={handleJoinRoom}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connexion...
                      </div>
                    ) : "Rejoindre la Room"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

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
                Retour à l&apos;accueil
              </Button>
              
              <Button 
                variant="outline" 
                className="border-blue-600 text-blue-400 hover:bg-blue-900/20 ml-2 transition-colors"
                onClick={handleTestFirebase}
                disabled={loading}
              >
                Tester Firebase
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