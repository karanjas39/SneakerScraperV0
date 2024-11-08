import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { Product } from "@/app/types/Product";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { query, maxPages = 1 }: { query: string; maxPages: number } =
      await req.json();
    const pagesToFetch = Math.min(maxPages, 3); // Adjust maxPages to control how many pages to scrape
    const baseUrl = `https://sneakerplug.co.in/search?q=${encodeURIComponent(
      query
    )}`;

    const fetchPageData = async (page: number) => {
      const response = await axios.get(`${baseUrl}&page=${page}`);
      const html = response.data;
      const $ = cheerio.load(html);
      const products: Product[] = [];

      $(".innerer").each((_, element) => {
        const name = $(element).find(".product-block__title").text().trim();
        const relativeLink = $(element).find("a.product-link").attr("href");
        const productUrl = relativeLink
          ? `https://sneakerplug.co.in${relativeLink}`
          : null;
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

      return products;
    };

    const pageRequests = [];
    for (let page = 1; page <= pagesToFetch; page++) {
      pageRequests.push(fetchPageData(page));
    }

    const allPagesData = await Promise.all(pageRequests);
    const allProducts = allPagesData.flat();

    return NextResponse.json(allProducts);
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json({ error: "Failed to scrape data" });
  }
}
