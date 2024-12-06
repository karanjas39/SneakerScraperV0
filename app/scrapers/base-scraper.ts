import { Browser, Page } from "playwright-core"; // Import Browser and Page from playwright-core
import * as playwright from "playwright-aws-lambda"; // Import playwright-aws-lambda

export class BaseScraper {
  /**
   * Creates and launches a new Playwright browser instance using playwright-aws-lambda
   */
  static async createBrowser(): Promise<Browser> {
    // Launch browser using playwright-aws-lambda's launchChromium
    return playwright.launchChromium({
      headless: true, // Ensures the browser runs in headless mode
    });
  }

  /**
   * Sets up a new page in the browser with custom configurations
   */
  static async setupPage(browser: Browser): Promise<Page> {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    // Intercept network requests
    await page.route("**/*", (route) => {
      const resourceType = route.request().resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        route.abort(); // Block unnecessary resources
      } else {
        route.continue();
      }
    });

    return page;
  }

  /**
   * Formats a price string by removing non-numeric characters
   */
  static formatPrice(price: string | null): string | null {
    if (!price) return null;
    const cleanPrice = price.replace(/[^\d.]/g, "");
    return cleanPrice ? `₹${cleanPrice}` : null;
  }

  /**
   * Safely navigates to a URL and waits for a specific selector
   */
  static async safeNavigate(
    page: Page,
    url: string,
    selector: string
  ): Promise<void> {
    try {
      await Promise.race([
        page.goto(url, { waitUntil: "domcontentloaded" }),
        page.waitForSelector(selector, { timeout: 10000 }),
      ]);
    } catch (error) {
      throw new Error(
        `Navigation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
