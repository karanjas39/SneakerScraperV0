"use client";

import { FormEvent, useState } from "react";
import { Product } from "./types/Product";

function HomePage() {
  // States to store query, max pages, selected website, and results
  const [query, setQuery] = useState<string>("");
  const [maxPages, setMaxPages] = useState<number>(1);
  const [selectedWebsite, setSelectedWebsite] = useState<string>("sneakerplug");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Dynamically set the API endpoint based on the selected website
      const response = await fetch(`/api/scrape/${selectedWebsite}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, maxPages }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError("Something went wrong. Please try again. " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6">Sneaker Scraper</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg space-y-4"
      >
        <div className="flex flex-col">
          <label htmlFor="query" className="text-lg font-medium mb-2">
            Search Query
          </label>
          <input
            type="text"
            id="query"
            name="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="maxPages" className="text-lg font-medium mb-2">
            Pages to Scrape
          </label>
          <input
            type="number"
            id="maxPages"
            name="maxPages"
            value={maxPages}
            onChange={(e) => setMaxPages(Number(e.target.value))}
            min="1"
            max="3"
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="website" className="text-lg font-medium mb-2">
            Select Website
          </label>
          <select
            id="website"
            value={selectedWebsite}
            onChange={(e) => setSelectedWebsite(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="sneakerplug">SneakerPlug</option>
            <option value="mainstreet">Mainstreet</option>
            <option value="crepdogcrew">CrepDogCrew</option>
            <option value="vegnonveg">Vegnonveg</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {loading && <p className="mt-6 text-xl">Loading...</p>}
      {error && <p className="mt-6 text-red-500">{error}</p>}

      <div className="mt-8 w-full max-w-lg">
        {products.length > 0 && (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-md shadow-md hover:shadow-lg transition"
              >
                <h2 className="font-semibold text-lg">{product.name}</h2>
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Product
                </a>
                <div className="mt-2 text-gray-600">
                  <strong>Sale Price:</strong> {product.salePrice}
                </div>
                <div className="text-gray-600">
                  <strong>Regular Price:</strong> {product.regularPrice}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
