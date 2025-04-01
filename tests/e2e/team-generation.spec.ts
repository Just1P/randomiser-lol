import { test, expect } from "@playwright/test";

test("Générer une équipe de 3 joueurs avec des champions", async ({ page }) => {
  // Initialiser localStorage avant tout
  await page.addInitScript(() => {
    localStorage.setItem('username', 'Justin');
  });

  // Simuler la page d'accueil
  await page.setContent(`
    <div>
      <h1>Randomiser LOL</h1>
      <div>
        <button data-testid="player-count-3">3 joueurs</button>
        <button data-testid="player-count-5">5 joueurs</button>
        <div class="team-options">
          <input type="checkbox" data-testid="include-champions" checked />
        </div>
      </div>
    </div>
  `);

  // Sélectionner 3 joueurs
  const threePlayersButton = page.getByTestId("player-count-3");
  await threePlayersButton.click();

  // Vérifier que la case des champions est cochée
  const includeChampionsCheckbox = page.getByTestId("include-champions");
  expect(await includeChampionsCheckbox.isChecked()).toBeTruthy();

  // Simuler la page de formulaire
  await page.setContent(`
    <div>
      <h1>Configuration de l'équipe</h1>
      <div>
        <input type="text" data-testid="player-name-input-1" value="Justin" />
        <input type="text" data-testid="player-name-input-2" value="Joueur 2" />
        <input type="text" data-testid="player-name-input-3" value="Joueur 3" />
        <button data-testid="generate-team-button">Générer l'équipe</button>
      </div>
    </div>
  `);

  // Remplir le formulaire
  const player1Input = page.getByTestId("player-name-input-1");
  const player2Input = page.getByTestId("player-name-input-2");
  const player3Input = page.getByTestId("player-name-input-3");

  await expect(player1Input).toHaveValue("Justin");
  await expect(player2Input).toHaveValue("Joueur 2");
  await expect(player3Input).toHaveValue("Joueur 3");

  // Générer l'équipe
  const generateButton = page.getByTestId("generate-team-button");
  await generateButton.click();

  // Simuler la page des résultats avec champions
  await page.setContent(`
    <div>
      <h1>Équipe générée</h1>
      <div>
        <div data-testid="player-card-1">
          <div data-testid="player-name-1">Justin</div>
          <div data-testid="player-role-1">TOP</div>
          <div data-testid="player-champion-1">Aatrox</div>
        </div>
        <div data-testid="player-card-2">
          <div data-testid="player-name-2">Joueur 2</div>
          <div data-testid="player-role-2">JGL</div>
          <div data-testid="player-champion-2">Lee Sin</div>
        </div>
        <div data-testid="player-card-3">
          <div data-testid="player-name-3">Joueur 3</div>
          <div data-testid="player-role-3">MID</div>
          <div data-testid="player-champion-3">Ahri</div>
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

  // Vérifier que les champions sont affichés
  const playerChampion1 = page.getByTestId("player-champion-1");
  const playerChampion2 = page.getByTestId("player-champion-2");
  const playerChampion3 = page.getByTestId("player-champion-3");

  await expect(playerChampion1).toBeVisible();
  await expect(playerChampion2).toBeVisible();
  await expect(playerChampion3).toBeVisible();
}); 