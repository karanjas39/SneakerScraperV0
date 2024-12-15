import { Product, ScrapingResult } from "../types";
import axios from "axios";
import * as cheerio from "cheerio";

export async function crepdogcrew(query: string): Promise<ScrapingResult> {
  try {
    const url = `https://crepdogcrew.com/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });

    const $ = cheerio.load(data);
    const products: Product[] = [];

    $(".product-card__info").each((index, element) => {
      const name = $(element).find(".product-card__title a").text().trim();
      const link = $(element).find(".product-card__title a").attr("href");
      const productUrl = link ? `https://crepdogcrew.com${link}` : null;

      const salePriceEl = $(element).find("sale-price .cvc-money");
      const regularPriceEl = $(element).find("compare-at-price .cvc-money");

      const salePrice = salePriceEl
        .text()
        .trim()
        .replace(/₹|\s|,/g, "");
      const regularPrice =
        regularPriceEl
          .text()
          .trim()
          .replace(/₹|\s|,/g, "") || salePrice;

      if (name && productUrl) {
        products.push({
          name,
          link: productUrl,
          salePrice: salePrice ? `₹${salePrice}` : null,
          regularPrice: regularPrice ? `₹${regularPrice}` : null,
        });
      }
    });

    return {
      data: products,
      message:
        products.length > 0
          ? `Successfully found ${products.length} products`
          : "No products found",
    };
  } catch (error) {
    console.error("Scraping error:", error);
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  }
}

export async function limitedEdt(query: string): Promise<ScrapingResult> {
  try {
    const limit = 20;
    const apiUrl = `https://services.mybcapps.com/bc-sf-filter/search/suggest?t=${Date.now()}&shop=limitededt-india.myshopify.com&locale=en&q=${encodeURIComponent(
      query
    )}&sid=7ff887fa-5401-4aab-959c-4b5c75191cf8&re_run_if_typo=true&event_type=suggest&pg=search_page&product_limit=${limit}&collection_limit=3&suggestion_limit=5&page_limit=3&suggestionMode=prod&dym_limit=2`;

    const { data } = await axios.get(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json",
      },
    });

    const products = data.products || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedProducts: Product[] = products.map((product: any) => {
      const { title, handle, price_min, compare_at_price_min } = product;

      const productUrl = `https://limitededt.in/products/${handle}`;

      const salePrice = price_min ? `₹${price_min}` : null;
      const regularPrice = compare_at_price_min
        ? `₹${compare_at_price_min}`
        : salePrice;

      return {
        name: title || "No name available",
        link: productUrl,
        salePrice: salePrice,
        regularPrice: regularPrice,
      };
    });

    return {
      data: formattedProducts,
      message:
        formattedProducts.length > 0
          ? `Successfully found ${formattedProducts.length} products`
          : "No products found",
    };
  } catch (error) {
    console.error("API error:", error);
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  }
}

export async function hypefly(query: string): Promise<ScrapingResult> {
  try {
    const apiUrl = `https://meili.hypefly.co.in/multi-search`;

    const requestData = {
      queries: [
        {
          indexUid: "product",
          q: query,
          attributesToHighlight: ["*"],
          facets: [
            "brands.name",
            "lowestPrice",
            "productCategory.name",
            "productType.name",
            "variants.size",
          ],
          filter: ["lowestPrice>=0"],
          highlightPostTag: "__ais-highlight__",
          highlightPreTag: "__ais-highlight__",
          limit: 21,
          offset: 20,
          sort: ["id:desc"],
        },
      ],
    };

    const { data } = await axios.post(apiUrl, requestData, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json",
        Authorization: `Bearer 2b089e1ba60034cd6382c5c3c13f9d63519448983153abf6daebf3ea9031f25e`,
      },
    });

    const products = data.results[0].hits || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedProducts: Product[] = products.map((product: any) => {
      const { name, lowestPrice, slug, variants } = product;

      const variantsWithPriceDifference = variants
        .filter(
          (variant: { compareAtPrice: null }) => variant.compareAtPrice !== null
        )
        .map((variant: { compareAtPrice: number; salePrice: number }) => ({
          ...variant,
          priceDifference: variant.compareAtPrice - variant.salePrice,
        }));

      const maxDifferenceVariant = variantsWithPriceDifference.reduce(
        (
          max: { priceDifference: number },
          current: { priceDifference: number }
        ) => (current.priceDifference > max.priceDifference ? current : max),
        variantsWithPriceDifference[0]
      );

      const productUrl = `https://hypefly.co.in/products/${slug}`;

      const salePrice = !maxDifferenceVariant
        ? `₹${lowestPrice}`
        : `₹${maxDifferenceVariant.salePrice}`;
      const regularPrice = maxDifferenceVariant
        ? `₹${maxDifferenceVariant.compareAtPrice}`
        : `₹${salePrice}`;

      return {
        name: name || "No name available",
        link: productUrl,
        salePrice: salePrice,
        regularPrice: regularPrice,
      };
    });

    return {
      data: formattedProducts,
      message:
        formattedProducts.length > 0
          ? `Successfully found ${formattedProducts.length} products`
          : "No products found",
    };
  } catch (error) {
    console.error("API error:", error);
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  }
}

