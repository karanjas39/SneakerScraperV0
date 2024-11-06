import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { Product } from "@/app/types/Product";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { query, maxPages = 1 }: { query: string; maxPages: number } =
      await req.json();

    const pagesToFetch = Math.min(maxPages, 3);

    const fetchPageData = async (page: number) => {
      const response = await axios.get(
        `https://marketplace.mainstreet.co.in/search?q=${encodeURIComponent(
          query
        )}&page=${page}`
      );
      const html = response.data;

      const $ = cheerio.load(html);
      const products: Product[] = [];

      $(".card__information").each((_, element) => {
        const name = $(element).find("a").text().trim();
        const link =
          "https://marketplace.mainstreet.co.in" +
          $(element).find("a").attr("href")!;

        const salePrice =
          $(element)
            .closest(".card__information")
            .find(".price__sale .price-item--sale")
            .text()
            .trim() || null;

        const regularPrice =
          $(element)
            .closest(".card__information")
            .find(".price__regular .price-item--regular")
            .text()
            .trim() || null;

        products.push({ name, link, salePrice, regularPrice });
      });

      return products.filter(
        (product) => product.salePrice !== null && product.regularPrice !== null
      );
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
