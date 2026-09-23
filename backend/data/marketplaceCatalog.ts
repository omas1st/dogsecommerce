import { ProductOwnerType, ProductCondition } from '../config/constants';
import { CATEGORY_IMAGES } from './categoryImages';

export interface BackendMarketplaceItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  images: string[];
  category: string;
  categoryName: string;
  brand: string;
  ownerType: ProductOwnerType;
  condition: ProductCondition;
  stock: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  isSubscriptionEligible: boolean;
  subscriptionDiscountPercentage?: number;
  isPublished: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  itemType: string;
  shape: string;
  dimensions?: string;
  material?: string;
  variants: any[];
}

export const CATEGORIES_LIST = [
  { id: 'dog-clothing-accessories', name: 'Dog Clothing and Accessories' },
  { id: 'dog-beds', name: 'Dog Beds' },
  { id: 'dog-outdoor-travel', name: 'Dog Outdoor and Travel Gear' },
  { id: 'dog-training-behavior', name: 'Dog Training and Behavior' },
  { id: 'dog-bowls-feeding', name: 'Dog Bowls and Feeding Supplies' },
  { id: 'dog-crates-gates-pens', name: 'Dog Crates, Gates and Pens' },
  { id: 'dog-food', name: 'Dog Food' },
  { id: 'dog-treats-chews', name: 'Dog Treats and Chews' },
  { id: 'dog-collars-leashes-harnesses', name: 'Dog Collars, Leashes and Harnesses' },
  { id: 'dog-toys', name: 'Dog Toys' },
  { id: 'dog-grooming-bathing', name: 'Dog Grooming and Bathing' },
  { id: 'dog-health-wellness', name: 'Dog Health and Wellness' },
];

