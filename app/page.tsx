"use client";

import React, { useState, useCallback } from "react";
import { SearchInput } from "@/app/components/search-input";
import { ResultsGrid } from "@/app/components/results-grid";
import { Product } from "@/app/types";

const scrapers = [
  "crepdogcrew",
  "sneakerplug",
  "vegnonveg",
  "mainstreet",
  "nike",
  "limitedEdt",
  "hypefly",
  "superkicks",
  "footlocker",
  "goat",
  "fightclub",
  "hustleCulture",
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, Product[]>>({});

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setResults({});

    try {
      // Fetch from all scrapers in parallel
      const promises = scrapers.map((app) =>
        fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, app }),
        }).then((res) => res.json())
      );

      const responses = await Promise.all(promises);

      // Organize results by scraper
      const newResults: Record<string, Product[]> = {};
      responses.forEach((response, index) => {
        if (response.data) {
          newResults[scrapers[index]] = response.data;
        }
      });

      setResults(newResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const totalProducts = Object.values(results).reduce(
    (sum, products) => sum + products.length,
    0
  );

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Sneaker Price Comparison
      </h1>

      <div className="max-w-2xl mx-auto mb-8">
        <SearchInput onSearch={handleSearch} />
      </div>

      {isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Searching across all platforms...</p>
        </div>
      )}

      {!isLoading && totalProducts > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Found {totalProducts} products across {Object.keys(results).length}{" "}
            platforms
          </h2>
          <ResultsGrid results={results} />
        </div>
      )}
    </main>
  );
}
