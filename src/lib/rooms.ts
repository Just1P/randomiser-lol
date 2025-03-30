import { db } from './firebase';
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    onSnapshot,
    arrayUnion,
    Timestamp
} from 'firebase/firestore';
import { Player } from '@/types/player';

// Type pour une room
export interface Room {
    id: string;
    createdAt: Timestamp;
    owner: string;
    players: Player[];
    generatedTeam?: Player[];
    includeChampions: boolean;
    maxPlayers: number;
    connectedPlayers: string[];
}

// Générer un code de room aléatoire de 6 caractères
const generateRoomCode = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// Créer une nouvelle room
export const createRoom = async (ownerName: string, maxPlayers: number = 5): Promise<string> => {
    const roomCode = generateRoomCode();
    const roomRef = doc(db, 'rooms', roomCode);
    
    // Vérifier si le code existe déjà
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists()) {
        // Génère un nouveau code si celui-ci existe déjà
        return createRoom(ownerName, maxPlayers);
    }
    
    // Créer le joueur hôte
    const hostPlayer: Player = {
        id: ownerName, // Utiliser le nom comme identifiant
        name: ownerName,
    };
    
    // Créer la room
    const roomData: Room = {
        id: roomCode,
        createdAt: Timestamp.now(),
        owner: ownerName,
        players: [hostPlayer],
        includeChampions: false,
        maxPlayers: maxPlayers,
        connectedPlayers: [ownerName]
    };
    
    await setDoc(roomRef, roomData);
    
    return roomCode;
};

// Rejoindre une room
export const joinRoom = async (roomCode: string): Promise<Room | null> => {
    const roomRef = doc(db, 'rooms', roomCode);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
        return null;
    }
    
    return roomSnap.data() as Room;
};

// Ajouter un joueur à la room
export const addPlayerToRoom = async (roomCode: string, playerName: string): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
        throw new Error("Room introuvable");
    }
    
    const room = roomSnap.data() as Room;
    
    // Vérifier si la room est complète
    if (room.connectedPlayers.length >= room.maxPlayers) {
        throw new Error("La room est complète");
    }
    
    // Vérifier si le joueur existe déjà dans la room
    if (room.connectedPlayers.includes(playerName)) {
        // Si le joueur existe déjà, ne rien faire
        return;
    }
    
    // Créer le joueur
    const newPlayer: Player = {
        id: playerName,
        name: playerName
    };
    
    // Ajouter le joueur à la liste
    await updateDoc(roomRef, {
        players: arrayUnion(newPlayer),
        connectedPlayers: arrayUnion(playerName)
    });
};

// Mettre à jour la liste des joueurs
export const updatePlayersInRoom = async (roomCode: string, players: Player[]): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    
    await updateDoc(roomRef, {
        players: players
    });
};

// Mettre à jour un joueur spécifique dans la room
export const updatePlayerInRoom = async (roomCode: string, updatedPlayer: Player): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
        throw new Error("Room introuvable");
    }
    
    const room = roomSnap.data() as Room;
    
    // Trouver et mettre à jour le joueur
    const updatedPlayers = room.players.map(player => 
        player.id === updatedPlayer.id ? updatedPlayer : player
    );
    
    await updateDoc(roomRef, {
        players: updatedPlayers
    });
};

// Mettre à jour l'équipe générée
export const updateGeneratedTeam = async (roomCode: string, team: Player[]): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    
    await updateDoc(roomRef, {
        generatedTeam: team
    });
};

// Mettre à jour l'option includeChampions
export const updateIncludeChampions = async (roomCode: string, include: boolean): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    
    await updateDoc(roomRef, {
        includeChampions: include
    });
};

// S'abonner aux changements dans une room
export const subscribeToRoom = (
    roomCode: string, 
    callback: (room: Room) => void
): (() => void) => {
    const roomRef = doc(db, 'rooms', roomCode);
    
    return onSnapshot(roomRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data() as Room);
        }
    });
}; 