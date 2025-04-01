import { test, expect } from "@playwright/test";

test("Rejoindre une room existante", async ({ page }) => {
  // Intercepter les appels Firebase pour les mocks
  await page.route('**/*firestore*/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        result: {
          name: '0E7CTI',
          fields: {
            owner: { stringValue: 'Justin' },
            playerCount: { integerValue: 3 },
            players: {
              arrayValue: {
                values: [
                  { mapValue: { fields: { name: { stringValue: 'Justin' } } } },
                  { mapValue: { fields: { name: { stringValue: '' } } } },
                  { mapValue: { fields: { name: { stringValue: '' } } } }
                ]
              }
            }
          }
        }
      }),
    });
  });

  // Aller à la page des rooms
  await page.goto("/rooms");

  // Attendre que la page soit chargée
  await page.waitForSelector('[data-testid="room-code-input"]', { timeout: 10000 });

  // Rejoindre la room avec le code fixe
  const roomCodeInput = page.getByTestId("room-code-input");
  await roomCodeInput.fill("0E7CTI");

  const joinRoomButton = page.getByTestId("join-room-button");
  await joinRoomButton.click();

  // Attendre que la redirection soit terminée
  await page.waitForURL("/rooms/0E7CTI", { timeout: 10000 });

  // Attendre que le formulaire soit chargé
  await page.waitForSelector('[data-testid="player-input-1"]', { timeout: 10000 });

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