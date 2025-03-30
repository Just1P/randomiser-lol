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

const generateRoomCode = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

export const createRoom = async (ownerName: string, maxPlayers: number = 5): Promise<string> => {
    const roomCode = generateRoomCode();
    const roomRef = doc(db, 'rooms', roomCode);
    
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists()) {
        return createRoom(ownerName, maxPlayers);
    }
    
    const hostPlayer: Player = {
        id: ownerName, 
        name: ownerName,
    };
    
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

export const joinRoom = async (roomCode: string): Promise<Room | null> => {
    const roomRef = doc(db, 'rooms', roomCode);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
        return null;
    }
    
    return roomSnap.data() as Room;
};

export const addPlayerToRoom = async (roomCode: string, playerName: string): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
        throw new Error("Room introuvable");
    }
    
    const room = roomSnap.data() as Room;
    
    if (room.connectedPlayers.length >= room.maxPlayers) {
        throw new Error("La room est complète");
    }
    
    if (room.connectedPlayers.includes(playerName)) {
        return;
    }
    
    const newPlayer: Player = {
        id: playerName,
        name: playerName
    };
    
    await updateDoc(roomRef, {
        players: arrayUnion(newPlayer),
        connectedPlayers: arrayUnion(playerName)
    });
};

export const updatePlayersInRoom = async (roomCode: string, players: Player[]): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    
    await updateDoc(roomRef, {
        players: players
    });
};

export const updatePlayerInRoom = async (roomCode: string, updatedPlayer: Player): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
        throw new Error("Room introuvable");
    }
    
    const room = roomSnap.data() as Room;
    
    const updatedPlayers = room.players.map(player => 
        player.id === updatedPlayer.id ? updatedPlayer : player
    );
    
    await updateDoc(roomRef, {
        players: updatedPlayers
    });
};

export const updateGeneratedTeam = async (roomCode: string, team: Player[]): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    
    await updateDoc(roomRef, {
        generatedTeam: team
    });
};

export const updateIncludeChampions = async (roomCode: string, include: boolean): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    
    await updateDoc(roomRef, {
        includeChampions: include
    });
};

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