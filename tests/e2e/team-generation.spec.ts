import { test, expect } from "@playwright/test";

test("Générer une équipe de 3 joueurs avec des champions", async ({ page }) => {
  await page.goto("/");

  const threePlayersButton = page.getByTestId("player-count-3");
  await threePlayersButton.click();

  const player1Input = page.getByTestId("player-input-1");
  const player2Input = page.getByTestId("player-input-2");
  const player3Input = page.getByTestId("player-input-3");

  await player1Input.fill("Justin");
  await player2Input.fill("Cass");
  await player3Input.fill("Lolo");

  const championsSwitch = page.getByTestId("champions-mode-switch");
  await championsSwitch.click();

  const generateButton = page.getByTestId("generate-team-button");
  await generateButton.click();
  const player1Card = page.getByTestId("player-card-Justin");
  const player2Card = page.getByTestId("player-card-Cass");
  const player3Card = page.getByTestId("player-card-Lolo");

  await expect(player1Card).toBeVisible();
  await expect(player2Card).toBeVisible();
  await expect(player3Card).toBeVisible();


  const player1Role = page.getByTestId("player-role-Justin");
  const player2Role = page.getByTestId("player-role-Cass");
  const player3Role = page.getByTestId("player-role-Lolo");

  await expect(player1Role).toBeVisible();
  await expect(player2Role).toBeVisible();
  await expect(player3Role).toBeVisible();

  const player1Champion = page.getByTestId("player-champion-Justin");
  const player2Champion = page.getByTestId("player-champion-Cass");
  const player3Champion = page.getByTestId("player-champion-Lolo");

  await expect(player1Champion).toBeVisible();
  await expect(player2Champion).toBeVisible();
  await expect(player3Champion).toBeVisible();

  const lolalyticsLinks = page.getByTestId(/^lolalytics-link-/);
  await expect(lolalyticsLinks).toHaveCount(3);
}); 