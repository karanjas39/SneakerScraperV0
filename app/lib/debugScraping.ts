import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

/**
 * Debug function to check if the data is being received and parsed correctly.
 * @param url - The URL to fetch.
 * @param selectors - Selectors to verify in the HTML.
 */
export async function debugScraping(url: string, selectors: string[]) {
  try {
    console.log("Sending request to:", url);

    // Fetch the HTML response
    const { data, status } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });

    console.log("HTTP Status Code:", status);
    if (status !== 200) {
      console.error("Error: Non-200 status code received");
      return;
    }

    // Save the raw HTML response for inspection
    fs.writeFileSync("debug-response.html", data);
    console.log("Raw HTML response saved to debug-response.html");

    // Parse the HTML using Cheerio
    const $ = cheerio.load(data);

    // Check each selector
    selectors.forEach((selector) => {
      const elements = $(selector);
      console.log(
        `Selector: '${selector}', Found: ${elements.length} elements`
      );
      if (elements.length > 0) {
        console.log(
          `Sample Content for '${selector}':`,
          elements.first().html()?.substring(0, 200)
        );
      }
    });

    console.log("Debugging complete. Check debug-response.html for raw HTML.");
  } catch (error) {
    const err = error as Error;
    console.error("Error during request or parsing:", err.message);
  }
}
