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

export default function RoomsPage() {
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async () => {
    if (!ownerName.trim()) {
      setError("Veuillez entrer votre nom");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const code = await createRoom(ownerName);
      // Stocker le nom pour l'utiliser dans la room
      localStorage.setItem("username", ownerName);
      // Rediriger vers la room
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

      // Demander le nom si pas encore défini
      if (!localStorage.getItem("username")) {
        const username = prompt("Entrez votre nom pour rejoindre la room") || "";
        if (!username.trim()) {
          setError("Un nom est requis pour rejoindre la room");
          setLoading(false);
          return;
        }
        localStorage.setItem("username", username);
      }

      // Rediriger vers la room
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
      // Vérifier si la collection "rooms" existe déjà
      const roomsCollection = collection(db, "rooms");
      // Utiliser la variable snapshot pour éviter l'avertissement
      const snapshot = await getDocs(roomsCollection);
      console.log(`Collection rooms contient ${snapshot.size} documents`);
      
      // Créer un document test
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
    <main className="min-h-screen bg-zinc-900 text-gray-100 p-8">
      <div className="container mx-auto max-w-md">
        <Card className="bg-zinc-800 border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-[#3b82f6] flex justify-center items-center gap-3 mb-6">
              <span>Randomiseur LoL - Rooms</span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="create">
              <TabsList className="mb-6 w-full">
                <TabsTrigger value="create" className="flex-1 hover:bg-zinc-700 data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white">
                  Créer une Room
                </TabsTrigger>
                <TabsTrigger value="join" className="flex-1 hover:bg-zinc-700 data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white">
                  Rejoindre
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Votre nom</Label>
                    <Input
                      id="ownerName"
                      placeholder="Entrez votre nom"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="bg-zinc-700 border-zinc-600"
                    />
                  </div>
                  <Button 
                    className="w-full bg-[#3b82f6] hover:bg-blue-600" 
                    disabled={loading}
                    onClick={handleCreateRoom}
                  >
                    {loading ? "Création..." : "Créer la Room"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="join">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomCode">Code de la Room</Label>
                    <Input
                      id="roomCode"
                      placeholder="Entrez le code (ex: ABC123)"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      className="bg-zinc-700 border-zinc-600"
                    />
                  </div>
                  <Button 
                    className="w-full bg-[#3b82f6] hover:bg-blue-600" 
                    disabled={loading}
                    onClick={handleJoinRoom}
                  >
                    {loading ? "Connexion..." : "Rejoindre la Room"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <p className="mt-4 text-red-400 text-center">{error}</p>
            )}

            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                className="border-zinc-600 hover:bg-zinc-700 mr-4"
                onClick={() => router.push("/")}
              >
                Retour à l&apos;accueil
              </Button>
              
              <Button 
                variant="outline" 
                className="border-blue-600 text-blue-400 hover:bg-blue-900"
                onClick={handleTestFirebase}
                disabled={loading}
              >
                Tester Firebase
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