const CONFIGS = [
  {
    catId: 'dog-clothing-accessories',
    catName: 'Dog Clothing and Accessories',
    types: ['Waterproof Storm Raincoat', 'Alpine Thermal Fleece Parka', 'Cable-Knit Wool Sweater', 'High-Visibility Reflective Vest', 'Quilted Puffer Winter Jacket', 'Cooling Evaporative Vest'],
    shapes: ['Full-Body Hooded', 'Step-In Wrap', 'Contoured Cape', 'Triangular Bandana', 'Fitted Booties Set'],
    baseNames: ['Nordic Summit', 'Alpine Trail', 'Harbor Breeze', 'Cascade Peak', 'Voyager Reflex', 'Polar Shield'],
    priceRange: [7.99, 23.99],
    images: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80'],
  },
  {
    catId: 'dog-beds',
    catName: 'Dog Beds',
    types: ['Orthopedic Memory Foam Mattress', 'Calming Faux-Fur Donut Cuddler', 'Elevated Breathable Cooling Cot', 'Bolster Security Lounger Bed', 'Deep-Pocket Hooded Cave Bed'],
    shapes: ['Round Donut', 'Rectangular Bolster', 'Oval Contour', 'Square Couch', 'L-Shaped Corner'],
    baseNames: ['CloudRest Orthopedic', 'SlumberHaven Calming', 'Aerocool Elevated', 'Heritage Bolster', 'Sanctuary Cave'],
    priceRange: [14.99, 39.99],
    images: ['https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80'],
  },
  {
    catId: 'dog-outdoor-travel',
    catName: 'Dog Outdoor and Travel Gear',
    types: ['Waterproof Car Seat Cover Hammock', 'Canine Trail Backpack Saddlebag', 'Airline-Approved Expandable Carrier', 'High-Buoyancy Doggy Life Jacket', 'Portable Silicone Water Bottle Dispenser'],
    shapes: ['Box Hammock', 'Dual Saddlebag', 'Expandable Dome', 'Contoured Vest', 'Cylindrical Flask'],
    baseNames: ['TrailBlazer Expedition', 'Voyager Hammock', 'AeroFlight Carrier', 'Nautilus Life Vest', 'HydroPaw Dispenser'],
    priceRange: [7.99, 24.99],
    images: ['https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80'],
  },
  {
    catId: 'dog-training-behavior',
    catName: 'Dog Training and Behavior',
    types: ['Ergonomic Multi-Tone Training Clicker', 'Hands-Free Magnetic Silicone Treat Pouch', '30-Foot Cotton Recall Long Line', 'Agility Weave Poles & Jump Hurdle Set'],
    shapes: ['Teardrop Clicker', 'Cylinder Waist Pouch', 'Hexagonal Agility Base', 'Circular Wobble Board'],
    baseNames: ['Precision Clicker', 'QuickDraw Treat Pouch', 'MasterRecall Long Lead', 'AgilityPro Weave Set'],
    priceRange: [5.99, 19.99],
    images: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80'],
  },
  {
    catId: 'dog-bowls-feeding',
    catName: 'Dog Bowls and Feeding Supplies',
    types: ['Non-Slip Heavy Stainless Steel Dog Bowl', 'Slow-Feeder Labyrinth Maze Bowl', 'Elevated Bamboo Dual-Bowl Stand', 'Floating Disc Splash-Proof Water Dish'],
    shapes: ['Round Classic', 'Spiral Labyrinth Maze', 'Double-Basin Raised', 'Hexagonal Maze'],
    baseNames: ['AquaPure Stainless', 'SlowPace Maze Feeder', 'Zenith Elevated Bamboo', 'SpillZero Floating Dish'],
    priceRange: [6.49, 19.99],
    images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80'],
  },
  {
    catId: 'dog-crates-gates-pens',
    catName: 'Dog Crates, Gates and Pens',
    types: ['Double-Door Folding Metal Wire Dog Crate', 'Heavy-Duty Escape-Proof Steel Security Crate', 'Modern Wooden Furniture End-Table Dog Crate', 'Freestanding 360-Degree Expandable Wooden Gate'],
    shapes: ['Rectangular Wire Enclosure', 'Furniture Credenza Cabinet', 'Octagonal Playpen', 'Freestanding Z-Fold'],
    baseNames: ['SafeHaven Folding Wire', 'Fortress Escape-Proof Steel', 'Manor Wood End-Table Crate', 'TimberFlex Freestanding Gate'],
    priceRange: [19.99, 49.99],
    images: ['https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=800&q=80'],
  },
  {
    catId: 'dog-food',
    catName: 'Dog Food',
    types: ['Grain-Free Freeze-Dried Raw Beef Recipe', 'Cold-Pressed Wild Alaskan Salmon & Sweet Potato', 'Heritage Ranch Grass-Fed Beef & Ancient Grains', 'Small Breed Nutrient-Dense Micro-Kibble'],
    shapes: ['Round Crisp Kibble', 'Heart-Shaped Bites', 'Freeze-Dried Cube Morsels', 'Tender Meat Patties'],
    baseNames: ['WildPeak Raw Beef', 'OceanGlow Salmon & Potato', 'Heritage Ranch Angus Beef', 'MightyBite Small Breed'],
    priceRange: [10.99, 29.99],
    images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80'],
  },
  {
    catId: 'dog-treats-chews',
    catName: 'Dog Treats and Chews',
    types: ['100% Grass-Fed Odor-Free Bully Sticks', 'Himalayan Hard Yak Cheese Chew Bar', 'Freeze-Dried Single-Ingredient Beef Liver Bites', 'Enzymatic Tartar-Defense Dental Chews'],
    shapes: ['Spiral Braided Sticks', 'Straight 6" & 12" Sticks', 'Bone-Shaped Biscuits', 'Star-Ridged Dental Brushes'],
    baseNames: ['PrairieGold Bully Sticks', 'Everest Peak Yak Chews', 'PureCarnivore Beef Liver', 'DentalShield Tartar Ridges'],
    priceRange: [4.99, 15.99],
    images: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80'],
  },
  {
    catId: 'dog-collars-leashes-harnesses',
    catName: 'Dog Collars, Leashes and Harnesses',
    types: ['Ergonomic No-Pull Front-Clip Chest Harness', 'Waterproof Odor-Proof Biothane Trail Leash', 'Full-Grain Bridle Leather Padded Dog Collar', 'Shock-Absorbing Hands-Free Running Bungee Leash'],
    shapes: ['Y-Front Ergonomic Harness', 'Step-In Vest Harness', 'Flat Heavy Webbing', 'Round Braided Climbing Rope'],
    baseNames: ['AirStrider No-Pull Harness', 'AquaThane Waterproof Leash', 'Artisan Bridle Leather Collar', 'TempoRunner Hands-Free Bungee'],
    priceRange: [6.99, 18.99],
    images: ['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80'],
  },
  {
    catId: 'dog-toys',
    catName: 'Dog Toys',
    types: ['Ultra-Durable Natural Rubber Treat Dispenser', 'Floating High-Bounce Indestructible Fetch Ball', 'Multi-Layer Reinforced Squeaky Plush Animal', 'Triple-Knot Heavy Cotton Dental Tug Rope'],
    shapes: ['Dumbbell Treat Bone', 'Sphere Fetch Ball', 'Ring Toss Donut', 'Star Ridged Chew'],
    baseNames: ['TitanBite Natural Rubber Cone', 'HydroBounce Floating Ball', 'ToughPaws Reinforced Plush', 'KnotMaster Dental Tug Rope'],
    priceRange: [4.49, 14.99],
    images: ['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80'],
  },
  {
    catId: 'dog-grooming-bathing',
    catName: 'Dog Grooming and Bathing',
    types: ['Self-Cleaning Retractable Slicker Shedding Brush', 'Undercoat De-Shedding Dual-Sided Rake', 'Hypoallergenic Colloidal Oatmeal & Aloe Shampoo', 'High-Velocity Variable-Speed Professional Dog Dryer'],
    shapes: ['Ergonomic Paddle Brush', 'Dual-Curved T-Rake', 'Palm-Grip Silicone Glove', 'Cylindrical Pump Bottle'],
    baseNames: ['CleanSweep Slicker Brush', 'UnderCoat Dual De-Shedder', 'OatCalm Soothing Shampoo', 'AirBlast Pro Pet Dryer'],
    priceRange: [5.99, 17.99],
    images: ['https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80'],
  },
  {
    catId: 'dog-health-wellness',
    catName: 'Dog Health and Wellness',
    types: ['Advanced Glucosamine & Chondroitin Hip & Joint Chews', 'Wild Alaskan Salmon Oil Omega-3 Liquid Pump', 'Daily Multi-Strain Probiotic Digestive Enzymes', 'Calming Hemp Seed & Chamomile Melatonin Chews'],
    shapes: ['Heart Soft Chews', 'Bone-Shaped Chews', 'Dispenser Pump Bottle', 'Chewable Round Tablets'],
    baseNames: ['JointFlex Glucosamine Advanced', 'PureArctic Salmon Oil Pump', 'FloraBiotics Digestive Chews', 'ZenHound Calming Melatonin'],
    priceRange: [7.99, 21.99],
    images: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80'],
  },
];

