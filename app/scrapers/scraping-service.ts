import { ScrapingResult } from "@/app/types";
import {
  crepdogcrew,
  hypefly,
  mainstreet,
  nike,
  sneakerplug,
  stockx,
  vegnonveg,
} from "./scrapers";

export class ScrapingService {
  private static scrapers: Record<
    string,
    (query: string) => Promise<ScrapingResult>
  > = {
    crepdogcrew: crepdogcrew,
    sneakerplug: sneakerplug,
    vegnonveg: vegnonveg,
    mainstreet: mainstreet,
    nike: nike,
    hypefly: hypefly,
    stockx: stockx,
  };

  static async scrape(app: string, query: string): Promise<ScrapingResult> {
    const scraper = this.scrapers[app.toLowerCase()];
    if (!scraper) {
      throw new Error(`Unsupported app: ${app}`);
    }
    return scraper(query);
  }
}
