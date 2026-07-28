// Nutrition API Service
// Supports: Open Food Facts (free), USDA FoodData Central (free tier), Nutritionix (premium)

export interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  source: 'openfoodfacts' | 'usda' | 'nutritionix';
  servingSize: number; // grams
  servingUnit: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  imageUrl?: string;
}

export interface FoodNutrition {
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  servingSize: number;
  servingUnit: string;
}

export interface CalculatedMeal {
  food: FoodSearchResult;
  quantity: number; // grams
  quantityUnit: 'g' | 'servings';
  calculated: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// ============================================
// OPEN FOOD FACTS API (Free, no key needed)
// ============================================
const OFF_BASE = 'https://world.openfoodfacts.org/api/v2';

export async function searchOpenFoodFacts(query: string, limit: number = 10): Promise<FoodSearchResult[]> {
  try {
    const response = await fetch(
      `${OFF_BASE}/search?search_terms=${encodeURIComponent(query)}&page_size=${limit}&json=true&fields=product_name,brands,code,nutriments,image_front_small_url,-serving_size`
    );
    const data = await response.json();

    if (!data.products) return [];

    return data.products
      .filter((p: any) => p.nutriments)
      .map((p: any) => ({
        id: `off-${p.code || Math.random().toString(36).substr(2, 9)}`,
        name: p.product_name || 'Unknown Food',
        brand: p.brands || undefined,
        barcode: p.code || undefined,
        source: 'openfoodfacts' as const,
        servingSize: parseServingSize(p.serving_size) || 100,
        servingUnit: 'g',
        nutrition: {
          calories: p.nutriments['energy-kcal_100g'] || p.nutriments['energy_100g'] / 4.184 || 0,
          protein: p.nutriments.proteins_100g || 0,
          carbs: p.nutriments.carbohydrates_100g || 0,
          fat: p.nutriments.fat_100g || 0,
          fiber: p.nutriments.fiber_100g || 0,
          sugar: p.nutriments.sugars_100g || 0,
          sodium: p.nutriments.sodium_100g || 0,
        },
        imageUrl: p.image_front_small_url,
      }));
  } catch (error) {
    console.error('Open Food Facts API error:', error);
    return [];
  }
}

export async function getFoodByBarcode(barcode: string): Promise<FoodSearchResult | null> {
  try {
    const response = await fetch(`${OFF_BASE}/product/${barcode}.json`);
    const data = await response.json();

    if (!data.product || !data.product.nutriments) return null;

    const p = data.product;
    return {
      id: `off-${barcode}`,
      name: p.product_name || 'Unknown Food',
      brand: p.brands || undefined,
      barcode,
      source: 'openfoodfacts',
      servingSize: parseServingSize(p.serving_size) || 100,
      servingUnit: 'g',
      nutrition: {
        calories: p.nutriments['energy-kcal_serving'] || p.nutriments['energy-kcal_100g'] || 0,
        protein: p.nutriments.proteins_serving || p.nutriments.proteins_100g || 0,
        carbs: p.nutriments.carbohydrates_serving || p.nutriments.carbohydrates_100g || 0,
        fat: p.nutriments.fat_serving || p.nutriments.fat_100g || 0,
        fiber: p.nutriments.fiber_100g || 0,
        sugar: p.nutriments.sugars_100g || 0,
        sodium: p.nutriments.sodium_100g || 0,
      },
      imageUrl: p.image_front_small_url,
    };
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return null;
  }
}

// ============================================
// USDA FoodData Central API (Free with key)
// ============================================
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = ''; // User sets in settings

export async function searchUSDA(query: string, limit: number = 10): Promise<FoodSearchResult[]> {
  if (!USDA_API_KEY) return [];

  try {
    const response = await fetch(
      `${USDA_BASE}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=${limit}&dataType=Foundation,SR%20Legacy`
    );
    const data = await response.json();

    if (!data.foods) return [];

    return data.foods.map((f: any) => {
      const nutrients = extractUSDANutrients(f.foodNutrients || []);
      return {
        id: `usda-${f.fdcId}`,
        name: f.description || 'Unknown Food',
        brand: f.brandOwner || undefined,
        source: 'usda' as const,
        servingSize: 100,
        servingUnit: 'g',
        nutrition: nutrients,
      };
    });
  } catch (error) {
    console.error('USDA API error:', error);
    return [];
  }
}

function extractUSDANutrients(nutrients: any[]): FoodSearchResult['nutrition'] {
  const find = (name: string) => {
    const n = nutrients.find((n: any) => n.nutrientName?.toLowerCase().includes(name.toLowerCase()));
    return n?.value || 0;
  };

  return {
    calories: find('energy') || find('calorie'),
    protein: find('protein'),
    carbs: find('carbohydrate'),
    fat: find('fat'),
    fiber: find('fiber'),
    sugar: find('sugar'),
    sodium: find('sodium'),
  };
}

// ============================================
// LOCAL FOOD DATABASE (Fallback)
// ============================================
const localFoodDB: Record<string, FoodSearchResult> = {
  'chicken breast': {
    id: 'local-1', name: 'Chicken Breast', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
  },
  'rice': {
    id: 'local-2', name: 'White Rice (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0, sodium: 1 },
  },
  'banana': {
    id: 'local-3', name: 'Banana', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1 },
  },
  'egg': {
    id: 'local-4', name: 'Egg (whole)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
  },
  'bread': {
    id: 'local-5', name: 'White Bread', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5, sodium: 681 },
  },
  'milk': {
    id: 'local-6', name: 'Whole Milk', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 5, sodium: 43 },
  },
  'apple': {
    id: 'local-7', name: 'Apple', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1 },
  },
  'oatmeal': {
    id: 'local-8', name: 'Oatmeal (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 71, protein: 2.5, carbs: 12, fat: 1.5, fiber: 1.7, sugar: 0.3, sodium: 2 },
  },
  'salmon': {
    id: 'local-9', name: 'Salmon', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59 },
  },
  'avocado': {
    id: 'local-10', name: 'Avocado', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7, sodium: 7 },
  },
  'broccoli': {
    id: 'local-11', name: 'Broccoli', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33 },
  },
  'pasta': {
    id: 'local-12', name: 'Pasta (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, sodium: 1 },
  },
  'steak': {
    id: 'local-13', name: 'Beef Steak', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 271, protein: 26, carbs: 0, fat: 18, fiber: 0, sugar: 0, sodium: 72 },
  },
  'yogurt': {
    id: 'local-14', name: 'Greek Yogurt', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 59, protein: 10, carbs: 3.6, fat: 0.7, fiber: 0, sugar: 3.2, sodium: 36 },
  },
  'cheese': {
    id: 'local-15', name: 'Cheddar Cheese', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 403, protein: 25, carbs: 1.3, fat: 33, fiber: 0, sugar: 0.5, sodium: 621 },
  },
  'tofu': {
    id: 'local-16', name: 'Tofu', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6, sodium: 7 },
  },
  'protein shake': {
    id: 'local-17', name: 'Protein Shake', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 120, protein: 25, carbs: 3, fat: 1, fiber: 0, sugar: 1, sodium: 130 },
  },
  'peanut butter': {
    id: 'local-18', name: 'Peanut Butter', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, sugar: 9, sodium: 17 },
  },
  'sweet potato': {
    id: 'local-19', name: 'Sweet Potato', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sugar: 4.2, sodium: 55 },
  },
  'quinoa': {
    id: 'local-20', name: 'Quinoa (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, sugar: 0.9, sodium: 7 },
  },
};

