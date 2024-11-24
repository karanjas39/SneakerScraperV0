import { NextRequest, NextResponse } from "next/server";

import { ScrapingService } from "@/app/scrapers/scraping-service";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { query, app } = await req.json();

    if (!query || !app) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const result = await ScrapingService.scrape(app, query);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Scraping error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to scrape data";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
