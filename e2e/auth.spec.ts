import { test, expect } from "@playwright/test";

test.describe("Auth flows", () => {
  test("redirige al login si no está autenticado", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/.*login/);
  });

  test("la página de login renderiza correctamente", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
  });

  test("la página de recuperación de contraseña renderiza correctamente", async ({ page }) => {
    await page.goto("/recuperar-contrasena");
    await expect(page.getByRole("heading", { name: "Recuperar contraseña" })).toBeVisible();
  });
});
