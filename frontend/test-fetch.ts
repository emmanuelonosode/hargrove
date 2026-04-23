
import { fetchProperties, fetchFeaturedProperties } from './lib/properties';

async function test() {
  console.log("Testing properties fetch...");
  try {
    const featured = await fetchFeaturedProperties();
    console.log("Featured properties count:", featured.length);
    
    const all = await fetchProperties();
    console.log("Total properties count:", all.count);
  } catch (error) {
    console.error("Error fetching properties:", error);
  }
}

test();
