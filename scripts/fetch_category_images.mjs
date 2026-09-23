import fs from 'fs';
import path from 'path';

const CATEGORIES = [
  {
    id: 'dog-clothing-accessories',
    name: 'Dog Clothing and Accessories',
    queries: ['dog clothes', 'dog coat', 'dog sweater', 'dog jacket', 'dog boots', 'dog vest', 'dog raincoat', 'dog costume', 'canine clothing']
  },
  {
    id: 'dog-beds',
    name: 'Dog Beds',
    queries: ['dog bed', 'dog sleeping bed', 'dog cushion', 'dog mattress', 'pet bed', 'dog couch', 'dog basket', 'sleeping puppy bed', 'dog asleep']
  },
  {
    id: 'dog-outdoor-travel',
    name: 'Dog Outdoor and Travel Gear',
    queries: ['dog carrier', 'dog backpack', 'dog travel', 'dog car seat', 'dog hiking', 'dog life jacket', 'dog bicycle', 'dog stroller', 'dog outdoor adventure']
  },
  {
    id: 'dog-training-behavior',
    name: 'Dog Training and Behavior',
    queries: ['dog agility', 'dog training', 'dog agility competition', 'dog obstacle course', 'dog obedience', 'dog jumping agility', 'dog handler training', 'dog trick']
  },
  {
    id: 'dog-bowls-feeding',
    name: 'Dog Bowls and Feeding Supplies',
    queries: ['dog bowl', 'dog dish', 'dog feeder', 'dog water bowl', 'dog eating bowl', 'pet bowl', 'dog drinking water', 'stainless dog bowl']
  },
  {
    id: 'dog-crates-gates-pens',
    name: 'Dog Crates, Gates and Pens',
    queries: ['dog crate', 'dog cage', 'dog kennel', 'dog pen', 'dog enclosure', 'dog fence', 'puppy pen', 'animal shelter kennel dog']
  },
  {
    id: 'dog-food',
    name: 'Dog Food',
    queries: ['dog food', 'dry dog food', 'dog kibble', 'pet food', 'dog food bowl', 'dog eating food', 'canned dog food', 'dog meal']
  },
  {
    id: 'dog-treats-chews',
    name: 'Dog Treats and Chews',
    queries: ['dog biscuit', 'dog treat', 'dog chew', 'dog bone', 'dog chewing bone', 'dog snack', 'dog cookies', 'rawhide dog']
  },
  {
    id: 'dog-collars-leashes-harnesses',
    name: 'Dog Collars, Leashes and Harnesses',
    queries: ['dog collar', 'dog leash', 'dog harness', 'dog lead', 'leather dog collar', 'guide dog harness', 'working dog harness', 'red dog collar']
  },
  {
    id: 'dog-toys',
    name: 'Dog Toys',
    queries: ['dog toy', 'dog ball', 'dog frisbee', 'dog chew toy', 'dog playing ball', 'dog rope toy', 'tennis ball dog', 'dog rubber toy']
  },
  {
    id: 'dog-grooming-bathing',
    name: 'Dog Grooming and Bathing',
    queries: ['dog grooming', 'dog bath', 'dog shampoo', 'dog wash', 'dog groomer', 'wet dog bath', 'dog brushing', 'grooming salon dog']
  },
  {
    id: 'dog-health-wellness',
    name: 'Dog Health and Wellness',
    queries: ['veterinary dog examination', 'dog vet clinic', 'dog health checkup', 'veterinarian dog', 'veterinary clinic canine', 'dog vaccination', 'dog animal hospital']
  }
];

const globalSeenUrls = new Set();

async function fetchWikiImages(query, limit = 50) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=' + 
    encodeURIComponent(query + ' -icon -map -svg -diagram -flag') + 
    '&gsrlimit=' + limit + '&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=800&format=json';

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'HoundHarborCatalogBuilder/1.0 (dev@houndharbor.com)' },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data.query?.pages || {};
    const urls = [];
    for (const k of Object.keys(pages)) {
      const info = pages[k]?.imageinfo?.[0];
      const src = info?.thumburl || info?.url;
      if (!src) continue;
      const lower = src.toLowerCase();
      if (
        (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.includes('.jpg') || lower.includes('.png')) &&
        !lower.includes('icon') && !lower.includes('flag') && !lower.includes('logo') && !lower.includes('map')
      ) {
        urls.push(src);
      }
    }
    return urls;
  } catch (err) {
    console.error(`Error querying "${query}":`, err.message);
    return [];
  }
}

async function collectAll() {
  const outPath = path.resolve('src/data/categoryImages.json');
  let result = {};
  if (fs.existsSync(outPath)) {
    try {
      result = JSON.parse(fs.readFileSync(outPath, 'utf8'));
      for (const catId of Object.keys(result)) {
        for (const u of result[catId]) {
          globalSeenUrls.add(u);
        }
      }
    } catch {}
  }

  for (const cat of CATEGORIES) {
    if (result[cat.id] && result[cat.id].length >= 52) {
      console.log(`Skipping ${cat.id}, already have ${result[cat.id].length} images.`);
      continue;
    }
    console.log(`Collecting images for ${cat.name} (${cat.id})...`);
    const catImages = result[cat.id] || [];

    for (const q of cat.queries) {
      if (catImages.length >= 52) break;
      const urls = await fetchWikiImages(q, 50);
      for (const u of urls) {
        if (!globalSeenUrls.has(u)) {
          globalSeenUrls.add(u);
          catImages.push(u);
          if (catImages.length >= 52) break;
        }
      }
      console.log(`  Query "${q}" -> Total collected for category: ${catImages.length}`);
      await new Promise(r => setTimeout(r, 400));
    }

    result[cat.id] = catImages;
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`Finished ${cat.id}: ${catImages.length} images (Total unique across catalog: ${globalSeenUrls.size})`);
  }

  console.log(`Successfully completed all categories and saved to ${outPath}`);
}

collectAll().catch(console.error);