export const generateBackendMarketplaceCatalog = (): BackendMarketplaceItem[] => {
  const items: BackendMarketplaceItem[] = [];

  CONFIGS.forEach((config) => {
    for (let i = 1; i <= 52; i++) {
      const typeIndex = (i - 1) % config.types.length;
      const shapeIndex = (i - 1) % config.shapes.length;
      const baseNameIndex = (i - 1) % config.baseNames.length;
      const imageIndex = (i - 1) % config.images.length;

      const itemType = config.types[typeIndex];
      const shape = config.shapes[shapeIndex];
      const baseName = config.baseNames[baseNameIndex];
      const catImagesList = CATEGORY_IMAGES[config.catId] || [];
      let photoUrl = catImagesList.length > 0
        ? catImagesList[(i - 1) % catImagesList.length]
        : config.images[imageIndex % config.images.length];

      const minP = config.priceRange[0];
      const maxP = config.priceRange[1];
      const step = (maxP - minP) / 51;
      // Amazon online benchmark regular price for this item
      let onlineOriginalPrice = Number(Math.min(maxP, minP + step * (i - 1)).toFixed(2));
      // 60% deduction from the regular price of goods (40% remaining price)
      let discountedPrice = Number((onlineOriginalPrice * 0.40).toFixed(2));

      const id = `item-${config.catId}-${i}`;
      const slug = `${config.catId}-${baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`;

      const cleanedItemType = itemType.replace(new RegExp(`^${baseName}\\s*`, 'i'), '');
      let title = `${baseName} ${cleanedItemType}`;
      let activeShape = shape;

      if (config.catId === 'dog-clothing-accessories') {
        const clothingCatalogItems = [
          { title: 'Harvest Pumpkin Festive Pet Halloween Bandana', shape: 'Triangular Bandana', price: 2.00, compare: 5.00, img: '/images/dog_pumpkin_bandana.jpg' },
          { title: 'Highland Calf Plush Pet Costume Headpiece', shape: 'Plush Headpiece', price: 6.67, compare: 16.67, img: '/images/dog_cow_costume.jpg' },
          { title: 'Heritage Blue Plaid Flannel Pet Pajamas', shape: 'Full-Body Pajamas', price: 8.66, compare: 21.65, img: '/images/dog_plaid_pajamas.jpg' },
          { title: 'Storybook Grandma Illusion 2-Piece Pet Costume', shape: '2-Piece Costume', price: 13.33, compare: 33.33, img: '/images/dog_grandma_costume.jpg' },
          { title: 'Alpine Trail Thermal Fleece Parka', shape: 'Full-Body Hooded', price: 12.00, compare: 29.99, img: '/images/dog_winter_parka.jpg' },
          { title: 'Nordic Summit Knit Dog Sweater', shape: 'Step-In Pullover', price: 8.00, compare: 19.99, img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80' },
          { title: 'Alpine Waterproof Storm Raincoat', shape: 'Contoured Cape', price: 10.00, compare: 24.99, img: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80' },
          { title: 'Harbor Breeze Plaid Cold-Weather Jacket', shape: 'Double-Buckle Coat', price: 9.20, compare: 22.99, img: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80' },
          { title: 'Cascade Streetwear Athletic Grey Hoodie', shape: 'Sleeveless Athletic Cut', price: 7.60, compare: 18.99, img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80' },
          { title: 'Classic Crimson Tailored Bandana', shape: 'Triangular Bandana', price: 3.60, compare: 8.99, img: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80' },
          { title: 'Voyager Reflex Cold-Weather High-Visibility Vest', shape: 'Chest-Shield Vest', price: 8.80, compare: 21.99, img: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=800&q=80' },
          { title: 'Highland Knit Chunky Wool Pullover', shape: 'Cozy Pullover', price: 8.40, compare: 20.99, img: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80' },
          { title: 'Coastal Rover Summer Bandana & Shades Set', shape: 'Triangular Bandana', price: 6.00, compare: 14.99, img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80' },
          { title: 'Polar Shield Red Zip-Up Thermal Hoodie', shape: 'Zip-Up Hoodie', price: 8.00, compare: 19.99, img: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=800&q=80' },
          { title: 'Festive Holiday Celebration Pet Costume', shape: 'Full-Body Wrap', price: 6.80, compare: 16.99, img: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=800&q=80' },
          { title: 'Urban Hound Patterned Neckerchief Bandana', shape: 'Triangular Bandana', price: 3.20, compare: 7.99, img: 'https://images.unsplash.com/photo-1583512603866-910c8542ba1b?auto=format&fit=crop&w=800&q=80' },
        ];
        if (i <= clothingCatalogItems.length) {
          const itemDef = clothingCatalogItems[i - 1];
          title = itemDef.title;
          discountedPrice = itemDef.price;
          onlineOriginalPrice = itemDef.compare;
          activeShape = itemDef.shape;
          if (itemDef.img) {
            photoUrl = itemDef.img;
          }
        }
      } else if (config.catId === 'dog-beds' && i === 1) {
        title = 'Hound & Harbor Orthopedic Memory Foam Bolster Bed';
        discountedPrice = 20.00;
        onlineOriginalPrice = 49.99;
        activeShape = 'Orthopedic Bolster';
        photoUrl = '/images/dog_orthopedic_bed.jpg';
      }

      items.push({
        id,
        slug,
        title,
        description: `Premium canine design: ${title}. Precision-crafted in an ergonomic ${activeShape.toLowerCase()} configuration. Modeled directly on live dogs to ensure true-to-size fit, comfort, and lasting durability.`,
        shortDescription: `${itemType} in ${activeShape.toLowerCase()} shape. Modeled on real dogs.`,
        price: discountedPrice,
        compareAtPrice: onlineOriginalPrice,
        sku: `HH-${config.catId.toUpperCase().slice(0, 4)}-${String(i).padStart(3, '0')}`,
        images: [photoUrl],
        category: config.catId,
        categoryName: config.catName,
        brand: config.catId === 'dog-clothing-accessories' && i <= 4 ? 'Hound & Harbor Couture' : 'Hound & Harbor Marketplace',
        ownerType: ProductOwnerType.PLATFORM,
        condition: ProductCondition.NEW,
        stock: 50,
        rating: 4.8,
        reviewsCount: 50 + i * 2,
        tags: [config.catId, activeShape.toLowerCase(), itemType.toLowerCase()],
        isSubscriptionEligible: config.catId.includes('food') || config.catId.includes('treats'),
        isPublished: true,
        itemType,
        shape: activeShape,
        variants: [
          { id: `${id}-v1`, name: 'Standard', sku: `${id}-std`, price: discountedPrice, stock: 30, attributes: {} },
        ],
      });
    }
  });

  return items;
};

export const backendMarketplaceCatalog = generateBackendMarketplaceCatalog();

export const findBackendMarketplaceItem = (id: string): BackendMarketplaceItem | undefined => {
  return backendMarketplaceCatalog.find((item) => item.id === id || item.slug === id);
};
