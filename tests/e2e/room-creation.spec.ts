import { test } from "@playwright/test";

test("Création d'une room et génération d'équipe", async ({ page }) => {
  await page.goto("/rooms");

  const ownerNameInput = page.getByTestId("owner-name-input");
  await ownerNameInput.fill("Justin");

  const threePlayersButton = page.getByTestId("room-player-count-3");
  await threePlayersButton.click();

  const createRoomButton = page.getByTestId("create-room-button");
  await createRoomButton.click();

}); 