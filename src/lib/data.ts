export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  image: string;
  tag?: string;
};

export type Brand = {
  id: string;
  name: string;
  /** typographic treatment — swap `logo` in for a real SVG when you have one */
  logo?: string;
  href: string;
};

export type Category = {
  id: string;
  name: string;
  image: string;
  count: number;
};

const pct = (price: number, mrp: number) => Math.round(((mrp - price) / mrp) * 100);

export const discount = pct;

/* ---------------------------------------------------------------- products */
export const products: Product[] = [
  { id: "p1",  name: "Ruby Occasion Gown",       brand: "Label Ritu Kumar", category: "Indianwear", price: 4799,  mrp: 8999,  rating: 4.6, image: "/images/p-gown.jpg",     tag: "Diwali Edit" },
  { id: "p2",  name: "Wine Wool Coat",           brand: "Na-Kd",            category: "Westernwear", price: 3299,  mrp: 6499,  rating: 4.4, image: "/images/p-wine-coat.jpg" },
  { id: "p3",  name: "Seaside Floral Midi",      brand: "Twenty Dresses",   category: "Westernwear", price: 1899,  mrp: 3499,  rating: 4.5, image: "/images/p-floral.jpg" },
  { id: "p4",  name: "Ivory Fringe Cape",        brand: "Swtantra",         category: "Westernwear", price: 2499,  mrp: 4299,  rating: 4.3, image: "/images/p-cape.jpg" },
  { id: "p5",  name: "Graphic Crew Tee",         brand: "H&M",              category: "Menswear",    price: 899,   mrp: 1499,  rating: 4.7, image: "/images/p-tee.jpg" },
  { id: "p6",  name: "Sunshine Co-ord Set",      brand: "Libas",            category: "Westernwear", price: 2199,  mrp: 3999,  rating: 4.5, image: "/images/p-coord.jpg",    tag: "Trending" },
  { id: "p7",  name: "Sky Trench Overlay",       brand: "Cider",            category: "Westernwear", price: 3799,  mrp: 6999,  rating: 4.6, image: "/images/p-trench.jpg" },
  { id: "p8",  name: "Olive Utility Jacket",     brand: "Autumnlane",       category: "Westernwear", price: 2599,  mrp: 4799,  rating: 4.4, image: "/images/p-utility.jpg" },
  { id: "p9",  name: "Blush Longline Coat",      brand: "Nykd",             category: "Westernwear", price: 2999,  mrp: 5499,  rating: 4.2, image: "/images/p-blush.jpg" },
  { id: "p10", name: "Essential White Tee",      brand: "US Polo",          category: "Menswear",    price: 1099,  mrp: 1799,  rating: 4.6, image: "/images/p-graphic.jpg" },
  { id: "p11", name: "Weekend Knit + Denim",     brand: "Baise Gaba",       category: "Westernwear", price: 2799,  mrp: 4999,  rating: 4.5, image: "/images/p-knit.jpg" },
  { id: "p12", name: "Sepia Leather Sneaker",    brand: "Puma",             category: "Footwear",    price: 4499,  mrp: 7999,  rating: 4.7, image: "/images/p-sepia.jpg" },
  { id: "p13", name: "Crimson Runner",           brand: "Nike",             category: "Activewear",  price: 5295,  mrp: 7495,  rating: 4.8, image: "/images/p-runner.jpg",   tag: "Bestseller" },
  { id: "p14", name: "Pulse Smartwatch",         brand: "Fossil",           category: "Gadgets",     price: 6999,  mrp: 11995, rating: 4.3, image: "/images/p-smart.jpg" },
  { id: "p15", name: "Minimal Rose Watch",       brand: "Fossil",           category: "Watches",     price: 5499,  mrp: 8995,  rating: 4.5, image: "/images/p-rose.jpg" },
  { id: "p16", name: "Chrono Steel Watch",       brand: "Titan",            category: "Watches",     price: 7999,  mrp: 12995, rating: 4.6, image: "/images/p-chrono.jpg" },
  { id: "p17", name: "Tropical Top-Handle Bag",  brand: "Chumbak",          category: "Bags",        price: 2399,  mrp: 4199,  rating: 4.4, image: "/images/p-tote.jpg" },
  { id: "p18", name: "Pastel Air Sneaker",       brand: "Nike",             category: "Footwear",    price: 8295,  mrp: 10995, rating: 4.7, image: "/images/p-pastel.jpg",   tag: "New Drop" },
  { id: "p19", name: "Round Frame Shades",       brand: "Ray-Ban",          category: "Accessories", price: 6190,  mrp: 8990,  rating: 4.6, image: "/images/p-shades.jpg" },
  { id: "p20", name: "Layered Chain Set",        brand: "Baise Gaba",       category: "Jewellery",   price: 1499,  mrp: 2999,  rating: 4.5, image: "/images/p-chains.jpg" },
  { id: "p21", name: "Celestial Pendant",        brand: "Hidden Gems",      category: "Jewellery",   price: 999,   mrp: 1999,  rating: 4.4, image: "/images/p-pendant.jpg" },
  { id: "p22", name: "Pearl Charm Bracelet",     brand: "Gulaboo Jaipur",   category: "Jewellery",   price: 1799,  mrp: 3299,  rating: 4.6, image: "/images/p-pearls.jpg" },
  { id: "p23", name: "Royal Purple Silk Saree",  brand: "Rozana Jaipur",    category: "Indianwear",  price: 5499,  mrp: 9999,  rating: 4.8, image: "/images/p-saree.jpg",    tag: "Nykaa wali Shaadi" },
  { id: "p24", name: "Metro Commuter Backpack",  brand: "Wildcraft",        category: "Bags",        price: 2099,  mrp: 3499,  rating: 4.5, image: "/images/p-backpack.jpg" },
  { id: "p25", name: "Chelsea Boot Edit",        brand: "Cavallo",          category: "Footwear",    price: 3499,  mrp: 5999,  rating: 4.3, image: "/images/p-mensedit.jpg" },
  { id: "p26", name: "Everyday Accessories",     brand: "Fossil",           category: "Accessories", price: 4299,  mrp: 7499,  rating: 4.4, image: "/images/p-set.jpg" },
  { id: "p27", name: "Neutral Linen Rack",       brand: "Khara Kapas",      category: "Westernwear", price: 2899,  mrp: 5199,  rating: 4.5, image: "/images/p-rack.jpg" },
  { id: "p28", name: "Sunlit Summer Top",        brand: "Ed-A-Mamma",       category: "Westernwear", price: 1599,  mrp: 2899,  rating: 4.4, image: "/images/p-summer.jpg" },
];

