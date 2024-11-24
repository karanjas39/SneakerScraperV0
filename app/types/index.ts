export interface Product {
  name: string;
  link: string;
  salePrice: string | null;
  regularPrice: string | null;
}

export interface ScrapingResult {
  data: Product[];
  message: string;
}
