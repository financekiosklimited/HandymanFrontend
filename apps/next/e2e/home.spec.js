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
            test_1.test.describe('Home Page', () => {
                test_1.test('should load without client-side errors', async ({ page }) => {
                    const errors = [];
                    // Collect console errors
                    page.on('console', (msg) => {
                        if (msg.type() === 'error') {
                            errors.push(msg.text());
                        }
                    });
                    // Collect page errors
                    page.on('pageerror', (error) => {
                        errors.push(error.message);
                    });
                    // Navigate to home page
                    await page.goto('/');
                    // Wait for the page to be fully loaded
                    await page.waitForLoadState('networkidle');
                    // Check that the page has loaded
                    await test_1.expect(page).toHaveTitle(/Tamagui/);
                    // Verify no errors occurred
                    test_1.expect(errors).toEqual([]);
                });
                test_1.test('should navigate to User page', async ({ page }) => {
                    await page.goto('/');
                    await page.waitForLoadState('networkidle');
                    // Look for a link to user page
                    const userLink = page.getByRole('link', { name: /user/i });
                    if ((await userLink.count()) > 0) {
                        await userLink.click();
                        await page.waitForLoadState('networkidle');
                        // Verify we're on the user page
                        await test_1.expect(page).toHaveURL(/\/user/);
                    }
                });
            });
        }
    };
});
