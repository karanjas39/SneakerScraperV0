import { Product, ScrapingResult } from "../types";
import { BaseScraper } from "./base-scraper";

export async function crepdogcrew(query: string): Promise<ScrapingResult> {
  const browser = await BaseScraper.createBrowser();
  const page = await BaseScraper.setupPage(browser);

  try {
    const baseUrl = `https://crepdogcrew.com/search?q=${encodeURIComponent(
      query
    )}`;
    await BaseScraper.safeNavigate(page, baseUrl, ".product-card__info");

    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll(".product-card__info");
      const extractedProducts: Product[] = [];

      productElements.forEach((element) => {
        const name =
          element
            .querySelector(".product-card__title a")
            ?.textContent?.trim() || null;
        const link =
          element
            .querySelector(".product-card__title a")
            ?.getAttribute("href") || null;
        const productUrl = link ? `https://crepdogcrew.com${link}` : null;

        const extractPrice = (priceElement: Element | null): string | null => {
          if (!priceElement) return null;
          const priceText = priceElement
            .querySelector(".cvc-money")
            ?.textContent?.trim();
          if (!priceText) return null;
          return priceText.replace(/₹|\s|,/g, "");
        };

        const salePriceElement = element.querySelector("sale-price");
        const regularPriceElement = element.querySelector("compare-at-price");

        const salePrice = extractPrice(salePriceElement);
        const regularPrice = extractPrice(regularPriceElement) || salePrice;

        if (name && productUrl) {
          extractedProducts.push({
            name,
            link: productUrl,
            salePrice: salePrice ? `₹${salePrice}` : null,
            regularPrice: regularPrice
              ? `₹${regularPrice}`
              : salePrice
              ? `₹${salePrice}`
              : null,
          });
        }
      });

      return extractedProducts;
    });

    return {
      data: products,
      message:
        products.length > 0
          ? `Successfully found ${products.length} products`
          : "No products found",
    };
  } catch (error) {
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  } finally {
    await browser.close();
  }
}

export async function vegnonveg(query: string): Promise<ScrapingResult> {
  const browser = await BaseScraper.createBrowser();
  const page = await BaseScraper.setupPage(browser);

  try {
    const baseUrl = `https://www.vegnonveg.com/search?q=${encodeURIComponent(
      query
    )}`;

    await BaseScraper.safeNavigate(page, baseUrl, ".product");

    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll(".product");
      const extractedProducts: Product[] = [];

      productElements.forEach((element) => {
        const name =
          element.querySelector(".p-name")?.textContent?.trim() || null;
        const linkElement = element.querySelector("a");
        const link = linkElement?.getAttribute("href") || null;
        const productUrl =
          link && link.startsWith("http")
            ? link
            : `https://www.vegnonveg.com${link}`;

        const priceSection = element.querySelector(".info p:last-child");
        const salePriceElement = priceSection?.querySelector(
          "span:not(:has(del))"
        );
        const regularPriceElement = priceSection?.querySelector("del");

        const salePrice =
          salePriceElement?.textContent?.trim().replace(/₹|\s|,/g, "") || null;
        const regularPrice =
          regularPriceElement?.textContent?.trim().replace(/₹|\s|,/g, "") ||
          null;

        if (name && productUrl) {
          extractedProducts.push({
            name,
            link: productUrl,
            salePrice: salePrice ? `₹${salePrice}` : null,
            regularPrice: regularPrice ? `₹${regularPrice}` : salePrice,
          });
        }
      });

      return extractedProducts;
    });

    return {
      data: products,
      message:
        products.length > 0
          ? `Successfully found ${products.length} products`
          : "No products found",
    };
  } catch (error) {
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  } finally {
    await browser.close();
  }
}

