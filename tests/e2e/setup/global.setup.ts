import { chromium } from '@playwright/test';

// Cette fonction est exécutée une fois avant tous les tests
async function globalSetup() {
  console.log('Setting up test environment...');
  
  // Vous pouvez configurer un contexte de navigateur persistant ici
  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Stocker des données pour les tests
  await context.addInitScript(() => {
    // Stocker les valeurs dans l'objet window global
    window.__TEST_DATA__ = {
      mocks: {
        room: {
          id: '0E7CTI',
          owner: 'Justin',
          playerCount: 3,
          maxPlayers: 3,
          connectedPlayers: ['Justin'],
          players: [
            { id: 'Justin', name: 'Justin', role: null, champion: null },
            { id: '', name: '', role: null, champion: null },
            { id: '', name: '', role: null, champion: null }
          ],
          includeChampions: false,
          generatedTeam: []
        }
      }
    };
    
    // Mocker localStorage
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key) => {
          if (key === 'username') return 'Justin';
          return originalLocalStorage.getItem(key);
        },
        setItem: originalLocalStorage.setItem.bind(originalLocalStorage),
        removeItem: originalLocalStorage.removeItem.bind(originalLocalStorage),
        clear: originalLocalStorage.clear.bind(originalLocalStorage),
      },
    });
  });

  await browser.close();
  
  console.log('Test environment setup complete');
}

export default globalSetup; 