// ============================================
// SEARCH FUNCTION (tries API, falls back to local)
// ============================================
export async function searchFood(query: string, limit: number = 10): Promise<FoodSearchResult[]> {
  const q = query.toLowerCase().trim();

  // Try Open Food Facts first
  const offResults = await searchOpenFoodFacts(query, limit);
  if (offResults.length > 0) return offResults;

  // Try USDA if API key is set
  const usdaResults = await searchUSDA(query, limit);
  if (usdaResults.length > 0) return usdaResults;

  // Fall back to local database
  const localResults = Object.values(localFoodDB).filter(food =>
    food.name.toLowerCase().includes(q) ||
    q.split(' ').some(word => food.name.toLowerCase().includes(word))
  );

  return localResults.slice(0, limit);
}

// ============================================
// CALCULATE NUTRITION FROM QUANTITY
// ============================================
export function calculateNutrition(food: FoodSearchResult, quantityGrams: number): CalculatedMeal['calculated'] {
  const multiplier = quantityGrams / 100; // Nutrition is per 100g

  return {
    calories: Math.round(food.nutrition.calories * multiplier),
    protein: Math.round(food.nutrition.protein * multiplier * 10) / 10,
    carbs: Math.round(food.nutrition.carbs * multiplier * 10) / 10,
    fat: Math.round(food.nutrition.fat * multiplier * 10) / 10,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function parseServingSize(servingStr: string): number {
  if (!servingStr) return 100;
  const match = servingStr.match(/(\d+(?:\.\d+)?)\s*(g|gram|oz|oz|cup|cup|ml|l)/i);
  if (!match) return 100;

  const num = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  // Convert to grams
  if (unit === 'g' || unit === 'gram') return num;
  if (unit === 'oz') return num * 28.35;
  if (unit === 'cup') return num * 240; // Approximate
  if (unit === 'ml') return num; // Rough estimate
  if (unit === 'l') return num * 1000;

  return 100;
}

export function formatNutrition(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toFixed(value % 1 === 0 ? 0 : 1);
}

// ============================================
// BARCODE SCANNER (uses device camera)
// ============================================
export async function scanBarcode(): Promise<string | null> {
  // In a real app, this would use expo-camera or react-native-barcodescanner
  // For now, return a demo barcode
  return new Promise((resolve) => {
    // Simulate scanning delay
    setTimeout(() => {
      // Return a random demo barcode from Open Food Facts
      const demoBarcodes = [
        '3017620422003', // Nutella
        '5449000000996', // Coca-Cola
        '8000500310427', // Ferrero
        '7622210449283', // Oreo
      ];
      resolve(demoBarcodes[Math.floor(Math.random() * demoBarcodes.length)]);
    }, 1500);
  });
}