export async function vegnonveg(query: string): Promise<ScrapingResult> {
  try {
    const url = `https://www.vegnonveg.com/search?q=${encodeURIComponent(
      query
    )}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });

    const $ = cheerio.load(data);
    const products: Product[] = [];

    $(".product").each((index, element) => {
      const name = $(element).find(".p-name").text().trim();
      const linkElement = $(element).find("a");
      const link = linkElement.attr("href");
      const productUrl =
        link && link.startsWith("http")
          ? link
          : `https://www.vegnonveg.com${link}`;

      const priceSection = $(element).find(".info p:last-child");
      const salePriceElement = priceSection.find("span:not(:has(del))");
      const regularPriceElement = priceSection.find("del");

      const salePrice = salePriceElement
        .text()
        .trim()
        .replace(/₹|\s|,/g, "");
      const regularPrice =
        regularPriceElement
          .text()
          .trim()
          .replace(/₹|\s|,/g, "") || salePrice;

      if (name && productUrl) {
        products.push({
          name,
          link: productUrl,
          salePrice: salePrice ? `₹${salePrice}` : null,
          regularPrice: regularPrice ? `₹${regularPrice}` : null,
        });
      }
    });

    return {
      data: products,
      message:
        products.length > 0
          ? `Successfully found ${products.length} products`
          : "No products found",
    };
  } catch (error) {
    console.error("Scraping error:", error);
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  }
}

export async function sneakerplug(query: string): Promise<ScrapingResult> {
  try {
    const url = `https://sneakerplug.co.in/search?q=${encodeURIComponent(
      query
    )}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });

    const $ = cheerio.load(data);
    const products: Product[] = [];

    $(".innerer").each((index, element) => {
      const name = $(element).find(".product-block__title").text().trim();
      const linkElement = $(element).find("a.product-link");
      const link = linkElement.attr("href");
      const productUrl = link ? `https://sneakerplug.co.in${link}` : null;

      const price = $(element)
        .find(".product-price__amount .money")
        .text()
        .trim()
        .replace(/₹|\s|,/g, "");

      if (name && productUrl && price) {
        products.push({
          name,
          link: productUrl,
          salePrice: `₹${price}`,
          regularPrice: `₹${price}`,
        });
      }
    });

    return {
      data: products,
      message:
        products.length > 0
          ? `Successfully found ${products.length} products`
          : "No products found",
    };
  } catch (error) {
    console.error("Scraping error:", error);
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  }
}

export async function mainstreet(query: string): Promise<ScrapingResult> {
  try {
    const url = `https://marketplace.mainstreet.co.in/search?q=${encodeURIComponent(
      query
    )}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });

    const $ = cheerio.load(data);
    const products: Product[] = [];

    $(".card__information").each((index, element) => {
      const name = $(element).find("a").text().trim();
      const link = $(element).find("a").attr("href");
      const productUrl = link
        ? `https://marketplace.mainstreet.co.in${link}`
        : null;

      const priceContainer = $(element).find(".price");
      const isOnSale = priceContainer.hasClass("price--on-sale");

      let salePrice: string | null = null;
      let regularPrice: string | null = null;

      if (isOnSale) {
        regularPrice = priceContainer
          .find(".price__sale .price-item--regular")
          .text()
          .trim()
          .replace(/₹|From|,|\s|Rs./g, "");

        salePrice = priceContainer
          .find(".price__sale .price-item--sale")
          .text()
          .trim()
          .replace(/₹|From|,|\s|Rs./g, "");
      } else {
        regularPrice = priceContainer
          .find(".price__regular .price-item--regular")
          .text()
          .trim()
          .replace(/₹|From|,|\s|Rs./g, "");

        salePrice = regularPrice;
      }

      if (name && productUrl && salePrice) {
        products.push({
          name,
          link: productUrl,
          salePrice: `₹${salePrice}`,
          regularPrice: regularPrice ? `₹${regularPrice}` : `₹${salePrice}`,
        });
      }
    });

    return {
      data: products,
      message:
        products.length > 0
          ? `Successfully found ${products.length} products`
          : "No products found",
    };
  } catch (error) {
    console.error("Scraping error:", error);
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  }
}

export async function nike(query: string): Promise<ScrapingResult> {
  try {
    const url = `https://www.nike.com/in/w?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });

    const $ = cheerio.load(data);
    const products: Product[] = [];

    $(".product-card").each((index, element) => {
      const name = $(element).find(".product-card__title").text().trim();
      const link = $(element).find(".product-card__link-overlay").attr("href");
      const productUrl =
        link && link.startsWith("http") ? link : `https://www.nike.com${link}`;

      const priceWrapper = $(element).find(".product-card__price-wrapper");
      const salePrice = priceWrapper
        .find(".product-price.is--current-price")
        .text()
        .trim()
        .replace(/MRP\s*:\s*₹|\s|,/g, "");

      if (name && productUrl) {
        products.push({
          name,
          link: productUrl,
          salePrice: `₹${salePrice}`,
          regularPrice: `₹${salePrice}`,
        });
      }
    });

    return {
      data: products,
      message:
        products.length > 0
          ? `Successfully found ${products.length} products`
          : "No products found",
    };
  } catch (error) {
    console.error("Scraping error:", error);
    return {
      data: [],
      message:
        error instanceof Error
          ? `Error fetching products: ${error.message}`
          : "An unknown error occurred",
    };
  }
}
