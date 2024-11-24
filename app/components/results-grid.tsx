import React from "react";
import { Product } from "@/app/types";

interface ResultsGridProps {
  results: Record<string, Product[]>;
}

export function ResultsGrid({ results }: ResultsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-8">
      {Object.entries(results).map(([platform, products]) => (
        <div key={platform} className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 capitalize">
            {platform} ({products.length} results)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium mb-2">{product.name}</h4>
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mb-2 block"
                >
                  View Product
                </a>
                <div className="space-y-1">
                  {product.regularPrice && (
                    <p
                      className={
                        product.salePrice !== product.regularPrice
                          ? "text-gray-500 line-through"
                          : ""
                      }
                    >
                      Regular: {product.regularPrice}
                    </p>
                  )}
                  {product.salePrice &&
                    product.salePrice !== product.regularPrice && (
                      <p className="text-green-600 font-medium">
                        Sale: {product.salePrice}
                      </p>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
