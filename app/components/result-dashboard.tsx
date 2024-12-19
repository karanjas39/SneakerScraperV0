"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Filter, Loader2 } from "lucide-react";
import debounce from "lodash/debounce";
import { Product, ScrapingResult } from "@/app/types";

interface ScraperResult {
  app: string;
  result: ScrapingResult;
}

const SneakerScrapingDashboard: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<ScraperResult[]>([]);
  const [sortByPrice, setSortByPrice] = useState(false);
  const [showOnlySales, setShowOnlySales] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to safely convert price string to number
  const safeNumber = (price: string | null): number => {
    if (!price) return 0;
    // Remove currency symbol and commas, then parse
    const cleanPrice = price.replace(/[^\d.]/g, "");
    return parseFloat(cleanPrice) || 0;
  };

  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/scrape?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setResults(data.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      fetchResults(searchQuery);
    }, 500),
    []
  );

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  const processedResults = useMemo(() => {
    let processedData = results;

    // Filter for sale items only
    if (showOnlySales) {
      processedData = processedData
        .map((result) => ({
          ...result,
          result: {
            ...result.result,
            data: result.result.data.filter(
              (item) =>
                item.salePrice !== null &&
                item.regularPrice !== null &&
                safeNumber(item.salePrice) < safeNumber(item.regularPrice)
            ),
          },
        }))
        .filter((scraperResult) => scraperResult.result.data.length > 0);
    }

    // Sort by price if enabled
    if (sortByPrice) {
      processedData = processedData.map((result) => ({
        ...result,
        result: {
          ...result.result,
          data: [...result.result.data].sort((a, b) => {
            // Prioritize sale price if available, otherwise use regular price
            const priceA = safeNumber(a.salePrice || a.regularPrice);
            const priceB = safeNumber(b.salePrice || b.regularPrice);
            return priceA - priceB;
          }),
        },
      }));
    }

    return processedData;
  }, [results, sortByPrice, showOnlySales]);

  // Calculate analytics based on processed results
  const analytics = useMemo(() => {
    const totalWebsites = processedResults.length;
    const totalProducts = processedResults.reduce(
      (sum, result) => sum + result.result.data.length,
      0
    );
    const websiteNames = processedResults.map((result) => result.app);

    return {
      totalWebsites,
      totalProducts,
      websiteNames,
    };
  }, [processedResults]);

  const renderItemCard = (item: Product, appName: string) => (
    <Card key={`${appName}-${item.name}`} className="w-[300px] m-2">
      <CardHeader>
        <CardTitle className="text-sm truncate">{item.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Platform: {appName}</p>
          {item.regularPrice && (
            <p
              className={
                item.salePrice ? "line-through text-gray-500" : "font-bold"
              }
            >
              Regular Price: {item.regularPrice}
            </p>
          )}
          {item.salePrice && (
            <p className="text-green-600 font-bold">
              Sale Price: {item.salePrice}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(item.link, "_blank")}
          >
            View on Site
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderResultSection = (result: ScraperResult) => {
    const visibleItems = result.result.data.slice(0, 3);
    const hiddenItems = result.result.data.slice(3);

    return (
      <div key={result.app} className="mb-4 capitalize">
        <h3 className="text-lg font-semibold mb-2">{result.app}</h3>
        <div className="flex flex-wrap">
          {visibleItems.map((item) => renderItemCard(item, result.app))}
          {hiddenItems.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="hidden-items">
                <AccordionTrigger>
                  Show {hiddenItems.length} More Items
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap">
                    {hiddenItems.map((item) =>
                      renderItemCard(item, result.app)
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 sm:w-[60%] w-[90%] mx-auto flex-col">
        <div className="relative w-full">
          <Input
            placeholder="Search for sneakers..."
            value={query}
            onChange={handleInputChange}
            className="flex-grow"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <Switch checked={sortByPrice} onCheckedChange={setSortByPrice} />
            <span>Sort by Price</span>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="mr-2 h-4 w-4" />
            <Switch
              checked={showOnlySales}
              onCheckedChange={setShowOnlySales}
            />
            <span>Show Sales</span>
          </div>
        </div>
      </div>

      {processedResults.length > 0 && (
        <div className="p-4 bg-gray-100 rounded-lg my-6">
          <h2 className="text-xl font-bold mb-2">Scraping Analytics</h2>
          <div className="flex flex-col gap-3">
            <div>
              <span className="font-semibold">Websites Scraped:</span>{" "}
              {analytics.totalWebsites}
            </div>
            <div>
              <span className="font-semibold">Total Products:</span>{" "}
              {analytics.totalProducts}
            </div>
            <div>
              <span className="font-semibold">Websites:</span>{" "}
              <span className="capitalize">
                {analytics.websiteNames.join(", ")}
              </span>
            </div>
          </div>
        </div>
      )}

      {processedResults.length > 0 ? (
        processedResults.map(renderResultSection)
      ) : (
        <div className="text-center text-gray-500 mt-4">
          {isLoading
            ? "Searching..."
            : results.length === 0
            ? "No results yet. Enter a query to search."
            : "No products match the current filter."}
        </div>
      )}
    </div>
  );
};

export default SneakerScrapingDashboard;
