export type Category = "Dress" | "Top" | "Pants" | "Shoes" | "Accessory";
export type ProductColor =
  | "Red"
  | "Blue"
  | "Black"
  | "White"
  | "Green"
  | "Navy"
  | "Pink"
  | "Yellow"
  | "Beige";
export type ProductSize = "XS" | "S" | "M" | "L" | "XL";
export type SortBy = "relevance" | "price_asc" | "price_desc" | "rating" | "newest";

export interface Product {
  id: string;
  name: string;
  category: Category;
  color: ProductColor;
  sizes: ProductSize[];
  price: number;
  rating: number;
  inStock: boolean;
  addedIndex: number;
}

export interface FilterState {
  category: Category[];
  color: ProductColor[];
  size: ProductSize[];
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  inStockOnly: boolean;
  sortBy: SortBy;
}

export const initialFilterState: FilterState = {
  category: [],
  color: [],
  size: [],
  minPrice: null,
  maxPrice: null,
  minRating: null,
  inStockOnly: false,
  sortBy: "relevance"
};

export const allCategories: Category[] = ["Dress", "Top", "Pants", "Shoes", "Accessory"];
export const allColors: ProductColor[] = [
  "Red",
  "Blue",
  "Black",
  "White",
  "Green",
  "Navy",
  "Pink",
  "Yellow",
  "Beige"
];
export const allSizes: ProductSize[] = ["XS", "S", "M", "L", "XL"];
export const apparelCategories: Category[] = ["Dress", "Top", "Pants"];