export async function sneakerplug(query: string): Promise<ScrapingResult> {
  const browser = await BaseScraper.createBrowser();
  const page = await BaseScraper.setupPage(browser);

  try {
    const baseUrl = `https://sneakerplug.co.in/search?q=${encodeURIComponent(
      query
    )}`;

    await BaseScraper.safeNavigate(page, baseUrl, ".innerer");

    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll(".innerer");
      const extractedProducts: Product[] = [];

      productElements.forEach((element) => {
        const name =
          element.querySelector(".product-block__title")?.textContent?.trim() ||
          null;
        const linkElement = element.querySelector("a.product-link");
        const link = linkElement?.getAttribute("href") || null;
        const productUrl = link ? `https://sneakerplug.co.in${link}` : null;

        const price =
          element
            .querySelector(".product-price__amount .money")
            ?.textContent?.trim()
            .replace(/₹|\s|,/g, "") || null;

        if (name && productUrl && price) {
          extractedProducts.push({
            name,
            link: productUrl,
            salePrice: `₹${price}`,
            regularPrice: `₹${price}`,
          });
        }
      });

      return extractedProducts;
    });

    return {
      data: products,
      message:
        products.length > 0
          ? `Successfully found ${products.length} products`
          : "No products found",
    };
  } catch (error) {
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  } finally {
    await browser.close();
  }
}

export async function mainstreet(query: string): Promise<ScrapingResult> {
  const browser = await BaseScraper.createBrowser();
  const page = await BaseScraper.setupPage(browser);

  try {
    const baseUrl = `https://marketplace.mainstreet.co.in/search?q=${encodeURIComponent(
      query
    )}`;

    await BaseScraper.safeNavigate(page, baseUrl, ".card__information");

    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll(".card__information");
      const extractedProducts: Product[] = [];

      productElements.forEach((element) => {
        const name = element.querySelector("a")?.textContent?.trim() || null;
        const link = element.querySelector("a")?.getAttribute("href") || null;
        const productUrl = link
          ? `https://marketplace.mainstreet.co.in${link}`
          : null;

        const extractPrice = (selector: string): string | null => {
          const priceElement = element.querySelector(selector);
          if (!priceElement) return null;
          const priceText = priceElement.textContent?.trim();
          if (!priceText) return null;
          return priceText.replace(/₹|From|,|\s|Rs./g, "").trim();
        };

        const priceContainer = element.querySelector(".price");
        const isOnSale = priceContainer?.classList.contains("price--on-sale");

        let salePrice: string | null = null;
        let regularPrice: string | null = null;

        if (isOnSale) {
          regularPrice = extractPrice(".price__sale .price-item--regular");
          salePrice = extractPrice(".price__sale .price-item--sale");
        } else {
          regularPrice = extractPrice(".price__regular .price-item--regular");
          salePrice = regularPrice;
        }

        if (name && productUrl) {
          extractedProducts.push({
            name,
            link: productUrl,
            salePrice,
            regularPrice,
          });
        }
      });

      return extractedProducts.filter(
        (product) => product.salePrice !== null && product.regularPrice !== null
      );
    });

    return {
      data: products,
      message:
        products.length > 0
          ? `Successfully found ${products.length} products`
          : "No products found",
    };
  } catch (error) {
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  } finally {
    await browser.close();
  }
}

export async function nike(query: string): Promise<ScrapingResult> {
  const browser = await BaseScraper.createBrowser();
  const page = await BaseScraper.setupPage(browser);

  try {
    const baseUrl = `https://www.nike.com/in/w?q=${encodeURIComponent(query)}`;

    await BaseScraper.safeNavigate(page, baseUrl, ".product-card");

    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll(".product-card");
      const extractedProducts: Product[] = [];

      productElements.forEach((element) => {
        const name =
          element.querySelector(".product-card__title")?.textContent?.trim() ||
          null;
        const link =
          element
            .querySelector(".product-card__link-overlay")
            ?.getAttribute("href") || null;
        const productUrl =
          link && link.startsWith("http")
            ? link
            : `https://www.nike.com${link}`;

        const priceWrapper = element.querySelector(
          ".product-card__price-wrapper"
        );
        const salePrice =
          priceWrapper
            ?.querySelector(".product-price.is--current-price")
            ?.textContent?.trim()
            .replace(/MRP\s*:\s*₹|\s|,/g, "") || null;
        const regularPrice = salePrice;

        if (name && productUrl) {
          extractedProducts.push({
            name,
            link: productUrl,
            salePrice: salePrice ? `₹${salePrice}` : null,
            regularPrice: regularPrice ? `₹${regularPrice}` : salePrice,
          });
        }
      });

      return extractedProducts;
    });

    return {
      data: products,
      message:
        products.length > 0
          ? `Successfully found ${products.length} products`
          : "No products found",
    };
  } catch (error) {
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  } finally {
    await browser.close();
  }
}

