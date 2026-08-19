/** Shared product image helpers — used across catalog, bundles, checkout */

const PHOTO_BY_KEYWORD: Record<string, string> = {
  headphones: '1505740420928-5e560c06d30e',
  headset: '1505740420928-5e560c06d30e',
  earbuds: '1505740420928-5e560c06d30e',
  earphone: '1505740420928-5e560c06d30e',
  keyboard: '1595225476474-87563907a212',
  mechanical: '1595225476474-87563907a212',
  laptop: '1593642632559-0c6d3fc62b89',
  macbook: '1593642632559-0c6d3fc62b89',
  asus: '1593642632559-0c6d3fc62b89',
  mouse: '1527814050087-379381547969',
  phone: '1592750475338-74b7b21085ab',
  iphone: '1592750475338-74b7b21085ab',
  apple: '1592750475338-74b7b21085ab',
  samsung: '1610945265064-0e34e5519bbf',
  galaxy: '1610945265064-0e34e5519bbf',
  xiaomi: '1592750475338-74b7b21085ab',
  watch: '1523275335684-37898b6baf30',
  smartwatch: '1523275335684-37898b6baf30',
  band: '1523275335684-37898b6baf30',
  speaker: '1608043152269-423dbba4e7e1',
  monitor: '1527443224154-c4a3942d3acf',
  tv: '1593359677879-a4bb92f94d0b',
  qled: '1593359677879-a4bb92f94d0b',
  camera: '1516035069371-29a1b244cc32',
  router: '1558618666-fcd25c85cd64',
  charger: '1573739022854-abda39a7af48',
  gan: '1573739022854-abda39a7af48',
  anker: '1573739022854-abda39a7af48',
  shirt: '1620799140188-3b2a02fd9a77',
  panjabi: '1620799140188-3b2a02fd9a77',
  jeans: '1542272604-787c3835535d',
  saree: '1610030169371-5d5ed16f6b5e',
  kurti: '1610030169371-5d5ed16f6b5e',
  blazer: '1507003211169-0a1dd7228f2d',
  shoes: '1542291026-7eec264c27ff',
  running: '1542291026-7eec264c27ff',
  ultraboost: '1542291026-7eec264c27ff',
  air: '1542291026-7eec264c27ff',
  adidas: '1542291026-7eec264c27ff',
  nike: '1542291026-7eec264c27ff',
  chair: '1580480055273-228ff5388ef8',
  sofa: '1555041469-a586c61ea9bc',
  mattress: '1540518614846-7eded433c457',
  cookware: '1556909114-44e3e9399a73',
  cook: '1556909114-44e3e9399a73',
  light: '1565814635949-1a2795910a2e',
  led: '1565814635949-1a2795910a2e',
  cricket: '1531415071028-854baca6946c',
  bat: '1531415071028-854baca6946c',
  willow: '1531415071028-854baca6946c',
  badminton: '1626224582054-0083ea9a8b0d',
  yonex: '1626224582054-0083ea9a8b0d',
  racket: '1626224582054-0083ea9a8b0d',
  bottle: '1602143407151-7111542de6e8',
  water: '1602143407151-7111542de6e8',
  rice: '1568901346375-23c9450c58cd',
  solar: '1509391366360-2e959784a276',
  panel: '1509391366360-2e959784a276',
  steel: '1518349542013-176b6a03cc09',
  copper: '1574345371569-b5413bc7cb9f',
  wire: '1574345371569-b5413bc7cb9f',
  cable: '1574345371569-b5413bc7cb9f',
  industrial: '1581092160607-ee22621dd758',
  machine: '1581092160607-ee22621dd758',
  tool: '1581092160607-ee22621dd758',
  drill: '1504148455328-c376907d081c',
  hardware: '1581092160607-ee22621dd758',
  generator: '1581092160607-ee22621dd758',
  safety: '1581092160607-ee22621dd758',
  helmet: '1581092160607-ee22621dd758',
  bag: '1553062407-98eeb64c6a62',
  backpack: '1553062407-98eeb64c6a62',
  dumbbell: '1534438327276-14e5300c3a48',
  yoga: '1544367567-0f2fcb009e0b',
  vitamin: '1584308666744-24d5c474f2ae',
  gaming: '1593642632559-0c6d3fc62b89',
  rgb: '1618384887929-16ec33fab9ef',
};

