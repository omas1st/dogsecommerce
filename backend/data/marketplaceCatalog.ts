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
  return [];
};

export const backendMarketplaceCatalog: BackendMarketplaceItem[] = [];

export const findBackendMarketplaceItem = (id: string): BackendMarketplaceItem | undefined => {
  return backendMarketplaceCatalog.find((item) => item.id === id || item.slug === id);
};
