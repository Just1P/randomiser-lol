// Mock pour Firebase
const mockFirebaseApp = {
  name: 'mock-app',
  options: {
    apiKey: 'mock-api-key',
    authDomain: 'mock-auth-domain',
    projectId: 'mock-project-id',
    storageBucket: 'mock-storage-bucket',
    messagingSenderId: 'mock-messaging-sender-id',
    appId: 'mock-app-id',
  },
};

// Mock de Firestore
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockSetDoc = jest.fn().mockResolvedValue({});
const mockGetDoc = jest.fn().mockResolvedValue({
  exists: jest.fn().mockReturnValue(true),
  data: jest.fn().mockReturnValue({}),
});
const mockAddDoc = jest.fn().mockResolvedValue({ id: 'mock-doc-id' });
const mockUpdateDoc = jest.fn().mockResolvedValue({});
const mockOnSnapshot = jest.fn();

// Export des fonctions mockées
export const initializeApp = jest.fn().mockReturnValue(mockFirebaseApp);
export const getFirestore = jest.fn().mockReturnValue({
  collection: mockCollection,
  doc: mockDoc,
});
export const getAuth = jest.fn().mockReturnValue({
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signInAnonymously: jest.fn().mockResolvedValue({}),
});

export const collection = mockCollection;
export const doc = mockDoc;
export const setDoc = mockSetDoc;
export const getDoc = mockGetDoc;
export const addDoc = mockAddDoc;
export const updateDoc = mockUpdateDoc;
export const onSnapshot = mockOnSnapshot;

export const db = {
  collection: mockCollection,
  doc: mockDoc,
};

export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signInAnonymously: jest.fn().mockResolvedValue({}),
};

export default mockFirebaseApp; 