/* ----------------------------------------------------------------- brands */
export const brands: Brand[] = [
  { id: "b1",  name: "H&M",            href: "#" },
  { id: "b2",  name: "Nike",           href: "#" },
  { id: "b3",  name: "Cider",          href: "#" },
  { id: "b4",  name: "Puma",           href: "#" },
  { id: "b5",  name: "US Polo",        href: "#" },
  { id: "b6",  name: "Libas",          href: "#" },
  { id: "b7",  name: "Twenty Dresses", href: "#" },
  { id: "b8",  name: "Nykd",           href: "#" },
  { id: "b9",  name: "Autumnlane",     href: "#" },
  { id: "b10", name: "Fossil",         href: "#" },
  { id: "b11", name: "Chumbak",        href: "#" },
  { id: "b12", name: "Masaba",         href: "#" },
];

/* ------------------------------------------------------------- categories */
export const categories: Category[] = [
  { id: "c1",  name: "Westernwear", image: "/images/cat-western.jpg",   count: 12840 },
  { id: "c2",  name: "Indianwear",  image: "/images/cat-indian.jpg",    count: 9310 },
  { id: "c3",  name: "Menswear",    image: "/images/cat-men.jpg",       count: 7622 },
  { id: "c4",  name: "Kids",        image: "/images/cat-kids.jpg",      count: 4188 },
  { id: "c5",  name: "Home",        image: "/images/cat-home.jpg",      count: 6015 },
  { id: "c6",  name: "Footwear",    image: "/images/cat-footwear.jpg",  count: 5370 },
  { id: "c7",  name: "Bags",        image: "/images/cat-bags.jpg",      count: 3942 },
  { id: "c8",  name: "Jewellery",   image: "/images/cat-jewellery.jpg", count: 8107 },
  { id: "c9",  name: "Activewear",  image: "/images/cat-active.jpg",    count: 2861 },
  { id: "c10", name: "Watches",     image: "/images/cat-watches.jpg",   count: 1744 },
];

