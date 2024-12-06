import { chromium, Browser, Page } from "playwright";

export class BaseScraper {
  /**
   * Creates and launches a new Playwright browser instance
   */
  static async createBrowser(): Promise<Browser> {
    return chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920,1080",
      ],
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
        page.goto(url, { waitUntil: "networkidle" }),
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
