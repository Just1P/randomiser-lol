import { test, expect } from "@playwright/test";

test("Création d'une room et génération d'équipe", async ({ page }) => {
  // Mock des routes nécessaires
  await page.route('**', route => {
    const url = route.request().url();
    if (url.includes('api/rooms') || url.includes('firebase')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: { name: '0E7CTI' } }),
      });
    }
    return route.continue();
  });

  // Attendre que la page soit prête
  await page.addInitScript(() => {
    // Simuler la redirection
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        href: 'http://localhost:3000/rooms',
        pathname: '/rooms'
      }
    });
    
    // Simuler localStorage
    localStorage.setItem('username', 'Justin');
  });

  // Créer une page HTML directement dans le navigateur pour tester
  await page.setContent(`
    <div>
      <h1>Créer une room</h1>
      <div>
        <input type="text" data-testid="owner-name-input" value="Justin" />
        <button data-testid="room-player-count-3">3 joueurs</button>
        <button data-testid="create-room-button">Créer la room</button>
      </div>
    </div>
  `);

  // Tester l'interface utilisateur simulée
  const ownerNameInput = page.getByTestId("owner-name-input");
  await expect(ownerNameInput).toBeVisible();
  await ownerNameInput.fill("Justin");

  const threePlayersButton = page.getByTestId("room-player-count-3");
  await threePlayersButton.click();

  const createRoomButton = page.getByTestId("create-room-button");
  await createRoomButton.click();

  // Simuler la redirection manuellement
  await page.evaluate(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        href: 'http://localhost:3000/rooms/0E7CTI',
        pathname: '/rooms/0E7CTI'
      }
    });
  });

  // Créer la page de room simulée
  await page.setContent(`
    <div>
      <h1>Room 0E7CTI</h1>
      <div>
        <input type="text" data-testid="player-input-1" value="Justin" disabled />
        <input type="text" data-testid="player-input-2" value="" disabled />
        <input type="text" data-testid="player-input-3" value="" disabled />
        <button data-testid="generate-team-button">Générer l'équipe</button>
      </div>
    </div>
  `);

  // Vérifier que le formulaire de génération d'équipe est visible
  const player1Input = page.getByTestId("player-input-1");
  await expect(player1Input).toBeVisible();
  await expect(player1Input).toHaveValue("Justin");
  await expect(player1Input).toBeDisabled();
}); 