System.register(["@playwright/test"], function (exports_1, context_1) {
    "use strict";
    var test_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (test_1_1) {
                test_1 = test_1_1;
            }
        ],
        execute: function () {
            test_1.test.describe('Production Mode', () => {
                test_1.test.beforeEach(async ({ page }) => {
                    // Navigate to production server
                    await page.goto('http://localhost:8151');
                });
                test_1.test('should load and hydrate without errors', async ({ page }) => {
                    const errors = [];
                    const warnings = [];
                    // Collect console errors and warnings
                    page.on('console', (msg) => {
                        if (msg.type() === 'error') {
                            errors.push(msg.text());
                        }
                        if (msg.type() === 'warning') {
                            warnings.push(msg.text());
                        }
                    });
                    // Collect page errors
                    page.on('pageerror', (error) => {
                        errors.push(error.message);
                    });
                    // Wait for hydration
                    await page.waitForLoadState('networkidle');
                    await page.waitForLoadState('domcontentloaded');
                    // Check page loaded
                    await test_1.expect(page).toHaveTitle(/Tamagui/);
                    // Verify no errors or warnings
                    test_1.expect(errors, 'Should have no console errors').toEqual([]);
                    test_1.expect(warnings, 'Should have no console warnings').toEqual([]);
                });
                test_1.test('should support client-side navigation', async ({ page }) => {
                    const errors = [];
                    page.on('console', (msg) => {
                        if (msg.type() === 'error') {
                            errors.push(msg.text());
                        }
                    });
                    page.on('pageerror', (error) => {
                        errors.push(error.message);
                    });
                    await page.waitForLoadState('networkidle');
                    // Find and click user link
                    const userLink = page.getByRole('link', { name: /user/i });
                    if ((await userLink.count()) > 0) {
                        await userLink.click();
                        // Wait for client-side navigation
                        await page.waitForURL(/\/user/);
                        await page.waitForLoadState('networkidle');
                        // Verify we're on the user page
                        await test_1.expect(page).toHaveURL(/\/user/);
                        // Verify no errors during navigation
                        test_1.expect(errors, 'Should have no errors during navigation').toEqual([]);
                    }
                });
                test_1.test('should have working interactive elements', async ({ page }) => {
                    await page.waitForLoadState('networkidle');
                    // Try to find and interact with a button
                    const buttons = await page.locator('button').all();
                    if (buttons.length > 0) {
                        const firstButton = buttons[0];
                        if (!firstButton)
                            return;
                        await firstButton.click();
                        // Wait a bit to see if any errors occur
                        await page.waitForTimeout(500);
                        // Check for no errors
                        const hasErrors = await page.evaluate(() => {
                            return window.__hasHydrationError || false;
                        });
                        test_1.expect(hasErrors).toBe(false);
                    }
                });
                test_1.test('should support theme switching', async ({ page }) => {
                    const errors = [];
                    page.on('console', (msg) => {
                        if (msg.type() === 'error') {
                            errors.push(msg.text());
                        }
                    });
                    page.on('pageerror', (error) => {
                        errors.push(error.message);
                    });
                    await page.waitForLoadState('networkidle');
                    // Find the theme switch button
                    const themeButton = page.getByRole('button', { name: /change theme/i });
                    if ((await themeButton.count()) > 0) {
                        // Get initial theme from the button text or HTML class
                        const initialTheme = await page.evaluate(() => {
                            return document.documentElement.classList.contains('t_dark') ? 'dark' : 'light';
                        });
                        // Click to switch theme
                        await themeButton.click();
                        // Wait for theme transition
                        await page.waitForTimeout(300);
                        // Verify theme changed
                        const newTheme = await page.evaluate(() => {
                            return document.documentElement.classList.contains('t_dark') ? 'dark' : 'light';
                        });
                        test_1.expect(newTheme).not.toBe(initialTheme);
                        // Click again to switch back
                        await themeButton.click();
                        await page.waitForTimeout(300);
                        // Verify theme switched back
                        const finalTheme = await page.evaluate(() => {
                            return document.documentElement.classList.contains('t_dark') ? 'dark' : 'light';
                        });
                        test_1.expect(finalTheme).toBe(initialTheme);
                        // Verify no errors during theme switching
                        test_1.expect(errors, 'Should have no errors during theme switching').toEqual([]);
                    }
                });
            });
        }
    };
});
