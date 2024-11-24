import puppeteer, { Browser, Page } from "puppeteer";

export class BaseScraper {
  static async createBrowser(): Promise<Browser> {
    return puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
    });
  }

  static async setupPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setRequestInterception(true);

    page.on("request", (request) => {
      const resourceType = request.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    return page;
  }

  static formatPrice(price: string | null): string | null {
    if (!price) return null;
    const cleanPrice = price.replace(/[^\d.]/g, "");
    return cleanPrice ? `₹${cleanPrice}` : null;
  }

  static async safeNavigate(
    page: Page,
    url: string,
    selector: string
  ): Promise<void> {
    try {
      await Promise.race([
        page.goto(url, { waitUntil: "networkidle0" }),
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