/* ------------------------------------------------------------- editorial */
export const editorials = [
  { id: "e1", title: "Build Diwali Wardrobe",  eyebrow: "Glimmering Zari Zardozi", image: "/images/ed-diwali.jpg",  span: true },
  { id: "e2", title: "All Things Festive",     eyebrow: "Statement Jewellery",     image: "/images/ed-festive.jpg" },
  { id: "e3", title: "Nykaa Wali Shaadi",      eyebrow: "Lustrous Silk Organza",   image: "/images/ed-shaadi.jpg",  span: true },
  { id: "e4", title: "Chill Szn, Hot Looks",   eyebrow: "Golden Hour Layers",      image: "/images/ed-chill.jpg" },
  { id: "e5", title: "Metallic Allure",        eyebrow: "Crafty Clutches",         image: "/images/ed-jewel.jpg" },
  { id: "e6", title: "Iconic Sneakers",        eyebrow: "Unreal Savings",          image: "/images/ed-sneaker.jpg" },
];

/* ------------------------------------------------------------ hero slides */
export const heroSlides = [
  {
    id: "h1",
    eyebrow: "Celebration-ready Categories",
    title: "Build Diwali Wardrobe",
    subtitle: "Zari, zardozi and gota — 4,200+ festive styles from India's finest.",
    cta: "Shop the edit",
    image: "/images/hero-diwali.jpg",
    tint: "from-[#310914] via-[#310914]/70",
  },
  {
    id: "h2",
    eyebrow: "Nykaa wali Shaadi",
    title: "Every Ceremony, Covered",
    subtitle: "Sangeet to pheras — lehengas, sarees and everything in between.",
    cta: "Enter the bridal shop",
    image: "/images/hero-shaadi.jpg",
    tint: "from-[#640013] via-[#640013]/70",
  },
  {
    id: "h3",
    eyebrow: "Chill szn, hot looks",
    title: "The Westernwear Drop",
    subtitle: "Trenches, co-ords and layering staples from H&M, Cider & Libas.",
    cta: "Refresh your closet",
    image: "/images/hero-western.jpg",
    tint: "from-[#001325] via-[#001325]/70",
  },
];

export const megaMenu: { label: string; columns: { title: string; links: string[] }[] }[] = [
  {
    label: "Women",
    columns: [
      { title: "Indianwear", links: ["Sarees", "Lehengas", "Kurtas & Sets", "Salwar Suits", "Ethnic Wear"] },
      { title: "Westernwear", links: ["Dresses", "Tops & Tees", "Co-ords", "Jeans", "Outerwear"] },
      { title: "Accessories", links: ["Handbags", "Jewellery", "Footwear", "Sunglasses", "Belts"] },
    ],
  },
  {
    label: "Men",
    columns: [
      { title: "Clothing", links: ["Shirts", "T-Shirts", "Jeans", "Jackets", "Activewear"] },
      { title: "Footwear", links: ["Sneakers", "Formal Shoes", "Sandals", "Sports Shoes"] },
      { title: "Accessories", links: ["Watches", "Wallets", "Backpacks", "Sunglasses"] },
    ],
  },
  {
    label: "Kids",
    columns: [
      { title: "Boys", links: ["T-Shirts", "Shorts", "Ethnic Wear", "Footwear"] },
      { title: "Girls", links: ["Dresses", "Frocks", "Ethnic Wear", "Footwear"] },
      { title: "Baby", links: ["Newborn", "Sleepwear", "Bath Essentials"] },
    ],
  },
  {
    label: "Home",
    columns: [
      { title: "Living", links: ["Bed Sheets", "Cushion Covers", "Rugs & Carpets", "Wall Decor"] },
      { title: "Dining", links: ["Dinnerware", "Serveware", "Cutlery"] },
      { title: "Decor", links: ["Lamps", "Mirrors", "Planters", "Photo Frames"] },
    ],
  },
];

/* --------------------------------------------------------- arc rail model */
export type RailItem =
  | {
      id: string;
      kind: "product";
      title: string;
      sub: string;
      price: number;
      mrp: number;
      image: string;
      tag?: string;
      href: string;
    }
  | { id: string; kind: "brand"; title: string; href: string };

/**
 * Interleave brands between products so the curve reads as
 * "products AND brands", the way Nykaa's "Iconic Brands" rail does.
 */
export const railItems: RailItem[] = (() => {
  const out: RailItem[] = [];
  let bi = 0;
  products.slice(0, 14).forEach((p, i) => {
    out.push({
      id: p.id,
      kind: "product",
      title: p.name,
      sub: `${p.brand} · ₹${p.price.toLocaleString("en-IN")}`,
      price: p.price,
      mrp: p.mrp,
      image: p.image,
      tag: p.tag,
      href: "#",
    });
    if (i % 2 === 1 && bi < brands.length) {
      const b = brands[bi++];
      out.push({ id: b.id, kind: "brand", title: b.name, href: b.href });
    }
  });
  return out.slice(0, 14);
})();

