import { test, expect } from "@playwright/test";

test("Validation des entrées invalides", async ({ page }) => {
  await page.goto("/");

  const threePlayersButton = page.getByTestId("player-count-3");
  await threePlayersButton.click();

  const player1Input = page.getByTestId("player-input-1");
  const player2Input = page.getByTestId("player-input-2");
  const player3Input = page.getByTestId("player-input-3");

  const generateButton = page.getByTestId("generate-team-button");
  await generateButton.click();

  const errorMessage = page.getByTestId("error-message");
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toHaveText("Veuillez entrer tous les noms des joueurs");

  await player1Input.fill("Justin");
  await player2Input.fill("Justin");
  await player3Input.fill("Lolo");

  await generateButton.click();

  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toHaveText("Tous les noms des joueurs doivent être uniques");

  await player2Input.fill("Cass");
  await generateButton.click();

  await expect(errorMessage).not.toBeVisible();

  const player1Card = page.getByTestId("player-card-Justin");
  const player2Card = page.getByTestId("player-card-Cass");
  const player3Card = page.getByTestId("player-card-Lolo");

  await expect(player1Card).toBeVisible();
  await expect(player2Card).toBeVisible();
  await expect(player3Card).toBeVisible();
}); 