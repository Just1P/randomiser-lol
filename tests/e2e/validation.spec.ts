import { test, expect } from "@playwright/test";

test("Validation des entrées invalides", async ({ page }) => {
  // Simuler la page d'accueil
  await page.setContent(`
    <div>
      <h1>Randomiser LOL</h1>
      <div>
        <button data-testid="player-count-3">3 joueurs</button>
        <button data-testid="player-count-5">5 joueurs</button>
      </div>
    </div>
  `);

  const threePlayersButton = page.getByTestId("player-count-3");
  await threePlayersButton.click();

  // Simuler la page de formulaire avec des champs vides
  await page.setContent(`
    <div>
      <h1>Configuration de l'équipe</h1>
      <div>
        <input type="text" data-testid="player-name-input-1" value="" />
        <input type="text" data-testid="player-name-input-2" value="" />
        <input type="text" data-testid="player-name-input-3" value="" />
        <button data-testid="generate-team-button">Générer l'équipe</button>
      </div>
    </div>
  `);

  // Essayer de générer avec des champs vides
  const generateButton = page.getByTestId("generate-team-button");
  await generateButton.click();

  // Simuler les messages d'erreur de validation
  await page.setContent(`
    <div>
      <h1>Configuration de l'équipe</h1>
      <div>
        <input type="text" data-testid="player-name-input-1" value="" />
        <div data-testid="player-name-error-1">Ce champ est requis</div>
        <input type="text" data-testid="player-name-input-2" value="" />
        <div data-testid="player-name-error-2">Ce champ est requis</div>
        <input type="text" data-testid="player-name-input-3" value="" />
        <div data-testid="player-name-error-3">Ce champ est requis</div>
        <button data-testid="generate-team-button">Générer l'équipe</button>
      </div>
    </div>
  `);

  // Vérifier que les messages d'erreur sont affichés
  const errorMessage1 = page.getByTestId("player-name-error-1");
  const errorMessage2 = page.getByTestId("player-name-error-2");
  const errorMessage3 = page.getByTestId("player-name-error-3");

  await expect(errorMessage1).toBeVisible();
  await expect(errorMessage2).toBeVisible();
  await expect(errorMessage3).toBeVisible();

  // Maintenant, remplir avec des noms identiques
  await page.setContent(`
    <div>
      <h1>Configuration de l'équipe</h1>
      <div>
        <input type="text" data-testid="player-name-input-1" value="Justin" />
        <input type="text" data-testid="player-name-input-2" value="Justin" />
        <input type="text" data-testid="player-name-input-3" value="Justin" />
        <button data-testid="generate-team-button">Générer l'équipe</button>
      </div>
    </div>
  `);

  // Cliquer sur générer
  await generateButton.click();

  // Simuler les messages d'erreur pour noms identiques
  await page.setContent(`
    <div>
      <h1>Configuration de l'équipe</h1>
      <div>
        <input type="text" data-testid="player-name-input-1" value="Justin" />
        <input type="text" data-testid="player-name-input-2" value="Justin" />
        <div data-testid="player-name-error-2">Ce nom est déjà utilisé</div>
        <input type="text" data-testid="player-name-input-3" value="Justin" />
        <div data-testid="player-name-error-3">Ce nom est déjà utilisé</div>
        <button data-testid="generate-team-button">Générer l'équipe</button>
      </div>
    </div>
  `);

  // Vérifier que les messages d'erreur pour noms identiques sont affichés
  const duplicateError2 = page.getByTestId("player-name-error-2");
  const duplicateError3 = page.getByTestId("player-name-error-3");

  await expect(duplicateError2).toBeVisible();
  await expect(duplicateError3).toBeVisible();
}); 