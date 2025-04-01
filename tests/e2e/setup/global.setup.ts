import { chromium } from '@playwright/test';

// Cette fonction est exécutée une fois avant tous les tests
async function globalSetup() {
  // Vous pouvez configurer un contexte de navigateur persistant ici
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Configurer l'interception des requêtes Firebase
  await context.route('**/*firestore*/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        success: true,
        result: { name: '0E7CTI' } 
      }),
    });
  });

  // Configurer l'interception des requêtes Firebase Auth
  await context.route('**/*identitytoolkit*/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  // Pour manipuler localStorage, on doit d'abord naviguer vers la page
  await page.goto('http://localhost:3000/');
  
  // Maintenant on peut interagir avec localStorage
  await page.evaluate(() => {
    localStorage.setItem('username', 'Justin');
    localStorage.setItem('mock-firebase', 'true');
  });

  await browser.close();
}

export default globalSetup; 