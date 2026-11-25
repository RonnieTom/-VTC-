/* 商品資料 + Sketchfab 3D（優先低面數模型） */
window.LaneMartCatalog = {
  apple: {
    id: "apple",
    name: "富士蘋果",
    pack: "約 600g／份",
    price: 22,
    was: 28,
    category: "蔬果",
    cat: "produce",
    unit: "約 600g／份",
    image: "images/apple.jpg",
    badge: "限時優惠",
    stock: 48,
    sku: "A01-APPLE",
    desc: "產地直送，口感脆甜多汁，適合生食或切盤。每日新鮮到店。",
    points: ["當日上架", "冷藏保鮮", "可生食"],
    sketchfab: {
      uid: "03befa0b4b1b45c88bc5aa593cc72aab",
      title: "Apple Fruit Low Poly",
      author: "Askip Studio",
      url: "https://sketchfab.com/3d-models/apple-fruit-low-poly-03befa0b4b1b45c88bc5aa593cc72aab"
    }
  },
  milk: {
    id: "milk",
    name: "全脂鮮奶",
    pack: "1L／瓶",
    price: 26,
    was: 0,
    category: "乳品",
    cat: "dairy",
    unit: "1L／瓶",
    image: "images/milk.jpg",
    badge: "冷藏",
    stock: 36,
    sku: "M02-MILK",
    desc: "全脂鮮奶，乳香濃郁。全程冷藏配送，到店即上架。",
    points: ["冷藏品", "當日配送", "密封包裝"],
    sketchfab: {
      uid: "f9a9d31a97734b91b83d62de7cfa5aa8",
      title: "CC0 - Milk Carton",
      author: "plaggy",
      url: "https://sketchfab.com/3d-models/cc0-milk-carton-f9a9d31a97734b91b83d62de7cfa5aa8"
    }
  },
  eggs: {
    id: "eggs",
    name: "新鮮雞蛋",
    pack: "6 隻／盒",
    price: 18,
    was: 22,
    category: "蛋品",
    cat: "dairy",
    unit: "6 隻／盒",
    image: "images/eggs.jpg",
    badge: "熱賣",
    stock: 60,
    sku: "E03-EGGS",
    desc: "蛋黃飽滿，適合煎蛋、蒸蛋與烘焙。每日檢查效期。",
    points: ["新鮮到店", "盒裝保護", "家常必備"],
    sketchfab: {
      uid: "30a474ccab6b4c8ab879b39aa54629da",
      title: "Egg",
      author: "Alexandraws",
      url: "https://sketchfab.com/3d-models/egg-30a474ccab6b4c8ab879b39aa54629da"
    }
  },
  bread: {
    id: "bread",
    name: "全麥吐司",
    pack: "1 條",
    price: 24,
    was: 0,
    category: "烘焙",
    cat: "bakery",
    unit: "1 條",
    image: "images/bread.jpg",
    badge: "當日烘焙",
    stock: 20,
    sku: "B04-BREAD",
    desc: "烘焙當日出品，口感扎實，帶有全麥香氣。",
    points: ["當日烘焙", "無多餘添加", "早餐首選"],
    sketchfab: {
      uid: "c68c30014fc54888b3ba0eb17fa46414",
      title: "Loaf of Bread",
      author: "Meerschaum Digital",
      url: "https://sketchfab.com/3d-models/loaf-of-bread-c68c30014fc54888b3ba0eb17fa46414"
    }
  },
  spinach: {
    id: "spinach",
    name: "有機菠菜",
    pack: "250g／包",
    price: 16,
    was: 0,
    category: "蔬果",
    cat: "produce",
    unit: "250g／包",
    image: "images/spinach.jpg",
    badge: "有機",
    stock: 25,
    sku: "S05-SPINACH",
    desc: "有機種植，葉片鮮嫩。宜清炒、煮湯或沙律。",
    points: ["有機種植", "洗淨即可烹調", "當季鮮貨"],
    sketchfab: {
      uid: "1dfd949d61ae4d378d7c65571746f693",
      title: "Lettuce",
      author: "SirWyrm",
      url: "https://sketchfab.com/3d-models/lettuce-1dfd949d61ae4d378d7c65571746f693",
      note: "葉菜類示意模型"
    }
  },
  juice: {
    id: "juice",
    name: "鮮搾橙汁",
    pack: "1L／瓶",
    price: 32,
    was: 36,
    category: "飲品",
    cat: "drinks",
    unit: "1L／瓶",
    image: "images/juice.jpg",
    badge: "新鮮搾取",
    stock: 18,
    sku: "J06-JUICE",
    desc: "鮮搾橙汁，無添加糖。冰鎮後風味更佳。",
    points: ["無添加糖", "冷藏保存", "開封後盡快飲用"],
    sketchfab: {
      uid: "c5ceee8f586f41268e71e7aa66be8fde",
      title: "Orange Juice Box + Milk Carton",
      author: "Mykola Dosenko / myk31",
      url: "https://sketchfab.com/3d-models/orange-juice-box-milk-carton-c5ceee8f586f41268e71e7aa66be8fde"
    }
  }
};

window.LaneMartCategories = [
  { id: "all", name: "全部", href: "products.html" },
  { id: "produce", name: "新鮮蔬果", href: "products.html?cat=produce" },
  { id: "dairy", name: "乳品蛋類", href: "products.html?cat=dairy" },
  { id: "bakery", name: "麵包烘焙", href: "products.html?cat=bakery" },
  { id: "drinks", name: "飲品", href: "products.html?cat=drinks" },
  { id: "deals", name: "優惠專區", href: "products.html?deals=1" }
];
