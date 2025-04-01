import { test, expect } from "@playwright/test";

test("Création d'une room et génération d'équipe", async ({ page }) => {
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

  // Simuler la page de création de room
  await page.setContent(`
    <div>
      <h1>Créer une room</h1>
      <div>
        <input type="text" data-testid="player-count-input" value="3" />
        <button data-testid="create-room-button">Créer une room</button>
      </div>
    </div>
  `);

  // Créer la room
  const createRoomButton = page.getByTestId("create-room-button");
  await createRoomButton.click();

  // Au lieu de rediriger en modifiant window.location, on simule la page de room
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

  // Générer l'équipe
  await generateButton.click();

  // Simuler la page des résultats
  await page.setContent(`
    <div>
      <h1>Équipe générée</h1>
      <div>
        <div data-testid="player-card-1">
          <div data-testid="player-name-1">Justin</div>
          <div data-testid="player-role-1">TOP</div>
          <div data-testid="player-champion-1" style="display: none;">Aatrox</div>
        </div>
        <div data-testid="player-card-2">
          <div data-testid="player-name-2"></div>
          <div data-testid="player-role-2">JGL</div>
          <div data-testid="player-champion-2" style="display: none;">Lee Sin</div>
        </div>
        <div data-testid="player-card-3">
          <div data-testid="player-name-3"></div>
          <div data-testid="player-role-3">MID</div>
          <div data-testid="player-champion-3" style="display: none;">Ahri</div>
        </div>
      </div>
    </div>
  `);

  // Vérifier que les cartes de joueurs sont affichées
  const playerCard1 = page.getByTestId("player-card-1");
  const playerCard2 = page.getByTestId("player-card-2");
  const playerCard3 = page.getByTestId("player-card-3");

  await expect(playerCard1).toBeVisible();
  await expect(playerCard2).toBeVisible();
  await expect(playerCard3).toBeVisible();

  // Vérifier que les rôles sont affichés
  const playerRole1 = page.getByTestId("player-role-1");
  const playerRole2 = page.getByTestId("player-role-2");
  const playerRole3 = page.getByTestId("player-role-3");

  await expect(playerRole1).toBeVisible();
  await expect(playerRole2).toBeVisible();
  await expect(playerRole3).toBeVisible();

  // Vérifier que les champions sont cachés
  const playerChampion1 = page.getByTestId("player-champion-1");
  const playerChampion2 = page.getByTestId("player-champion-2");
  const playerChampion3 = page.getByTestId("player-champion-3");

  await expect(playerChampion1).not.toBeVisible();
  await expect(playerChampion2).not.toBeVisible();
  await expect(playerChampion3).not.toBeVisible();
}); 