const PHOTO_BY_CATEGORY: Record<string, string> = {
  electronics: '1593642632559-0c6d3fc62b89',
  fashion: '1620799140188-3b2a02fd9a77',
  sports: '1542291026-7eec264c27ff',
  home: '1580480055273-228ff5388ef8',
  food: '1568901346375-23c9450c58cd',
  industrial: '1574345371569-b5413bc7cb9f',
};

const DEFAULT_PHOTO = '1568901346375-23c9450c58cd';
const SORTED_KEYWORDS = Object.keys(PHOTO_BY_KEYWORD).sort((a, b) => b.length - a.length);

export function unsplashUrl(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?w=600&h=600&fit=crop&q=80&auto=format`;
}

export function defaultProductImage(category?: string): string {
  const cat = category?.toLowerCase().trim() || '';
  const photoId = PHOTO_BY_CATEGORY[cat] || DEFAULT_PHOTO;
  return unsplashUrl(photoId);
}

export function isValidImageUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes('placehold.co')) return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:image');
}

export function getFirstImageFromJson(images: unknown): string {
  try {
    if (!images) return '';
    if (Array.isArray(images)) {
      const first = images.find(isValidImageUrl);
      if (first) return (first as string).trim();
      for (const item of images) {
        if (typeof item === 'object' && item !== null) {
          const u = (item as any).url || (item as any).src || (item as any).image;
          if (isValidImageUrl(u)) return u.trim();
        }
      }
      return '';
    }
    if (typeof images === 'string') {
      const trimmed = images.trim();
      if (isValidImageUrl(trimmed)) return trimmed;
      try {
        const parsed = JSON.parse(trimmed);
        return getFirstImageFromJson(parsed);
      } catch {
        return '';
      }
    }
    if (typeof images === 'object' && images !== null) {
      const u = (images as any).url || (images as any).src || (images as any).image;
      if (isValidImageUrl(u)) return u.trim();
    }
  } catch {
    /* ignore */
  }
  return '';
}

function keywordFromText(text: string): string {
  const lower = text.toLowerCase();
  for (const key of SORTED_KEYWORDS) {
    if (lower.includes(key)) return key;
  }
  return '';
}

function categoryPhotoId(category?: string): string | null {
  if (!category) return null;
  const normalized = category.toLowerCase().trim();
  for (const [cat, id] of Object.entries(PHOTO_BY_CATEGORY)) {
    if (normalized.includes(cat)) return id;
  }
  return PHOTO_BY_CATEGORY[normalized] || null;
}

export interface ProductImageSource {
  name?: string;
  category?: string;
  images?: unknown;
  image?: string;
  img?: string;
}

/** Resolve a display image for a product — prefers stored URL, falls back to name/category match */
export function resolveProductImage(product?: ProductImageSource | null): string {
  if (!product) return defaultProductImage();

  // 1. Direct explicit image or img property (if already a valid URL and not placeholder)
  if (isValidImageUrl(product.image)) {
    return (product.image as string).trim();
  }
  if (isValidImageUrl(product.img)) {
    return (product.img as string).trim();
  }

  // 2. Extracted from images column (array or JSON)
  const stored = getFirstImageFromJson(product.images);
  if (stored) {
    return stored;
  }

  // 3. Keyword matching based on product name
  const fromName = keywordFromText(product.name || '');
  if (fromName) return unsplashUrl(PHOTO_BY_KEYWORD[fromName]);

  // 4. Keyword matching based on category
  const fromCategoryKey = keywordFromText(product.category || '');
  if (fromCategoryKey) return unsplashUrl(PHOTO_BY_KEYWORD[fromCategoryKey]);

  // 5. Category lookup
  const catId = categoryPhotoId(product.category);
  if (catId) return unsplashUrl(catId);

  return defaultProductImage(product.category);
}

export function isValidUuid(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
