import { chromium, FullConfig } from '@playwright/test';

// Cette fonction est exécutée une fois avant tous les tests
async function globalSetup(config: FullConfig) {
  // Vous pouvez configurer un contexte de navigateur persistant ici
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Mocker les appels API
  await page.route('**/*', async (route) => {
    // Intercepter les appels Firebase
    const url = route.request().url();
    if (url.includes('firestore') || url.includes('firebase')) {
      // Mock de réponse pour Firebase
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    } else {
      // Laisser passer les autres requêtes
      await route.continue();
    }
  });

  // Injecter les mocks dans le localStorage
  await page.evaluate(() => {
    // Mock data pour les tests
    localStorage.setItem('username', 'Justin');
    localStorage.setItem('mock-firebase', 'true');
  });

  await browser.close();
}

export default globalSetup; 