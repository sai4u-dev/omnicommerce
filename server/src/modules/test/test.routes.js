import express from "express";

const router = express.Router();

const getAllProducts = (req, res) => {
  const page = Number(req.query.page) || 0;
  const perPage = Number(req.query.perPage) || 12;

  const products = generateProducts(page, perPage);

  res.json({
    page,
    perPage,
    hasMore: page < 5,
    data: products,
  });
};

router.get("/products", getAllProducts);

export const getAllProductsRouter = router;

const COLORS = [
  "#1a1a1a",
  "#c9a96e",
  "#8b7355",
  "#d4b896",
  "#f5f0e8",
  "#a0856c",
];
const TAGS = ["NEW", "SALE", "SOLD OUT", "LIMITED", "EXCLUSIVE"];
const generateProducts = (page, perPage = 12) => {
  const names = [
    "Oversized Wool Coat",
    "Silk Slip Dress",
    "Tailored Blazer",
    "Cashmere Turtleneck",
    "Wide Leg Trousers",
    "Linen Shirt Dress",
    "Leather Moto Jacket",
    "Ribbed Midi Skirt",
    "Cropped Cardigan",
    "Wrap Maxi Dress",
    "Denim Jacket",
    "Satin Blouse",
    "Knit Co-ord Set",
    "Pleated Culottes",
    "Shearling Vest",
    "Broderie Dress",
    "Trench Coat",
    "Jersey Maxi Skirt",
    "Cutout Bodysuit",
    "Velvet Blazer",
    "Cargo Trousers",
    "Smocked Top",
    "Faux Fur Coat",
    "Slip Skirt",
  ];
  const brands = ["MAISON", "ATELIER", "STUDIO", "HAUS", "NOIR", "BLANC"];
  const prices = [89, 129, 189, 245, 320, 420, 550, 680, 790, 890, 1100, 1450];
  return Array.from({ length: perPage }, (_, i) => {
    const id = page * perPage + i;
    const hue = (id * 47) % 360;
    const sat = 10 + (id % 3) * 8;
    const lum = 78 + (id % 4) * 4;
    return {
      id,
      name: names[id % names.length],
      brand: brands[id % brands.length],
      price: prices[id % prices.length],
      originalPrice:
        Math.random() > 0.7 ? prices[(id + 3) % prices.length] : null,
      color: `hsl(${hue},${sat}%,${lum}%)`,
      accentColor: `hsl(${hue},${sat + 10}%,${lum - 20}%)`,
      rating: 3.5 + (id % 5) * 0.3,
      reviews: 12 + ((id * 7) % 340),
      tag: Math.random() > 0.65 ? TAGS[id % TAGS.length] : null,
      isWishlisted: false,
      category: ["Outerwear", "Dresses", "Tops", "Bottoms", "Sets"][id % 5],
      sizes: ["XS", "S", "M", "L", "XL"].slice(id % 3, (id % 3) + 3 + (id % 2)),
    };
  });
};
