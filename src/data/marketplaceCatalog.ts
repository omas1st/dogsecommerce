import { Product } from '../types';
import { CATEGORY_IMAGES } from './categoryImages';

export interface MarketplaceCategoryDef {
  id: string;
  name: string;
  slug: string;
  count: number;
  description: string;
  icon: string;
}

export interface MarketplaceItem extends Product {
  itemType: string;
  shape: string;
  dimensions?: string;
  material?: string;
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategoryDef[] = [
  {
    id: 'dog-clothing-accessories',
    slug: 'dog-clothing-accessories',
    name: 'Dog Clothing and Accessories',
    count: 52,
    description: 'All-weather apparel, winter parkas, waterproof boots, cooling vests, and tailored accessories for dogs of every size.',
    icon: 'Shirt',
  },
  {
    id: 'dog-beds',
    slug: 'dog-beds',
    name: 'Dog Beds',
    count: 52,
    description: 'Orthopedic memory foam mattresses, calming donut cuddlers, elevated cooling cots, bolster loungers, and cave beds.',
    icon: 'Bed',
  },
  {
    id: 'dog-outdoor-travel',
    slug: 'dog-outdoor-travel',
    name: 'Dog Outdoor and Travel Gear',
    count: 52,
    description: 'Backseat car covers, crash-tested harnesses, hiking saddlebags, airline carriers, life jackets, and portable hydration gear.',
    icon: 'Compass',
  },
  {
    id: 'dog-training-behavior',
    slug: 'dog-training-behavior',
    name: 'Dog Training and Behavior',
    count: 52,
    description: 'Precision training clickers, treat pouches, recall long lines, agility weave poles, calming diffusers, and interactive foraging tools.',
    icon: 'Award',
  },
  {
    id: 'dog-bowls-feeding',
    slug: 'dog-bowls-feeding',
    name: 'Dog Bowls and Feeding Supplies',
    count: 52,
    description: 'Anti-slip stainless bowls, elevated bamboo stands, slow-feeder labyrinth dishes, automatic dispensers, and splashless water bowls.',
    icon: 'Utensils',
  },
  {
    id: 'dog-crates-gates-pens',
    slug: 'dog-crates-gates-pens',
    name: 'Dog Crates, Gates and Pens',
    count: 52,
    description: 'Heavy-duty steel cages, folding wire crates, wooden furniture end-tables, walk-through safety gates, and 8-panel playpens.',
    icon: 'Box',
  },
  {
    id: 'dog-food',
    slug: 'dog-food',
    name: 'Dog Food',
    count: 52,
    description: 'Veterinary-formulated dry kibbles, freeze-dried raw recipes, small & large breed formulas, single-protein meats, and organic grain recipes.',
    icon: 'Bone',
  },
  {
    id: 'dog-treats-chews',
    slug: 'dog-treats-chews',
    name: 'Dog Treats and Chews',
    count: 52,
    description: 'Grass-fed bully sticks, Himalayan hard yak chews, pure beef liver bites, dental ridges, elk antlers, and soft-baked training drops.',
    icon: 'Cookie',
  },
  {
    id: 'dog-collars-leashes-harnesses',
    slug: 'dog-collars-leashes-harnesses',
    name: 'Dog Collars, Leashes and Harnesses',
    count: 52,
    description: 'No-pull ergonomic chest harnesses, biothane waterproof leads, full-grain padded leather collars, hands-free running bungees, and LED night safety bands.',
    icon: 'Shield',
  },
  {
    id: 'dog-toys',
    slug: 'dog-toys',
    name: 'Dog Toys',
    count: 52,
    description: 'Ultra-tough natural rubber chews, squeaky plush animals, braided cotton tug ropes, treat dispensing puzzle balls, and floating discs.',
    icon: 'Gamepad2',
  },
  {
    id: 'dog-grooming-bathing',
    slug: 'dog-grooming-bathing',
    name: 'Dog Grooming and Bathing',
    count: 52,
    description: 'Self-cleaning slicker brushes, de-shedding undercoat rakes, hypoallergenic oatmeal shampoos, silent electric nail grinders, and massage scrubbers.',
    icon: 'Sparkles',
  },
  {
    id: 'dog-health-wellness',
    slug: 'dog-health-wellness',
    name: 'Dog Health and Wellness',
    count: 52,
    description: 'Glucosamine joint chews, wild Alaskan salmon oil, multi-strain probiotics, calming hemp chamomile chews, dental water additives, and wound first-aid care.',
    icon: 'HeartPulse',
  },
];

// Helper to generate 52 distinct items per category with diverse types, shapes, prices, reviews
interface CategoryBuilderConfig {
  catId: string;
  catName: string;
  types: string[];
  shapes: string[];
  baseNames: string[];
  materials: string[];
  dimensionsList: string[];
  priceRange: [number, number];
  images: string[];
  tags: string[];
}

const CATEGORY_CONFIGS: CategoryBuilderConfig[] = [
  // 1. Clothing & Accessories
  {
    catId: 'dog-clothing-accessories',
    catName: 'Dog Clothing and Accessories',
    types: [
      'Waterproof Storm Raincoat',
      'Alpine Thermal Fleece Parka',
      'Cable-Knit Wool Sweater',
      'High-Visibility Reflective Vest',
      'Quilted Puffer Winter Jacket',
      'Cooling Evaporative Vest',
      'UV-Shield Sun Protective Tee',
      'All-Weather Fleece Booties (Set of 4)',
      'Formal Canine Tuxedo Bandana',
      'Water-Resistant Windbreaker Anorak',
      'Heavy-Duty Neoprene Warmth Suit',
      'Snood Thermal Neck Warmer',
      'Reversible Padded Winter Vest',
    ],
    shapes: [
      'Full-Body Hooded',
      'Step-In Wrap',
      'Contoured Cape',
      'Triangular Bandana',
      'Fitted Booties Set',
      'Cylindrical Snood',
      'Oval Puffer Cut',
      'Chest-Shield Vest',
      'Sleeveless Athletic Cut',
      'Double-Buckle Coat',
    ],
    baseNames: [
      'Nordic Summit',
      'Alpine Trail',
      'Harbor Breeze',
      'Cascade Peak',
      'Voyager Reflex',
      'Polar Shield',
      'Coastal Rover',
      'Highland Knit',
      'Tundra Pro',
      'Urban Hound',
      'All-Weather Elite',
      'Timberline Thermal',
      'Glacier Guard',
    ],
    materials: ['Ripstop Nylon', 'Merino Wool Blend', 'Thermal Polar Fleece', 'Waterproof TPU', 'Breathable Air Mesh', 'Water-Resistant Cordura', 'Neoprene Foam'],
    dimensionsList: ['XS (Chest 12-15")', 'S (Chest 16-19")', 'M (Chest 20-25")', 'L (Chest 26-31")', 'XL (Chest 32-38")', 'XXL (Chest 39-46")'],
    priceRange: [7.99, 23.99],
    images: [
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['waterproof', 'warmth', 'reflective', 'washable', 'all-weather'],
  },

  // 2. Dog Beds
  {
    catId: 'dog-beds',
    catName: 'Dog Beds',
    types: [
      'Orthopedic Memory Foam Mattress',
      'Calming Faux-Fur Donut Cuddler',
      'Elevated Breathable Cooling Cot',
      'Bolster Security Lounger Bed',
      'Deep-Pocket Hooded Cave Bed',
      'Waterproof Heavy-Duty Chew-Proof Bed',
      'Heated Therapeutic Joint Mattress',
      'Executive Memory Foam Sofa Couch',
      'Compact Travel Roll-Up Bed',
      'Cooling Gel-Infused Orthopedic Slab',
      'Corner Space-Saver Bolster Nook',
      'Plush Round Microfiber Nest',
      'Low-Profile Senior Mobility Bed',
    ],
    shapes: [
      'Round Donut',
      'Rectangular Bolster',
      'Oval Contour',
      'Square Couch',
      'L-Shaped Corner',
      'Elevated Cot Frame',
      'Cylindrical Bolster',
      'Cave Nest Hood',
      'Hexagonal Pillow',
      'Flat Crate Mat',
    ],
    baseNames: [
      'CloudRest Orthopedic',
      'SlumberHaven Calming',
      'Aerocool Elevated',
      'Heritage Bolster',
      'Sanctuary Cave',
      'TitanShield Chew-Proof',
      'TheraWarm Joint',
      'Manor House Sofa',
      'Nomad Roll-Up',
      'Arctic Chill Gel',
      'Cornerstone Lounger',
      'Zenith Pillow Nest',
      'Serenity Senior Foam',
    ],
    materials: ['High-Density Orthopedic Foam', 'Plush Shag Faux Fur', 'Breathable Textilene Mesh', 'Heavy Cotton Canvas', 'Velvet Microsuede', 'Waterproof Oxford Liner'],
    dimensionsList: ['Small (24" x 18" x 4")', 'Medium (34" x 24" x 6")', 'Large (42" x 30" x 7")', 'Giant (52" x 36" x 8")', 'Round 30" Diameter', 'Round 40" Diameter'],
    priceRange: [14.99, 39.99],
    images: [
      'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['orthopedic', 'memory-foam', 'washable-cover', 'joint-relief', 'cooling'],
  },

  // 3. Outdoor and Travel Gear
  {
    catId: 'dog-outdoor-travel',
    catName: 'Dog Outdoor and Travel Gear',
    types: [
      'Waterproof Car Seat Cover Hammock',
      'Canine Trail Backpack Saddlebag',
      'Airline-Approved Expandable Carrier',
      'High-Buoyancy Doggy Life Jacket',
      'Portable Silicone Water Bottle Dispenser',
      'Foldable Camping Dog Sleeping Bag',
      'All-Terrain Shock-Absorbing Pet Stroller',
      'Crash-Tested Vehicle Safety Tether',
      'Collapsible Travel Kibble Storage Bag',
      'Heavy-Duty Mesh Car Barrier Net',
      'Elevated Car Booster Travel Seat',
      'Reflective Dog Bike Trailer Basket',
      'Emergency Rescue Canine Carry Sling',
    ],
    shapes: [
      'Box Hammock',
      'Dual Saddlebag',
      'Expandable Dome',
      'Contoured Vest with Rescue Handle',
      'Cylindrical Flask',
      'Roll-Up Sleeping Bag',
      'Foldable Stroller Frame',
      'Slanted Booster Cube',
      'Accordion Barrier',
      'Tapered Sling',
    ],
    baseNames: [
      'TrailBlazer Expedition',
      'Voyager Hammock',
      'AeroFlight Carrier',
      'Nautilus Life Vest',
      'HydroPaw Dispenser',
      'Campfire Slumber',
      'Strider All-Terrain',
      'SafeRide Vehicle Tether',
      'PackMaster Kibble',
      'GuardNet Vehicle Barrier',
      'SkyView Booster',
      'RoverBike Trailer',
      'RescueLift Transport',
    ],
    materials: ['600D Waterproof Oxford Fabric', 'Ballistic Nylon', 'Aircraft Aluminum Alloy Frame', 'BPA-Free Silicone & ABS', 'Closed-Cell Foam Core', 'Reinforced Mesh'],
    dimensionsList: ['Standard Car (54" x 58")', 'XL Truck/SUV (60" x 64")', 'Carrier (18" x 11" x 11")', 'Backpack S/M (Pouch 8" x 5")', 'Backpack L/XL (Pouch 12" x 7")'],
    priceRange: [7.99, 24.99],
    images: [
      'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['travel', 'waterproof', 'adventure', 'car-safety', 'hiking'],
  },

  // 4. Training & Behavior
  {
    catId: 'dog-training-behavior',
    catName: 'Dog Training and Behavior',
    types: [
      'Ergonomic Multi-Tone Training Clicker',
      'Hands-Free Magnetic Silicone Treat Pouch',
      '30-Foot Cotton Recall Long Line',
      'Ultrasonic Adjustable Pitch Whistle',
      'Agility Weave Poles & Jump Hurdle Set',
      'Calming Pheromone Electric Diffuser Kit',
      'Wooden Stability Agility Wobble Board',
      'Snuffle Mat Treat Foraging Pad',
      'Scent Detection Canine Training Tins Set',
      'Ultrasonic Ultrasonic Anti-Bark Trainer',
      'Retractable Training Target Stick',
      'Doorbell Potty Communication Bell Set',
      'Place Board Elevated Training Platform',
    ],
    shapes: [
      'Teardrop Clicker',
      'Cylinder Waist Pouch',
      'Hexagonal Agility Base',
      'Circular Wobble Board',
      'Rectangular Foraging Mat',
      'Cone Marker Base',
      'Ribbon Long Line',
      'Round Scent Tin',
      'Target Sphere Tip',
      'Flat Place Platform',
    ],
    baseNames: [
      'Precision Clicker',
      'QuickDraw Treat Pouch',
      'MasterRecall Long Lead',
      'SilentEcho Whistle',
      'AgilityPro Weave Set',
      'CalmSphere Diffuser',
      'BalanceMaster Wobble',
      'NoseWork Snuffle Mat',
      'CanineScents Detection',
      'SonicGuard Trainer',
      'PointerPro Target Stick',
      'ChimeBell Potty System',
      'FocusStation Place Board',
    ],
    materials: ['Food-Grade BPA-Free Silicone', 'Hardwood Maple Plywood', 'Heavy Cotton Webbing', 'Anti-Pill Polar Fleece', 'Stainless Steel Alloy', 'ABS Impact Plastic'],
    dimensionsList: ['15 ft Recall Line', '30 ft Recall Line', '50 ft Recall Line', 'Pouch (5.5" x 4.5" x 2")', 'Snuffle Mat (28" x 28")', 'Platform (30" x 20" x 4")'],
    priceRange: [5.99, 19.99],
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['training', 'recall', 'enrichment', 'agility', 'calming'],
  },

  // 5. Bowls & Feeding Supplies
  {
    catId: 'dog-bowls-feeding',
    catName: 'Dog Bowls and Feeding Supplies',
    types: [
      'Non-Slip Heavy Stainless Steel Dog Bowl',
      'Slow-Feeder Labyrinth Maze Bowl',
      'Elevated Bamboo Dual-Bowl Stand',
      'Floating Disc Splash-Proof Water Dish',
      'Automatic Programmable Portioned Feeder',
      'Ultra-Quiet Stainless Pet Water Fountain',
      'Heavyweight Non-Tip Ceramic Crock Bowl',
      'Collapsible Food-Grade Silicone Travel Dish',
      'Textured Silicone Suction Lick Mat',
      'Silicone Rimmed Food Spill Mat',
      'Ergonomic 15-Degree Tilted Ceramic Feeder',
      'Insulated Thermal Double-Wall Pet Bowl',
      'Measuring Portion Control Food Scoop',
    ],
    shapes: [
      'Round Classic',
      'Spiral Labyrinth Maze',
      'Double-Basin Raised',
      'Hexagonal Maze',
      'Floating Disc Basin',
      'Square Stand',
      'Tilted Ergonomic Oval',
      'Bone-Shaped Dual Mat',
      'Conical Heavy Base',
      'Collapsible Concertina',
    ],
    baseNames: [
      'AquaPure Stainless',
      'SlowPace Maze Feeder',
      'Zenith Elevated Bamboo',
      'SpillZero Floating Dish',
      'AutoPortion Smart Feeder',
      'SpringStream Fountain',
      'Stoneware Heavy Crock',
      'PocketTravel Silicone Dish',
      'CalmLick Texture Pad',
      'TidyFloor Silicone Mat',
      'ErgoTilt Digestive Bowl',
      'ThermaCool Insulated Bowl',
      'ExactGrams Portion Scoop',
    ],
    materials: ['Food-Grade 304 Stainless Steel', 'Heavy Glazed Ceramic', 'Natural Sustainable Bamboo', 'BPA-Free Food-Grade Silicone', 'Recycled Polypropylene'],
    dimensionsList: ['Small (2 Cups / 16 oz)', 'Medium (4 Cups / 32 oz)', 'Large (8 Cups / 64 oz)', 'Giant (12 Cups / 96 oz)', 'Elevated Stand 7" Height', 'Elevated Stand 12" Height'],
    priceRange: [6.49, 19.99],
    images: [
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['stainless-steel', 'slow-feeder', 'bpa-free', 'dishwasher-safe', 'elevated'],
  },

  // 6. Crates, Gates & Pens
  {
    catId: 'dog-crates-gates-pens',
    catName: 'Dog Crates, Gates and Pens',
    types: [
      'Double-Door Folding Metal Wire Dog Crate',
      'Heavy-Duty Escape-Proof Steel Security Crate',
      'Modern Wooden Furniture End-Table Dog Crate',
      'Soft-Sided Lightweight Collapsible Travel Crate',
      'Freestanding 360-Degree Expandable Wooden Gate',
      'Pressure-Mounted Auto-Close Walk-Through Gate',
      '8-Panel Heavy Duty Metal Exercise Playpen',
      'Portable Pop-Up Mesh Exercise Playpen',
      'Extra-Wide Retractable Mesh Safety Gate',
      'Decorative Metal Scrollwork Pet Gate',
      'Corner-Fitting Modular Dog Gate',
      'Crate Comfort Replacement Leak-Proof Pan',
      'Locking Heavy-Duty Crate Caster Wheels (Set of 4)',
    ],
    shapes: [
      'Rectangular Wire Enclosure',
      'Furniture Credenza Cabinet',
      'Octagonal Playpen',
      'Freestanding Z-Fold',
      'Walk-Through Arched Top',
      'Soft Hexagonal Mesh Pop-Up',
      'Square Heavy-Duty Box',
      'Accordion Retractable Wall',
      'Corner Fitting Triangle',
      'Modular 8-Panel Expandable',
    ],
    baseNames: [
      'SafeHaven Folding Wire',
      'Fortress Escape-Proof Steel',
      'Manor Wood End-Table Crate',
      'Nomad Lite Soft Crate',
      'TimberFlex Freestanding Gate',
      'SecurePass Walk-Through Gate',
      'Courtyard 8-Panel Heavy Pen',
      'BreezePop Mesh Playpen',
      'StealthShield Retractable Gate',
      'Artesian Scrollwork Pet Gate',
      'CornerGuard Modular Gate',
      'TuffPan Replacement Tray',
      'GlideLock Caster Wheels Set',
    ],
    materials: ['Heavy-Gauge Powder-Coated Steel', 'Solid Birch & Pine Hardwood', '600D Waterproof Cordura', 'Fiberglass Mesh Screen', 'Reinforced ABS Plastic Corners'],
    dimensionsList: ['24" (Small Breeds)', '30" (Medium Breeds)', '36" (Intermediate Breeds)', '42" (Large Breeds)', '48" (Extra Large)', '54" (Giant Breeds)', 'Gate (29-38" W x 30" H)'],
    priceRange: [19.99, 49.99],
    images: [
      'https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['heavy-duty', 'escape-proof', 'furniture-style', 'folding', 'safe-containment'],
  },

  // 7. Dog Food
  {
    catId: 'dog-food',
    catName: 'Dog Food',
    types: [
      'Grain-Free Freeze-Dried Raw Beef Recipe',
      'Cold-Pressed Wild Alaskan Salmon & Sweet Potato',
      'Heritage Ranch Grass-Fed Beef & Ancient Grains',
      'Small Breed Nutrient-Dense Micro-Kibble',
      'Large Breed Glucosamine Joint-Support Formula',
      'Dehydrated Human-Grade Free-Range Turkey Feast',
      'Puppy Foundation DHA Growth & Brain Formula',
      'Senior Gentle Digestive Pasture Lamb & Rice',
      'Limited Ingredient Roasted Venison & Lentils',
      'High-Performance Working & Sporting Dog Kibble',
      'Weight Management Lean Turkey & Cranberry Recipe',
      'Skin & Coat Cold-Water Whitefish & Flax Formula',
      'Slow-Cooked Canned Wet Stew (12-Pack Case)',
    ],
    shapes: [
      'Round Crisp Kibble',
      'Heart-Shaped Bites',
      'Freeze-Dried Cube Morsels',
      'Tender Meat Patties',
      'Micro-Bead Small Bites',
      'Square Crunchies',
      'Flat Disc Pellets',
      'Shredded Stew Cuts',
      'Loaf Pate Style',
      'Flaked Dehydrated Mix',
    ],
    baseNames: [
      'WildPeak Raw Beef',
      'OceanGlow Salmon & Potato',
      'Heritage Ranch Angus Beef',
      'MightyBite Small Breed',
      'TitanBone Large Breed Joint',
      'Homestead Dehydrated Turkey',
      'FirstSteps Puppy DHA',
      'GoldenYears Gentle Lamb',
      'PureSource Limited Venison',
      'Endurance Pro High-Energy',
      'TrimFit Lean Turkey',
      'CoastalCatch Whitefish',
      'SavorySimmer Gourmet Stew',
    ],
    materials: ['Real Deboned Meat First Ingredient', 'Cold-Pressed Salmon Oil', 'Prebiotic Sweet Potato & Chicory Root', 'Organic Pumpkin & Flax', 'Chelated Zinc & Probiotics'],
    dimensionsList: ['4 lb Bag', '12 lb Bag', '24 lb Bag', '30 lb Bag', 'Freeze-Dried 16 oz Bag', '12 x 13 oz Cans Case'],
    priceRange: [10.99, 29.99],
    images: [
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['grain-free', 'high-protein', 'omega-3', 'sensitive-stomach', 'human-grade'],
  },

  // 8. Dog Treats and Chews
  {
    catId: 'dog-treats-chews',
    catName: 'Dog Treats and Chews',
    types: [
      '100% Grass-Fed Odor-Free Bully Sticks',
      'Himalayan Hard Yak Cheese Chew Bar',
      'Freeze-Dried Single-Ingredient Beef Liver Bites',
      'Enzymatic Tartar-Defense Dental Chews',
      'All-Natural Split Elk Antler Chew Bone',
      'Soft-Baked Peanut Butter & Pumpkin Training Drops',
      'Wild Pacific Salmon Skin Crunchy Rolls',
      'Slow-Smoked Real Chicken Breast Jerky Strips',
      'Organic Dehydrated Sweet Potato Slices',
      'Duck & Wild Blueberry Training Bites',
      'Braided Collagen Long-Lasting Chew Ring',
      'Rawhide-Free Peanut Butter Filled Bone',
      'Calming Chamomile & Valerian Sleep Biscuits',
    ],
    shapes: [
      'Spiral Braided Sticks',
      'Straight 6" & 12" Sticks',
      'Bone-Shaped Biscuits',
      'Star-Ridged Dental Brushes',
      'Cubed Liver Morsels',
      'Wide Jerky Strips',
      'Donut Chew Rings',
      'Twisted Dental Ropes',
      'Round Training Drops',
      'Half-Split Antler Horn',
    ],
    baseNames: [
      'PrairieGold Bully Sticks',
      'Everest Peak Yak Chews',
      'PureCarnivore Beef Liver',
      'DentalShield Tartar Ridges',
      'TimberHorn Split Antlers',
      'Pawtastic Peanut Drops',
      'OceanCrunch Salmon Rolls',
      'SmokeyRanch Chicken Jerky',
      'HarvestSweet Potato Slices',
      'QuickReward Duck Training Bites',
      'CollagenFlex Chew Rings',
      'PureBite Stuffed Bones',
      'Nightfall Calming Biscuits',
    ],
    materials: ['100% Free-Range Grass-Fed Beef', 'Pasture Yak Milk & Lime Juice', 'USDA Inspected Beef Liver', 'Wild Pacific Salmon Skin', 'Whole Organic Pumpkin & Oats'],
    dimensionsList: ['6-Pack 6" Sticks', '3-Pack 12" Sticks', '8 oz Resealable Bag', '16 oz Value Pouch', '2 lb Bulk Pack', '30-Count Dental Box'],
    priceRange: [4.99, 15.99],
    images: [
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['single-ingredient', 'long-lasting', 'dental-health', 'grain-free', 'rawhide-free'],
  },

  // 9. Collars, Leashes and Harnesses
  {
    catId: 'dog-collars-leashes-harnesses',
    catName: 'Dog Collars, Leashes and Harnesses',
    types: [
      'Ergonomic No-Pull Front-Clip Chest Harness',
      'Waterproof Odor-Proof Biothane Trail Leash',
      'Full-Grain Bridle Leather Padded Dog Collar',
      'Shock-Absorbing Hands-Free Running Bungee Leash',
      'Heavy-Duty Tactical K9 Collar with Control Handle',
      'USB Rechargeable Ultra-Bright LED Night Collar',
      'Dual-Handle Traffic Control Padded Leash',
      'Escape-Proof 3-Strap Adventure Harness',
      'Professional Climbers Rope Slip Lead Leash',
      'Quick-Release Lightweight Air-Mesh Step-in Harness',
      'Gentle Martingale Training No-Slip Collar',
      'Retractable 16-Foot Heavy-Duty Tape Leash',
      'Reflective Braided Paracord Dog Leash',
    ],
    shapes: [
      'Y-Front Ergonomic Harness',
      'Step-In Vest Harness',
      'Flat Heavy Webbing',
      'Round Braided Climbing Rope',
      'Wide Padded Leather Collar',
      'Double-Handle Traffic Leash',
      'Bungee Elastic Wave',
      'Martingale Loop Collar',
      'Slip-Over Ring Lead',
      'Buckle Band with ID Plate',
    ],
    baseNames: [
      'AirStrider No-Pull Harness',
      'AquaThane Waterproof Leash',
      'Artisan Bridle Leather Collar',
      'TempoRunner Hands-Free Bungee',
      'K9Commander Tactical Collar',
      'NightGlow Rechargeable LED Collar',
      'TrafficGuard Dual-Handle Leash',
      'SummitTrek Escape-Proof Harness',
      'RockClimber Mountain Slip Lead',
      'BreezeFit Air Mesh Step-In',
      'GentleHold Martingale Collar',
      'FlexiGlide Retractable Lead',
      'ParaTough Braided Leash',
    ],
    materials: ['Military-Grade Mil-Spec Nylon', 'Waterproof TPU-Coated Biothane', 'Full-Grain English Bridle Leather', 'Aviation Aluminum Alloy Carabiners', 'Breathable Sandwich Air-Mesh'],
    dimensionsList: ['Small (Neck 11-15", Chest 15-20")', 'Medium (Neck 14-19", Chest 20-27")', 'Large (Neck 18-24", Chest 26-34")', 'XL (Neck 22-29", Chest 32-42")', 'Leash 5 ft', 'Leash 6 ft'],
    priceRange: [6.99, 18.99],
    images: [
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['no-pull', 'waterproof', 'leather', 'hands-free', 'reflective'],
  },

  // 10. Dog Toys
  {
    catId: 'dog-toys',
    catName: 'Dog Toys',
    types: [
      'Ultra-Durable Natural Rubber Treat Dispenser',
      'Floating High-Bounce Indestructible Fetch Ball',
      'Multi-Layer Reinforced Squeaky Plush Animal',
      'Triple-Knot Heavy Cotton Dental Tug Rope',
      'Interactive Sliding Puzzle Treat Dispenser Board',
      'Tough Textured Nylon Chew Bone (Bacon Scented)',
      'Crinkle Paper Stuffing-Free Squeaker Mat',
      'Aerodynamic Soft Rubber Flying Fetch Disc',
      'Heavy-Duty Rugged Tire Chew with Tread Grooves',
      'Suction-Cup Floor Tug-of-War Toy',
      'Electronic Wobble Giggle Sound Fetch Ball',
      'Hide-and-Seek Plush Volcano Squeak Toy Set',
      'Scent-Infused Floating Water Fetch Dummy',
    ],
    shapes: [
      'Dumbbell Treat Bone',
      'Sphere Fetch Ball',
      'Ring Toss Donut',
      'Star Ridged Chew',
      'Octagonal Puzzle Board',
      'Animal Plush (Duck/Bear)',
      'Knotted Multi-Strand Rope',
      'Aerodynamic Flying Disc',
      'Tire Tread Ring',
      'Cylindrical Water Dummy',
    ],
    baseNames: [
      'TitanBite Natural Rubber Cone',
      'HydroBounce Floating Ball',
      'ToughPaws Reinforced Plush',
      'KnotMaster Dental Tug Rope',
      'BrainBox Interactive Puzzle',
      'ChewTitan Bacon Nylon Bone',
      'FluffFree Crinkle Squeaker',
      'AeroGlide Rubber Flyer',
      'TreadTough Heavy Tire Chew',
      'PowerSuction Solo Tug Toy',
      'GiggleRoll Interactive Ball',
      'HideAndSqueak Volcano Den',
      'Gundog Scent Retrieve Dummy',
    ],
    materials: ['Non-Toxic All-Natural Tree Rubber', 'Chew-Resistant Ballistic Nylon', 'Food-Grade Durable Polyamide', '100% Natural Unbleached Cotton', 'BPA-Free Polypropylene'],
    dimensionsList: ['Small (Dogs up to 20 lbs)', 'Medium (Dogs 20-50 lbs)', 'Large (Dogs 50-80 lbs)', 'XL / Power Chewers (80+ lbs)', 'Ball 2.5" Standard', 'Rope 24" Length'],
    priceRange: [4.49, 14.99],
    images: [
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['durable', 'enrichment', 'chew-toy', 'interactive', 'squeaky'],
  },

  // 11. Grooming and Bathing
  {
    catId: 'dog-grooming-bathing',
    catName: 'Dog Grooming and Bathing',
    types: [
      'Self-Cleaning Retractable Slicker Shedding Brush',
      'Undercoat De-Shedding Dual-Sided Rake',
      'Hypoallergenic Colloidal Oatmeal & Aloe Shampoo',
      'High-Velocity Variable-Speed Professional Dog Dryer',
      'Whisper-Quiet Cordless USB Pet Nail Grinder',
      'Soft Silicone Massage Bath Scrubber Brush',
      'Tearless Gentle Facial & Puppy Foam Cleanser',
      'Natural Beeswax Soothing Paw & Nose Balm Stick',
      'Fast-Absorbing Microfiber Drying Towel (2-Pack)',
      'Stainless Steel Rounded Safety Grooming Shears Kit',
      'Leave-In Argan Oil Conditioning Detangler Spray',
      'Alcohol-Free Antiseptic Chlorhexidine Flush Wipes',
      'Double-Sided Dematting Comb with Wave Teeth',
    ],
    shapes: [
      'Ergonomic Paddle Brush',
      'Dual-Curved T-Rake',
      'Palm-Grip Silicone Glove',
      'Cylindrical Pump Bottle',
      'Twist-Up Balm Tube',
      'Contoured Electric Handle',
      'Curved Blunt-Tip Shears',
      'Textured Oval Sponge',
      'Large Rectangular Towel',
      'Wide-Grip Dematting Comb',
    ],
    baseNames: [
      'CleanSweep Slicker Brush',
      'UnderCoat Dual De-Shedder',
      'OatCalm Soothing Shampoo',
      'AirBlast Pro Pet Dryer',
      'SilentClaw Cordless Grinder',
      'SilkyLather Bath Scrubber',
      'TearFree Gentle Facial Foam',
      'PawShield Organic Balm Stick',
      'UltraDry Microfiber Towels',
      'PrecisionCut Safety Shears Set',
      'LusterSilk Detangler Spray',
      'SaniWipe Chlorhexidine Wipes',
      'TangleFree Dematting Comb',
    ],
    materials: ['Stainless Steel Fine Pins', 'Organic Colloidal Oatmeal & Organic Aloe', 'Pure Organic Coconut & Beeswax', 'ABS Housing with Copper Motor', 'Ultra-Dense 400 GSM Microfiber'],
    dimensionsList: ['Shampoo 16 fl oz (473 ml)', 'Shampoo 32 fl oz (946 ml)', 'Standard Brush (Medium/Large)', 'Pocket Groomer (Small)', 'Towel (40" x 28")', 'Balm 2 oz Push-Up'],
    priceRange: [5.99, 17.99],
    images: [
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['hypoallergenic', 'de-shedding', 'natural', 'grooming', 'gentle'],
  },

  // 12. Health and Wellness
  {
    catId: 'dog-health-wellness',
    catName: 'Dog Health and Wellness',
    types: [
      'Advanced Glucosamine & Chondroitin Hip & Joint Chews',
      'Wild Alaskan Salmon Oil Omega-3 Liquid Pump',
      'Daily Multi-Strain Probiotic Digestive Enzymes',
      'Calming Hemp Seed & Chamomile Melatonin Chews',
      'Comprehensive 80-Piece Canine Emergency First Aid Kit',
      'Plaque & Tartar Defense Dental Water Additive',
      'Soothing Organic Aloe Ear Cleansing Solution',
      'Allergy & Immune System Quercetin Soft Chews',
      'Vetericyn Antimicrobial Wound & Hydrogel Spray',
      'Senior Canine Complete Multivitamin Complex',
      'Cranberry Urinary Tract Support Soft Chews',
      'Tear Stain Remover & Eye Wash Saline Drops',
      'Self-Adherent Cohesive Veterinary Elastic Bandage Wrap',
    ],
    shapes: [
      'Heart Soft Chews',
      'Bone-Shaped Chews',
      'Dispenser Pump Bottle',
      'Chewable Round Tablets',
      'Red Zippered Emergency Case',
      'Liquid Dropper Vial',
      'Textured Wipe Jar (100ct)',
      'Trigger Spray Bottle',
      'Tub Powder with Measuring Scoop',
      'Flexible Elastic Roll',
    ],
    baseNames: [
      'JointFlex Glucosamine Advanced',
      'PureArctic Salmon Oil Pump',
      'FloraBiotics Digestive Chews',
      'ZenHound Calming Melatonin',
      'K9Rescue Emergency First Aid',
      'DentaClear Water Additive',
      'CleanCanal Aloe Ear Solution',
      'ImmunoShield Allergy Chews',
      'HealFast Antimicrobial Spray',
      'VitalSenior Daily Multivitamin',
      'BerryClean Urinary Chews',
      'BrightEyes Tear Wash Drops',
      'VetWrap Cohesive Bandage Set',
    ],
    materials: ['USP Grade Glucosamine & MSM', 'Wild Caught Cold-Pressed Salmon Oil', '6 Strain Live Probiotics (5 Billion CFU)', 'Organic Chamomile & L-Theanine', 'Hypochlorous Acid Antimicrobial Solution'],
    dimensionsList: ['90 Soft Chews Tub (360g)', '120 Soft Chews Tub (480g)', '16 fl oz Pump Bottle', '32 fl oz Value Jug', 'First Aid Kit (80 Pieces)', '8 oz Ear Flush Bottle'],
    priceRange: [7.99, 21.99],
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['veterinarian-formulated', 'joint-care', 'probiotic', 'calming', 'omega-3'],
  },
];

// Generate exactly 52 items for each of the 12 categories = 624 items
export const generateMarketplaceCatalog = (): MarketplaceItem[] => {
  const allItems: MarketplaceItem[] = [];

  CATEGORY_CONFIGS.forEach((config) => {
    for (let i = 1; i <= 52; i++) {
      const typeIndex = (i - 1) % config.types.length;
      const shapeIndex = (i - 1) % config.shapes.length;
      const baseNameIndex = (i - 1) % config.baseNames.length;
      const materialIndex = (i - 1) % config.materials.length;
      const dimIndex = (i - 1) % config.dimensionsList.length;
      const imageIndex = (i - 1) % config.images.length;

      const itemType = config.types[typeIndex];
      const shape = config.shapes[shapeIndex];
      const baseName = config.baseNames[baseNameIndex];
      const material = config.materials[materialIndex];
      const dimensions = config.dimensionsList[dimIndex];
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
      const rating = Number((4.6 + ((i % 5) * 0.08)).toFixed(1));
      const reviewsCount = 28 + (i * 11) % 450;

      const id = `item-${config.catId}-${i}`;
      const slug = `${config.catId}-${baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`;

      // Natural, clean title generation without repetitive word stutters
      const cleanedItemType = itemType.replace(new RegExp(`^${baseName}\\s*`, 'i'), '');
      let title = `${baseName} ${cleanedItemType}`;
      let activeShape = shape;

      // Special showcase items in Dog Clothing & Accessories modeled on real dogs (60% deducted)
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

      const item: MarketplaceItem = {
        id,
        slug,
        title,
        description: `Premium canine design: ${title}. Precision-crafted with ${material} in an ergonomic ${activeShape.toLowerCase()} configuration (${dimensions}). Modeled directly on live dogs to ensure true-to-size fit, comfort, and lasting durability.`,
        shortDescription: `${itemType} in ${activeShape.toLowerCase()} shape with ${material}. Modeled on real dogs.`,
        price: discountedPrice,
        compareAtPrice: onlineOriginalPrice,
        sku: `HH-${config.catId.toUpperCase().slice(0, 4)}-${String(i).padStart(3, '0')}`,
        images: [photoUrl],
        category: config.catId,
        categoryName: config.catName,
        brand: config.catId === 'dog-clothing-accessories' && i <= 4 ? 'Hound & Harbor Couture' : 'Hound & Harbor Marketplace',
        ownerType: 'platform',
        condition: 'new',
        stock: 35 + (i * 7) % 80,
        rating,
        reviewsCount,
        tags: [...config.tags, activeShape.toLowerCase(), itemType.toLowerCase()],
        isSubscriptionEligible: config.catId.includes('food') || config.catId.includes('treats') || config.catId.includes('wellness'),
        subscriptionDiscountPercentage: 10,
        isPublished: true,
        featured: i <= 4,
        bestSeller: i % 7 === 0,
        itemType,
        shape: activeShape,
        dimensions,
        material,
        suitability: {
          petTypes: ['dog'],
          lifeStages: ['puppy', 'adult', 'senior', 'all_stages'],
          sizes: ['toy', 'small', 'medium', 'large', 'giant', 'all_sizes'],
        },
        variants: [
          { id: `${id}-v1`, name: 'Standard Edition', sku: `${id}-std`, price: discountedPrice, stock: 25, attributes: { Size: dimensions, Color: 'Classic Earth' } },
          { id: `${id}-v2`, name: 'Pro / Plus Edition', sku: `${id}-pro`, price: Number((discountedPrice * 1.15).toFixed(2)), stock: 15, attributes: { Size: dimensions, Color: 'Harbor Teal' } },
        ],
      };

      allItems.push(item);
    }
  });

  return allItems;
};

export const ALL_MARKETPLACE_ITEMS: MarketplaceItem[] = generateMarketplaceCatalog();

export const getMarketplaceItemById = (id: string): MarketplaceItem | undefined => {
  return ALL_MARKETPLACE_ITEMS.find((item) => item.id === id || item.slug === id);
};

export const getItemsByCategory = (categoryId: string): MarketplaceItem[] => {
  if (!categoryId || categoryId === 'all') {
    return ALL_MARKETPLACE_ITEMS;
  }
  return ALL_MARKETPLACE_ITEMS.filter((item) => item.category === categoryId);
};
