import { test, expect } from "@playwright/test";

test("Création d'une room et génération d'équipe", async ({ page }) => {
  // Mock la route pour Firebase
  await page.route('**/*firestore*/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ result: { name: '0E7CTI' } }),
    });
  });

  await page.goto("/rooms");

  const ownerNameInput = page.getByTestId("owner-name-input");
  await ownerNameInput.fill("Justin");

  const threePlayersButton = page.getByTestId("room-player-count-3");
  await threePlayersButton.click();

  const createRoomButton = page.getByTestId("create-room-button");
  await createRoomButton.click();

  // On attend d'être redirigé vers la page de la room
  // Le code doit être fixe à 0E7CTI, comme configuré dans le mock
  await page.waitForURL("/rooms/0E7CTI");

  // Vérifier que le formulaire de génération d'équipe est visible
  const player1Input = page.getByTestId("player-input-1");
  await expect(player1Input).toBeVisible();
  await expect(player1Input).toHaveValue("Justin");
}); 