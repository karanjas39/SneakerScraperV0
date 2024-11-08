import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { Product } from "@/app/types/Product";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { query, maxPages = 1 }: { query: string; maxPages: number } =
      await req.json();
    const pagesToFetch = Math.min(maxPages, 3);
    const baseUrl = `https://crepdogcrew.com/search?q=${encodeURIComponent(
      query
    )}`;

    const fetchPageData = async (page: number) => {
      const response = await axios.get(baseUrl + `&page=${page}`);
      const html = response.data;
      const $ = cheerio.load(html);
      const products: Product[] = [];

      $(".product-card__info").each((_, element) => {
        const name = $(element).find(".product-card__title a").text().trim();
        const link = $(element).find(".product-card__title a").attr("href");
        const productUrl =
          link && link.startsWith("http")
            ? link
            : `https://crepdogcrew.com${link}`;

        const salePrice = $(element)
          .find("sale-price .cvc-money")
          .text()
          .trim()
          .replace(/₹|\s|,/g, "");
        const regularPrice = $(element)
          .find("compare-at-price .cvc-money")
          .text()
          .trim()
          .replace(/₹|\s|,/g, "");

        products.push({
          name,
          link: productUrl,
          salePrice: salePrice ? `₹${salePrice}` : null,
          regularPrice: regularPrice ? `₹${regularPrice}` : salePrice,
        });
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
