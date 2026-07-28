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
// LOCAL FOOD DATABASE (Fallback) - 100+ foods
// ============================================
const localFoodDB: Record<string, FoodSearchResult> = {
  // ==================== MEATS & POULTRY (13) ====================
  'chicken breast': {
    id: 'local-1', name: 'Chicken Breast', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
  },
  'chicken thigh': {
    id: 'local-2', name: 'Chicken Thigh', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 209, protein: 26, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 93 },
  },
  'chicken wing': {
    id: 'local-3', name: 'Chicken Wing', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 203, protein: 30, carbs: 0, fat: 8.5, fiber: 0, sugar: 0, sodium: 82 },
  },
  'ground beef': {
    id: 'local-4', name: 'Ground Beef (80/20)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 254, protein: 23, carbs: 0, fat: 17, fiber: 0, sugar: 0, sodium: 75 },
  },
  'sirloin steak': {
    id: 'local-5', name: 'Sirloin Steak', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 206, protein: 31, carbs: 0, fat: 8.5, fiber: 0, sugar: 0, sodium: 58 },
  },
  'ribeye steak': {
    id: 'local-6', name: 'Ribeye Steak', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 271, protein: 24, carbs: 0, fat: 19, fiber: 0, sugar: 0, sodium: 72 },
  },
  'pork chop': {
    id: 'local-7', name: 'Pork Chop', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 231, protein: 25, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 62 },
  },
  'pork loin': {
    id: 'local-8', name: 'Pork Loin', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 54 },
  },
  'turkey breast': {
    id: 'local-9', name: 'Turkey Breast', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, sugar: 0, sodium: 62 },
  },
  'lamb chops': {
    id: 'local-10', name: 'Lamb Chops', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 280, protein: 25, carbs: 0, fat: 19, fiber: 0, sugar: 0, sodium: 72 },
  },
  'bacon': {
    id: 'local-11', name: 'Bacon (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 541, protein: 37, carbs: 1.4, fat: 42, fiber: 0, sugar: 0, sodium: 1717 },
  },
  'ham': {
    id: 'local-12', name: 'Ham', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 145, protein: 20, carbs: 1.5, fat: 6, fiber: 0, sugar: 1, sodium: 1110 },
  },
  'lean ground turkey': {
    id: 'local-13', name: 'Lean Ground Turkey', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 193, protein: 27, carbs: 0, fat: 9, fiber: 0, sugar: 0, sodium: 68 },
  },

  // ==================== FISH & SEAFOOD (12) ====================
  'salmon': {
    id: 'local-14', name: 'Salmon', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59 },
  },
  'tuna': {
    id: 'local-15', name: 'Tuna (canned in water)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 116, protein: 26, carbs: 0, fat: 0.8, fiber: 0, sugar: 0, sodium: 338 },
  },
  'cod': {
    id: 'local-16', name: 'Cod', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 105, protein: 23, carbs: 0, fat: 0.9, fiber: 0, sugar: 0, sodium: 78 },
  },
  'tilapia': {
    id: 'local-17', name: 'Tilapia', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 128, protein: 26, carbs: 0, fat: 2.7, fiber: 0, sugar: 0, sodium: 52 },
  },
  'shrimp': {
    id: 'local-18', name: 'Shrimp', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, sugar: 0, sodium: 111 },
  },
  'sardines': {
    id: 'local-19', name: 'Sardines (canned)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 208, protein: 25, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 475 },
  },
  'mackerel': {
    id: 'local-20', name: 'Mackerel', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 262, protein: 19, carbs: 0, fat: 20, fiber: 0, sugar: 0, sodium: 83 },
  },
  'trout': {
    id: 'local-21', name: 'Trout', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 190, protein: 23, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 56 },
  },
  'halibut': {
    id: 'local-22', name: 'Halibut', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 140, protein: 27, carbs: 0, fat: 3, fiber: 0, sugar: 0, sodium: 79 },
  },
  'crab': {
    id: 'local-23', name: 'Crab', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 87, protein: 18, carbs: 0, fat: 1.5, fiber: 0, sugar: 0, sodium: 563 },
  },
  'lobster': {
    id: 'local-24', name: 'Lobster', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 89, protein: 19, carbs: 0, fat: 0.9, fiber: 0, sugar: 0, sodium: 423 },
  },
  'scallops': {
    id: 'local-25', name: 'Scallops', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 111, protein: 21, carbs: 5, fat: 0.8, fiber: 0, sugar: 0, sodium: 161 },
  },

  // ==================== EGGS & DAIRY (12) ====================
  'whole egg': {
    id: 'local-26', name: 'Egg (whole)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
  },
  'egg white': {
    id: 'local-27', name: 'Egg White', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0, sugar: 0.7, sodium: 166 },
  },
  'whole milk': {
    id: 'local-28', name: 'Whole Milk', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 5, sodium: 43 },
  },
  'skim milk': {
    id: 'local-29', name: 'Skim Milk', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0, sugar: 5, sodium: 42 },
  },
  'greek yogurt': {
    id: 'local-30', name: 'Greek Yogurt (plain)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 59, protein: 10, carbs: 3.6, fat: 0.7, fiber: 0, sugar: 3.2, sodium: 36 },
  },
  'cottage cheese': {
    id: 'local-31', name: 'Cottage Cheese', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, sugar: 2.7, sodium: 321 },
  },
  'cheddar cheese': {
    id: 'local-32', name: 'Cheddar Cheese', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 403, protein: 25, carbs: 1.3, fat: 33, fiber: 0, sugar: 0.5, sodium: 621 },
  },
  'mozzarella': {
    id: 'local-33', name: 'Mozzarella', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 280, protein: 28, carbs: 3.1, fat: 17, fiber: 0, sugar: 1, sodium: 619 },
  },
  'parmesan': {
    id: 'local-34', name: 'Parmesan Cheese', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 431, protein: 38, carbs: 4.1, fat: 29, fiber: 0, sugar: 0.8, sodium: 1529 },
  },
  'cream cheese': {
    id: 'local-35', name: 'Cream Cheese', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 342, protein: 6, carbs: 4, fat: 34, fiber: 0, sugar: 3.2, sodium: 321 },
  },
  'sour cream': {
    id: 'local-36', name: 'Sour Cream', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 198, protein: 2.4, carbs: 4.6, fat: 19, fiber: 0, sugar: 4, sodium: 91 },
  },
  'heavy cream': {
    id: 'local-37', name: 'Heavy Cream', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 345, protein: 2.8, carbs: 2.8, fat: 37, fiber: 0, sugar: 0, sodium: 38 },
  },

  // ==================== GRAINS & CEREALS (12) ====================
  'white rice': {
    id: 'local-38', name: 'White Rice (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0, sodium: 1 },
  },
  'brown rice': {
    id: 'local-39', name: 'Brown Rice (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 123, protein: 2.7, carbs: 26, fat: 1, fiber: 1.6, sugar: 0.4, sodium: 4 },
  },
  'quinoa': {
    id: 'local-40', name: 'Quinoa (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, sugar: 0.9, sodium: 7 },
  },
  'oats': {
    id: 'local-41', name: 'Rolled Oats', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6, sugar: 0.5, sodium: 2 },
  },
  'couscous': {
    id: 'local-42', name: 'Couscous (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 112, protein: 3.8, carbs: 23, fat: 0.2, fiber: 1.4, sugar: 0.1, sodium: 5 },
  },
  'barley': {
    id: 'local-43', name: 'Barley (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 123, protein: 2.3, carbs: 28, fat: 0.4, fiber: 3.8, sugar: 0.3, sodium: 3 },
  },
  'bulgur': {
    id: 'local-44', name: 'Bulgur (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 83, protein: 3.1, carbs: 18.6, fat: 0.2, fiber: 4.5, sugar: 0.1, sodium: 5 },
  },
  'farro': {
    id: 'local-45', name: 'Farro (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 150, protein: 5, carbs: 30, fat: 1, fiber: 3.5, sugar: 0.4, sodium: 3 },
  },
  'millet': {
    id: 'local-46', name: 'Millet (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 119, protein: 3.5, carbs: 24, fat: 1, fiber: 1.3, sugar: 0.1, sodium: 2 },
  },
  'cream of wheat': {
    id: 'local-47', name: 'Cream of Wheat (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 45, protein: 1.4, carbs: 9.3, fat: 0.2, fiber: 0.5, sugar: 0.1, sodium: 82 },
  },
  'granola': {
    id: 'local-48', name: 'Granola', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 471, protein: 10, carbs: 64, fat: 20, fiber: 5.7, sugar: 22, sodium: 26 },
  },
  'oatmeal': {
    id: 'local-49', name: 'Oatmeal (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 71, protein: 2.5, carbs: 12, fat: 1.5, fiber: 1.7, sugar: 0.3, sodium: 2 },
  },

  // ==================== PASTA & BREAD (10) ====================
  'spaghetti': {
    id: 'local-50', name: 'Spaghetti (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, sodium: 1 },
  },
  'whole wheat pasta': {
    id: 'local-51', name: 'Whole Wheat Pasta (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 124, protein: 5.3, carbs: 26, fat: 0.5, fiber: 3.2, sugar: 0.5, sodium: 2 },
  },
  'white bread': {
    id: 'local-52', name: 'White Bread', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5, sodium: 681 },
  },
  'whole wheat bread': {
    id: 'local-53', name: 'Whole Wheat Bread', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 247, protein: 13, carbs: 46, fat: 3.4, fiber: 7, sugar: 5, sodium: 543 },
  },
  'sourdough bread': {
    id: 'local-54', name: 'Sourdough Bread', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 266, protein: 8, carbs: 51, fat: 3, fiber: 2.8, sugar: 1.5, sodium: 602 },
  },
  'flour tortilla': {
    id: 'local-55', name: 'Flour Tortilla', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 300, protein: 7, carbs: 51, fat: 8, fiber: 2.5, sugar: 2, sodium: 638 },
  },
  'bagel': {
    id: 'local-56', name: 'Bagel', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 250, protein: 10, carbs: 49, fat: 1.5, fiber: 2, sugar: 6, sodium: 505 },
  },
  'croissant': {
    id: 'local-57', name: 'Croissant', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 406, protein: 8, carbs: 46, fat: 21, fiber: 2.6, sugar: 8, sodium: 467 },
  },
  'pita bread': {
    id: 'local-58', name: 'Pita Bread', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 275, protein: 9, carbs: 56, fat: 1.2, fiber: 2.2, sugar: 1, sodium: 536 },
  },
  'english muffin': {
    id: 'local-59', name: 'English Muffin', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 235, protein: 8, carbs: 46, fat: 1.8, fiber: 2.5, sugar: 3, sodium: 464 },
  },

  // ==================== LEGUMES & SOY (8) ====================
  'lentils': {
    id: 'local-60', name: 'Lentils (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, sugar: 1.8, sodium: 2 },
  },
  'chickpeas': {
    id: 'local-61', name: 'Chickpeas (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 139, protein: 7.6, carbs: 23, fat: 2.6, fiber: 6.4, sugar: 4, sodium: 243 },
  },
  'black beans': {
    id: 'local-62', name: 'Black Beans (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 132, protein: 8.9, carbs: 24, fat: 0.5, fiber: 8.7, sugar: 0.3, sodium: 1 },
  },
  'kidney beans': {
    id: 'local-63', name: 'Kidney Beans (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 127, protein: 8.7, carbs: 23, fat: 0.5, fiber: 7.4, sugar: 0.3, sodium: 2 },
  },
  'pinto beans': {
    id: 'local-64', name: 'Pinto Beans (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 143, protein: 9, carbs: 27, fat: 0.7, fiber: 7.8, sugar: 0.4, sodium: 2 },
  },
  'edamame': {
    id: 'local-65', name: 'Edamame (shelled)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 121, protein: 12, carbs: 9, fat: 5, fiber: 5.2, sugar: 2.2, sodium: 6 },
  },
  'tofu': {
    id: 'local-66', name: 'Tofu (firm)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6, sodium: 7 },
  },
  'tempeh': {
    id: 'local-67', name: 'Tempeh', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 193, protein: 20, carbs: 9, fat: 11, fiber: 6, sugar: 0.5, sodium: 9 },
  },

  // ==================== VEGETABLES (19) ====================
  'broccoli': {
    id: 'local-68', name: 'Broccoli', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33 },
  },
  'spinach': {
    id: 'local-69', name: 'Spinach', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79 },
  },
  'kale': {
    id: 'local-70', name: 'Kale', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9, fiber: 3.6, sugar: 2.3, sodium: 43 },
  },
  'carrots': {
    id: 'local-71', name: 'Carrots', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69 },
  },
  'bell pepper': {
    id: 'local-72', name: 'Red Bell Pepper', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, sugar: 4.2, sodium: 4 },
  },
  'cucumber': {
    id: 'local-73', name: 'Cucumber', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, sugar: 1.7, sodium: 2 },
  },
  'tomato': {
    id: 'local-74', name: 'Tomato', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5 },
  },
  'onion': {
    id: 'local-75', name: 'Onion', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 40, protein: 1.1, carbs: 9, fat: 0.1, fiber: 1.7, sugar: 4.2, sodium: 4 },
  },
  'garlic': {
    id: 'local-76', name: 'Garlic', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1, sugar: 1, sodium: 17 },
  },
  'mushrooms': {
    id: 'local-77', name: 'Mushrooms', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1, sugar: 2, sodium: 5 },
  },
  'asparagus': {
    id: 'local-78', name: 'Asparagus', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 20, protein: 2.2, carbs: 3.7, fat: 0.1, fiber: 2.1, sugar: 1.9, sodium: 2 },
  },
  'zucchini': {
    id: 'local-79', name: 'Zucchini', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, sugar: 2.5, sodium: 8 },
  },
  'sweet potato': {
    id: 'local-80', name: 'Sweet Potato', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sugar: 4.2, sodium: 55 },
  },
  'potato': {
    id: 'local-81', name: 'Potato (baked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 93, protein: 2.5, carbs: 21, fat: 0.1, fiber: 2.2, sugar: 1.2, sodium: 10 },
  },
  'corn': {
    id: 'local-82', name: 'Corn', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 96, protein: 3.4, carbs: 21, fat: 1.5, fiber: 2.4, sugar: 4.5, sodium: 15 },
  },
  'green peas': {
    id: 'local-83', name: 'Green Peas', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 81, protein: 5.4, carbs: 14, fat: 0.4, fiber: 5.1, sugar: 5.9, sodium: 3 },
  },
  'celery': {
    id: 'local-84', name: 'Celery', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 16, protein: 0.7, carbs: 3.4, fat: 0.2, fiber: 1.6, sugar: 1.8, sodium: 80 },
  },
  'cauliflower': {
    id: 'local-85', name: 'Cauliflower', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, sugar: 2.4, sodium: 30 },
  },
  'green beans': {
    id: 'local-86', name: 'Green Beans', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 31, protein: 1.8, carbs: 7, fat: 0.1, fiber: 2.7, sugar: 3.3, sodium: 6 },
  },

  // ==================== FRUITS (18) ====================
  'banana': {
    id: 'local-87', name: 'Banana', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1 },
  },
  'apple': {
    id: 'local-88', name: 'Apple', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1 },
  },
  'orange': {
    id: 'local-89', name: 'Orange', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, sugar: 9, sodium: 0 },
  },
  'strawberries': {
    id: 'local-90', name: 'Strawberries', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, sugar: 4.9, sodium: 1 },
  },
  'blueberries': {
    id: 'local-91', name: 'Blueberries', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sugar: 10, sodium: 1 },
  },
  'grapes': {
    id: 'local-92', name: 'Grapes', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, sugar: 16, sodium: 2 },
  },
  'watermelon': {
    id: 'local-93', name: 'Watermelon', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, sugar: 6.2, sodium: 1 },
  },
  'pineapple': {
    id: 'local-94', name: 'Pineapple', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, sugar: 10, sodium: 1 },
  },
  'mango': {
    id: 'local-95', name: 'Mango', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 14, sodium: 1 },
  },
  'kiwi': {
    id: 'local-96', name: 'Kiwi', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3, sugar: 9, sodium: 3 },
  },
  'avocado': {
    id: 'local-97', name: 'Avocado', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7, sodium: 7 },
  },
  'dates': {
    id: 'local-98', name: 'Dates (Medjool)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 282, protein: 2.5, carbs: 75, fat: 0.4, fiber: 8, sugar: 63, sodium: 2 },
  },
  'raisins': {
    id: 'local-99', name: 'Raisins', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 299, protein: 3, carbs: 79, fat: 0.5, fiber: 3.7, sugar: 65, sodium: 11 },
  },
  'raspberries': {
    id: 'local-100', name: 'Raspberries', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 52, protein: 1.2, carbs: 12, fat: 0.7, fiber: 6.5, sugar: 4.4, sodium: 1 },
  },
  'blackberries': {
    id: 'local-101', name: 'Blackberries', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 43, protein: 1.4, carbs: 10, fat: 0.5, fiber: 5.3, sugar: 4.9, sodium: 1 },
  },
  'cherries': {
    id: 'local-102', name: 'Cherries', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 50, protein: 1, carbs: 12, fat: 0.3, fiber: 1.6, sugar: 8, sodium: 3 },
  },
  'grapefruit': {
    id: 'local-103', name: 'Grapefruit', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 42, protein: 0.8, carbs: 11, fat: 0.1, fiber: 1.6, sugar: 7, sodium: 0 },
  },
  'peach': {
    id: 'local-104', name: 'Peach', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 39, protein: 0.9, carbs: 10, fat: 0.3, fiber: 1.5, sugar: 8, sodium: 0 },
  },

  // ==================== NUTS & SEEDS (12) ====================
  'almonds': {
    id: 'local-105', name: 'Almonds', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, sugar: 4.4, sodium: 1 },
  },
  'walnuts': {
    id: 'local-106', name: 'Walnuts', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, sugar: 2.6, sodium: 2 },
  },
  'cashews': {
    id: 'local-107', name: 'Cashews', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3, sugar: 5.9, sodium: 12 },
  },
  'pistachios': {
    id: 'local-108', name: 'Pistachios', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 560, protein: 20, carbs: 28, fat: 45, fiber: 10.3, sugar: 7.8, sodium: 1 },
  },
  'peanuts': {
    id: 'local-109', name: 'Peanuts', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, sugar: 4.9, sodium: 18 },
  },
  'chia seeds': {
    id: 'local-110', name: 'Chia Seeds', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34, sugar: 0, sodium: 16 },
  },
  'flax seeds': {
    id: 'local-111', name: 'Flax Seeds', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 534, protein: 18, carbs: 29, fat: 42, fiber: 27, sugar: 1.5, sodium: 30 },
  },
  'pumpkin seeds': {
    id: 'local-112', name: 'Pumpkin Seeds', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 559, protein: 30, carbs: 10.7, fat: 49, fiber: 6, sugar: 1.4, sodium: 7 },
  },
  'sunflower seeds': {
    id: 'local-113', name: 'Sunflower Seeds', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 584, protein: 21, carbs: 20, fat: 51, fiber: 8.6, sugar: 2.6, sodium: 9 },
  },
  'peanut butter': {
    id: 'local-114', name: 'Peanut Butter', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, sugar: 9, sodium: 17 },
  },
  'tahini': {
    id: 'local-115', name: 'Tahini', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 595, protein: 17, carbs: 21, fat: 53, fiber: 9, sugar: 0.5, sodium: 115 },
  },
  'coconut': {
    id: 'local-116', name: 'Coconut (shredded)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 660, protein: 6.9, carbs: 24, fat: 65, fiber: 16, sugar: 7.4, sodium: 20 },
  },

  // ==================== OILS & FATS (7) ====================
  'olive oil': {
    id: 'local-117', name: 'Olive Oil', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 2 },
  },
  'coconut oil': {
    id: 'local-118', name: 'Coconut Oil', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0 },
  },
  'avocado oil': {
    id: 'local-119', name: 'Avocado Oil', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0 },
  },
  'butter': {
    id: 'local-120', name: 'Butter', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, sugar: 0.1, sodium: 643 },
  },
  'ghee': {
    id: 'local-121', name: 'Ghee', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 876, protein: 0.1, carbs: 0, fat: 97, fiber: 0, sugar: 0, sodium: 0 },
  },
  'sesame oil': {
    id: 'local-122', name: 'Sesame Oil', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0 },
  },
  'canola oil': {
    id: 'local-123', name: 'Canola Oil', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0 },
  },

  // ==================== SUPPLEMENTS (9) ====================
  'whey protein': {
    id: 'local-124', name: 'Whey Protein Isolate', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 400, protein: 90, carbs: 2, fat: 1, fiber: 0, sugar: 1, sodium: 180 },
  },
  'whey concentrate': {
    id: 'local-125', name: 'Whey Protein Concentrate', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 420, protein: 80, carbs: 6, fat: 6, fiber: 0, sugar: 4, sodium: 200 },
  },
  'casein protein': {
    id: 'local-126', name: 'Casein Protein', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 390, protein: 82, carbs: 4, fat: 3, fiber: 0, sugar: 2, sodium: 150 },
  },
  'mass gainer': {
    id: 'local-127', name: 'Mass Gainer', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 400, protein: 25, carbs: 70, fat: 4, fiber: 1, sugar: 30, sodium: 120 },
  },
  'creatine': {
    id: 'local-128', name: 'Creatine Monohydrate', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
  },
  'bcaas': {
    id: 'local-129', name: 'BCAAs', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
  },
  'pre-workout': {
    id: 'local-130', name: 'Pre-Workout', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0, sugar: 0, sodium: 50 },
  },
  'protein bar': {
    id: 'local-131', name: 'Protein Bar', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 400, protein: 30, carbs: 45, fat: 12, fiber: 5, sugar: 20, sodium: 250 },
  },
  'rice cakes': {
    id: 'local-132', name: 'Rice Cakes', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 386, protein: 8, carbs: 80, fat: 2, fiber: 4, sugar: 2, sodium: 382 },
  },

  // ==================== ATHLETE COMBO MEALS (10) ====================
  'chicken and rice': {
    id: 'local-133', name: 'Chicken and Rice Bowl', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 147, protein: 17, carbs: 14, fat: 2, fiber: 0.5, sugar: 0.3, sodium: 38 },
  },
  'beef and potato': {
    id: 'local-134', name: 'Beef and Potato', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 175, protein: 14, carbs: 10.5, fat: 9, fiber: 1, sugar: 0.5, sodium: 42 },
  },
  'salmon and quinoa': {
    id: 'local-135', name: 'Salmon and Quinoa Bowl', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 164, protein: 12, carbs: 10.5, fat: 7.5, fiber: 1.5, sugar: 0.5, sodium: 33 },
  },
  'tuna salad': {
    id: 'local-136', name: 'Tuna Salad', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 150, protein: 15, carbs: 5, fat: 8, fiber: 0.5, sugar: 2, sodium: 310 },
  },
  'turkey sandwich': {
    id: 'local-137', name: 'Turkey Sandwich', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 200, protein: 12, carbs: 24, fat: 6, fiber: 2, sugar: 3, sodium: 480 },
  },
  'protein shake banana': {
    id: 'local-138', name: 'Protein Shake with Banana', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 105, protein: 13, carbs: 13, fat: 1, fiber: 0.5, sugar: 8, sodium: 70 },
  },
  'chicken pasta': {
    id: 'local-139', name: 'Chicken Pasta', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 148, protein: 18, carbs: 12.5, fat: 2.5, fiber: 1, sugar: 0.5, sodium: 40 },
  },
  'egg and rice bowl': {
    id: 'local-140', name: 'Egg and Rice Bowl', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 142, protein: 8, carbs: 14, fat: 5.5, fiber: 0.3, sugar: 0.5, sodium: 62 },
  },
  'steak sweet potato': {
    id: 'local-141', name: 'Steak and Sweet Potato', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 178, protein: 14, carbs: 10, fat: 9, fiber: 1.5, sugar: 2, sodium: 64 },
  },
  'yogurt parfait': {
    id: 'local-142', name: 'Greek Yogurt Parfait', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 120, protein: 7, carbs: 16, fat: 3, fiber: 1, sugar: 10, sodium: 30 },
  },

  // ==================== DRINKS (9) ====================
  'water': {
    id: 'local-143', name: 'Water', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 5 },
  },
  'black coffee': {
    id: 'local-144', name: 'Black Coffee', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 1, protein: 0.1, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 2 },
  },
  'green tea': {
    id: 'local-145', name: 'Green Tea', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 1, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 1 },
  },
  'black tea': {
    id: 'local-146', name: 'Black Tea', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 1, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 1 },
  },
  'orange juice': {
    id: 'local-147', name: 'Orange Juice', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 47, protein: 0.7, carbs: 11, fat: 0.2, fiber: 0.3, sugar: 9, sodium: 1 },
  },
  'apple juice': {
    id: 'local-148', name: 'Apple Juice', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 46, protein: 0.1, carbs: 11, fat: 0.1, fiber: 0.1, sugar: 10, sodium: 4 },
  },
  'coconut water': {
    id: 'local-149', name: 'Coconut Water', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, fiber: 0, sugar: 2.6, sodium: 105 },
  },
  'sports drink': {
    id: 'local-150', name: 'Sports Drink', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 26, protein: 0, carbs: 6, fat: 0, fiber: 0, sugar: 6, sodium: 41 },
  },
  'chocolate milk': {
    id: 'local-151', name: 'Chocolate Milk', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 83, protein: 3.2, carbs: 13, fat: 2, fiber: 0.5, sugar: 10, sodium: 65 },
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
