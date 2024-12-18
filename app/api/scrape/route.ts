import {
  crepdogcrew,
  vegnonveg,
  mainstreet,
  nike,
  sneakerplug,
  limitedEdt,
  hypefly,
  superkicks,
  footlocker,
  goat,
  fightclub,
  hustleCulture,
  nbastore,
  dawntown,
} from "@/app/scrapers/scrapers";
import { ScrapingResult } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";

const ScrapingService: Record<
  string,
  (query: string) => Promise<ScrapingResult>
> = {
  crepdogcrew,
  vegnonveg,
  sneakerplug,
  nike,
  mainstreet,
  limitedEdt,
  hypefly,
  superkicks,
  footlocker,
  goat,
  fightclub,
  hustleCulture,
  nbastore,
  dawntown,
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const app = searchParams.get("app");

    if (!query) {
      return NextResponse.json(
        { error: "Missing required query parameter" },
        { status: 400 }
      );
    }

    if (app) {
      const scraper = ScrapingService[app];

      if (!scraper) {
        return NextResponse.json(
          { error: `App '${app}' is not supported` },
          { status: 400 }
        );
      }

      const result = await scraper(query);
      return NextResponse.json({ data: result.data, message: result.message });
    }

    const apps = Object.keys(ScrapingService);

    const results = await Promise.allSettled(
      apps.map(async (appName) => {
        const scraper = ScrapingService[appName];
        return {
          app: appName,
          result: await scraper(query),
        };
      })
    );

    const successfulResults = results
      .filter((result) => result.status === "fulfilled")
      .map(
        (result) =>
          (
            result as PromiseFulfilledResult<{
              app: string;
              result: ScrapingResult;
            }>
          ).value
      );

    const errors = results
      .filter((result) => result.status === "rejected")
      .map((result) => (result as PromiseRejectedResult).reason);

    return NextResponse.json({
      data: successfulResults,
      errors,
      query,
    });
  } catch (error) {
    console.error("Handler error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