export async function hypefly(query: string): Promise<ScrapingResult> {
  const browser = await BaseScraper.createBrowser();
  const page = await BaseScraper.setupPage(browser);

  try {
    const baseUrl = `https://hypefly.co.in/search?query=${encodeURIComponent(
      query
    )}`;

    await BaseScraper.safeNavigate(page, baseUrl, ".ais-InfiniteHits-item");

    const products: Product[] = await page.evaluate(() => {
      const productElements = document.querySelectorAll(
        ".ais-InfiniteHits-item"
      );
      const extractedProducts: Product[] = [];

      productElements.forEach((element) => {
        const nameElement = element.querySelector("h2");
        const name = nameElement ? nameElement.textContent?.trim() : null;

        const linkElement = element.querySelector("a");
        const relativeLink = linkElement
          ? linkElement.getAttribute("href")
          : null;
        const productUrl = relativeLink
          ? `https://hypefly.co.in${relativeLink}`
          : null;

        const priceContainer = element.querySelector(".font-semibold");

        const regularPriceElement = priceContainer?.querySelector("del");
        let regularPrice = regularPriceElement
          ? regularPriceElement.textContent?.replace(/[₹,]/g, "").trim()
          : null;

        const priceText = priceContainer?.textContent || "";
        const salePriceMatch = priceText.match(/from ₹([\d,]+)/);
        const salePrice = salePriceMatch
          ? salePriceMatch[1].replace(/,/g, "").trim()
          : null;

        if (!regularPrice && salePrice) {
          regularPrice = salePrice;
        }

        if (name && productUrl) {
          extractedProducts.push({
            name,
            link: productUrl,
            salePrice: salePrice ? `₹${salePrice}` : null,
            regularPrice: regularPrice ? `₹${regularPrice}` : null,
          });
        }
      });

      return extractedProducts;
    });

    return {
      data: products,
      message:
        products.length > 0
          ? `Successfully found ${products.length} products`
          : "No products found",
    };
  } catch (error) {
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  } finally {
    await browser.close();
  }
}

export async function stockx(query: string): Promise<ScrapingResult> {
  const browser = await BaseScraper.createBrowser();
  const page = await BaseScraper.setupPage(browser);

  try {
    const baseUrl = `https://stockx.com/search?s=${encodeURIComponent(query)}`;

    await BaseScraper.safeNavigate(
      page,
      baseUrl,
      '[data-component="brand-tile"]'
    );

    const products: Product[] = await page.evaluate(() => {
      const productElements = document.querySelectorAll(
        '[data-component="brand-tile"]'
      );
      const extractedProducts: Product[] = [];

      productElements.forEach((element) => {
        try {
          const nameElement = element.querySelector(
            '[data-testid="product-tile-title"]'
          );
          const name = nameElement?.textContent?.trim() || null;

          const linkElement = element.querySelector(
            'a[data-testid="productTile-ProductSwitcherLink"]'
          );
          const relativeLink = linkElement?.getAttribute("href");
          const productUrl = relativeLink
            ? `https://stockx.com${relativeLink}`
            : null;

          const priceElement = element.querySelector(
            '[data-testid="product-tile-lowest-ask-amount"]'
          );
          const price = priceElement?.textContent?.trim() || null;

          const cleanPrice = price?.replace(/^\$/, "").trim() || null;

          if (name && productUrl && cleanPrice) {
            extractedProducts.push({
              name,
              link: productUrl,
              regularPrice: `$${cleanPrice}`,
              salePrice: `$${cleanPrice}`,
            });
          }
        } catch (error) {
          console.error("Error processing product:", error);
        }
      });

      return extractedProducts;
    });

    return {
      data: products,
      message:
        products.length > 0
          ? `Successfully found ${products.length} products`
          : "No products found",
    };
  } catch (error) {
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  } finally {
    await browser.close();
  }
}
