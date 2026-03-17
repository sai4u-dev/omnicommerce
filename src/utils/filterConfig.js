// src/config/filterConfig.js
import { Tag, Ruler, Palette } from "lucide-react";

/**
 * Sort options available in the product listing header.
 */
export const SORT_OPTIONS = [
  "Featured",
  "Newest",
  "Price: Low–High",
  "Price: High–Low",
  "Best Rated",
];

/**
 * Filter sections rendered in the sidebar and mobile sheet.
 * Each section drives its own UI variant (checkbox vs colour swatch).
 */
export const FILTER_SECTIONS = [
  {
    id: "category",
    icon: Tag, // Pass the component, render it in the consuming component
    label: "Category",
    options: ["Outerwear", "Dresses", "Tops", "Bottoms", "Sets"],
  },
  {
    id: "size",
    icon: Ruler,
    label: "Size",
    options: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "color",
    icon: Palette,
    label: "Colour",
    isColor: true,
    options: [
      { label: "Noir", hex: "#1a1a1a" },
      { label: "Ivory", hex: "#f5f0e8" },
      { label: "Camel", hex: "#c9a96e" },
      { label: "Taupe", hex: "#8b7355" },
      { label: "Blush", hex: "#e8cfc0" },
      { label: "Slate", hex: "#6b7280" },
    ],
  },
];

/**
 * Price slider boundaries (in GBP).
 */
export const PRICE_RANGE_DEFAULT = [0, 2000];
export const PRICE_RANGE_MIN = 0;
export const PRICE_RANGE_MAX = 2000;
export const PRICE_RANGE_STEP = 10;
