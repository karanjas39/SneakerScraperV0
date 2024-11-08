import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { Product } from "@/app/types/Product";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { query, maxPages = 1 }: { query: string; maxPages: number } =
      await req.json();
    const pagesToFetch = Math.min(maxPages, 3);
    const baseUrl = `https://www.vegnonveg.com/search?q=${encodeURIComponent(
      query
    )}`;

    const fetchPageData = async (page: number) => {
      const response = await axios.get(baseUrl + `&page=${page}`);
      const html = response.data;
      const $ = cheerio.load(html);
      const products: Product[] = [];

      $(".product").each((_, element) => {
        const name = $(element).find(".p-name").text().trim();
        const link = $(element).find("a").attr("href");
        const productUrl =
          link && link.startsWith("http")
            ? link
            : `https://www.vegnonveg.com${link}`;

        const priceSection = $(element).find(".info p").last();
        const prices = priceSection.find("span");
        const salePrice = prices
          .last()
          .text()
          .trim()
          .replace(/₹|\s|,/g, "");
        const regularPrice =
          prices.length > 1
            ? prices
                .first()
                .find("del")
                .text()
                .trim()
                .replace(/₹|\s|,/g, "")
            : salePrice;

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
