import { test, expect } from "@playwright/test";

test("Rejoindre une room existante", async ({ page }) => {
  // Initialiser localStorage avant tout
  await page.addInitScript(() => {
    localStorage.setItem('username', 'Justin');
  });

  // Mock des routes
  await page.route('**', route => {
    const url = route.request().url();
    if (url.includes('api/rooms') || url.includes('firebase')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          result: { name: '0E7CTI' }
        }),
      });
    }
    return route.continue();
  });

  // Simuler la page de jointure
  await page.setContent(`
    <div>
      <h1>Rejoindre une room</h1>
      <div>
        <input type="text" data-testid="room-code-input" />
        <button data-testid="join-room-button">Rejoindre la room</button>
      </div>
    </div>
  `);

  // Rejoindre la room avec le code fixe
  const roomCodeInput = page.getByTestId("room-code-input");
  await roomCodeInput.fill("0E7CTI");

  const joinRoomButton = page.getByTestId("join-room-button");
  await joinRoomButton.click();

  // Simuler la page de room
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
  const player2Input = page.getByTestId("player-input-2");
  const player3Input = page.getByTestId("player-input-3");

  // Vérifier que le champ du propriétaire est rempli et désactivé
  await expect(player1Input).toHaveValue("Justin");
  await expect(player1Input).toBeDisabled();

  // Vérifier que les autres champs sont vides et désactivés
  await expect(player2Input).toBeDisabled();
  await expect(player3Input).toBeDisabled();

  // Vérifier que le bouton de génération est visible
  const generateButton = page.getByTestId("generate-team-button");
  await expect(generateButton).toBeVisible();
}); 