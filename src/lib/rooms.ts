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
export const createRoom = async (ownerName: string): Promise<string> => {
    const roomCode = generateRoomCode();
    const roomRef = doc(db, 'rooms', roomCode);
    
    // Vérifier si le code existe déjà
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists()) {
        // Génère un nouveau code si celui-ci existe déjà
        return createRoom(ownerName);
    }
    
    // Créer la room
    const roomData: Room = {
        id: roomCode,
        createdAt: Timestamp.now(),
        owner: ownerName,
        players: [],
        includeChampions: false
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
export const addPlayerToRoom = async (roomCode: string, player: Player): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    
    await updateDoc(roomRef, {
        players: arrayUnion(player)
    });
};

// Mettre à jour la liste des joueurs
export const updatePlayersInRoom = async (roomCode: string, players: Player[]): Promise<void> => {
    const roomRef = doc(db, 'rooms', roomCode);
    
    await updateDoc(roomRef, {
        players: players
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