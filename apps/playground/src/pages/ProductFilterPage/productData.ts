import {
  apparelCategories,
  type Category,
  type FilterState,
  type Product,
  type ProductColor,
  type ProductSize
} from "./filterTypes";

const namePool: Record<Category, string[]> = {
  Dress: [
    "Floral Wrap Dress",
    "Midi Slip Dress",
    "Bodycon Dress",
    "A-line Dress",
    "Maxi Dress",
    "Shirt Dress",
    "Smock Dress"
  ],
  Top: [
    "Linen Blouse",
    "Crop Top",
    "Oversized Tee",
    "Button-down Shirt",
    "Ribbed Tank",
    "Puff Sleeve Top",
    "Halter Top"
  ],
  Pants: [
    "High-waist Jeans",
    "Wide-leg Trousers",
    "Cargo Pants",
    "Slim Chinos",
    "Joggers",
    "Pleated Trousers"
  ],
  Shoes: [
    "Leather Sneakers",
    "Block Heel Mules",
    "Platform Boots",
    "Slip-on Loafers",
    "Strappy Sandals",
    "Chelsea Boots",
    "Ballet Flats"
  ],
  Accessory: [
    "Tote Bag",
    "Silver Necklace",
    "Leather Belt",
    "Silk Scarf",
    "Bucket Hat",
    "Crossbody Bag",
    "Gold Earrings"
  ]
};

const priceBands: Record<Category, [number, number]> = {
  Dress: [38, 185],
  Top: [18, 82],
  Pants: [42, 128],
  Shoes: [58, 285],
  Accessory: [12, 98]
};

const colors: ProductColor[] = [
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
const sizes: ProductSize[] = ["XS", "S", "M", "L", "XL"];
const categories: Category[] = ["Dress", "Top", "Pants", "Shoes", "Accessory"];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

function generateProducts(): Product[] {
  const rng = seededRandom(77);
  const products: Product[] = [];
  let index = 0;

  for (const category of categories) {
    const names = namePool[category];
    for (const color of colors) {
      const count = Math.floor(rng() * 2) + 1;
      for (let i = 0; i < count; i++) {
        const name = names[Math.floor(rng() * names.length)];
        const [lo, hi] = priceBands[category];
        const price = Math.round(lo + rng() * (hi - lo));
        const rating = Math.round((3.0 + rng() * 2.0) * 10) / 10;
        const inStock = rng() > 0.18;

        let productSizes: ProductSize[] = [];
        if (apparelCategories.includes(category)) {
          productSizes = sizes.filter(() => rng() > 0.35);
          if (productSizes.length === 0) productSizes = ["S", "M"];
        }

        products.push({
          id: `P${String(index + 1).padStart(3, "0")}`,
          name,
          category,
          color,
          sizes: productSizes,
          price,
          rating,
          inStock,
          addedIndex: index
        });
        index++;
      }
    }
  }

  return products;
}

export const PRODUCTS: Product[] = generateProducts();

export function applyFilters(products: Product[], filters: FilterState): Product[] {
  let result = products.filter((p) => {
    if (filters.category.length > 0 && !filters.category.includes(p.category)) return false;
    if (filters.color.length > 0 && !filters.color.includes(p.color)) return false;
    if (filters.size.length > 0 && apparelCategories.includes(p.category)) {
      if (!filters.size.some((s) => p.sizes.includes(s))) return false;
    }
    if (filters.minPrice !== null && p.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && p.price > filters.maxPrice) return false;
    if (filters.minRating !== null && p.rating < filters.minRating) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    return true;
  });

  switch (filters.sortBy) {
    case "price_asc":
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result = [...result].sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      result = [...result].sort((a, b) => b.addedIndex - a.addedIndex);
      break;
  }

  return result;
}
