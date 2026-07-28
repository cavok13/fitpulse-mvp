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
import { useSettingsStore } from '../store/useSettingsStore';

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

export async function searchUSDA(query: string, limit: number = 10): Promise<FoodSearchResult[]> {
  const apiKey = useSettingsStore.getState().usdaApiKey;
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `${USDA_BASE}/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=${limit}&dataType=Foundation,SR%20Legacy`
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
// LOCAL FOOD DATABASE (120+ foods, athlete-focused)
// ============================================
const localFoodDB: Record<string, FoodSearchResult> = {
  // == MEATS & POULTRY ==
  'chicken breast': {
    id: 'local-1', name: 'Chicken Breast', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
  },
  'chicken thigh': {
    id: 'local-21', name: 'Chicken Thigh', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 209, protein: 26, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 93 },
  },
  'chicken wing': {
    id: 'local-22', name: 'Chicken Wing', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 222, protein: 18, carbs: 0, fat: 16, fiber: 0, sugar: 0, sodium: 94 },
  },
  'ground beef': {
    id: 'local-23', name: 'Ground Beef (80/20)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 254, protein: 17, carbs: 0, fat: 20, fiber: 0, sugar: 0, sodium: 75 },
  },
  'sirloin steak': {
    id: 'local-24', name: 'Sirloin Steak', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 206, protein: 26, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 54 },
  },
  'ribeye steak': {
    id: 'local-25', name: 'Ribeye Steak', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 271, protein: 24, carbs: 0, fat: 19, fiber: 0, sugar: 0, sodium: 55 },
  },
  'pork chop': {
    id: 'local-26', name: 'Pork Chop', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 231, protein: 25, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 62 },
  },
  'pork loin': {
    id: 'local-27', name: 'Pork Loin', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 198, protein: 27, carbs: 0, fat: 9, fiber: 0, sugar: 0, sodium: 56 },
  },
  'turkey breast': {
    id: 'local-28', name: 'Turkey Breast', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 135, protein: 30, carbs: 0, fat: 0.7, fiber: 0, sugar: 0, sodium: 46 },
  },
  'ground turkey': {
    id: 'local-29', name: 'Lean Ground Turkey', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 193, protein: 23, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 76 },
  },
  'lamb chops': {
    id: 'local-30', name: 'Lamb Chops', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 258, protein: 22, carbs: 0, fat: 18, fiber: 0, sugar: 0, sodium: 72 },
  },
  'bacon': {
    id: 'local-31', name: 'Bacon', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 541, protein: 37, carbs: 1.4, fat: 42, fiber: 0, sugar: 0, sodium: 1717 },
  },
  'ham': {
    id: 'local-32', name: 'Ham', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 145, protein: 20, carbs: 1, fat: 6, fiber: 0, sugar: 0, sodium: 850 },
  },
  'duck': {
    id: 'local-33', name: 'Duck Breast', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 200, protein: 22, carbs: 0, fat: 12, fiber: 0, sugar: 0, sodium: 74 },
  },

  // == FISH & SEAFOOD ==
  'salmon': {
    id: 'local-9', name: 'Salmon', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59 },
  },
  'tuna': {
    id: 'local-34', name: 'Canned Tuna (in water)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 116, protein: 26, carbs: 0, fat: 0.8, fiber: 0, sugar: 0, sodium: 338 },
  },
  'cod': {
    id: 'local-35', name: 'Cod', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0, sugar: 0, sodium: 54 },
  },
  'tilapia': {
    id: 'local-36', name: 'Tilapia', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 96, protein: 20, carbs: 0, fat: 1.7, fiber: 0, sugar: 0, sodium: 52 },
  },
  'shrimp': {
    id: 'local-37', name: 'Shrimp', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, sugar: 0, sodium: 111 },
  },
  'sardines': {
    id: 'local-38', name: 'Sardines (canned)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 208, protein: 25, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 307 },
  },
  'mackerel': {
    id: 'local-39', name: 'Mackerel', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 262, protein: 19, carbs: 0, fat: 20, fiber: 0, sugar: 0, sodium: 91 },
  },
  'trout': {
    id: 'local-40', name: 'Trout', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 190, protein: 21, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 52 },
  },
  'halibut': {
    id: 'local-41', name: 'Halibut', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 91, protein: 19, carbs: 0, fat: 1.3, fiber: 0, sugar: 0, sodium: 54 },
  },
  'scallops': {
    id: 'local-42', name: 'Scallops', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 88, protein: 17, carbs: 5, fat: 0.5, fiber: 0, sugar: 0, sodium: 161 },
  },

  // == EGGS & DAIRY ==
  'egg': {
    id: 'local-4', name: 'Egg (whole)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
  },
  'egg white': {
    id: 'local-43', name: 'Egg White', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0, sugar: 0.7, sodium: 166 },
  },
  'milk': {
    id: 'local-6', name: 'Whole Milk', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 5, sodium: 43 },
  },
  'skim milk': {
    id: 'local-44', name: 'Skim Milk', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0, sugar: 5, sodium: 42 },
  },
  'yogurt': {
    id: 'local-14', name: 'Greek Yogurt (plain)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 59, protein: 10, carbs: 3.6, fat: 0.7, fiber: 0, sugar: 3.2, sodium: 36 },
  },
  'cottage cheese': {
    id: 'local-45', name: 'Cottage Cheese (low-fat)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 72, protein: 12, carbs: 3, fat: 1, fiber: 0, sugar: 3, sodium: 406 },
  },
  'cheese': {
    id: 'local-15', name: 'Cheddar Cheese', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 403, protein: 25, carbs: 1.3, fat: 33, fiber: 0, sugar: 0.5, sodium: 621 },
  },
  'mozzarella': {
    id: 'local-46', name: 'Mozzarella (part skim)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 280, protein: 28, carbs: 3, fat: 17, fiber: 0, sugar: 1, sodium: 619 },
  },
  'parmesan': {
    id: 'local-47', name: 'Parmesan Cheese', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 431, protein: 38, carbs: 4, fat: 29, fiber: 0, sugar: 0, sodium: 1529 },
  },
  'cream cheese': {
    id: 'local-48', name: 'Cream Cheese', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 342, protein: 6, carbs: 4, fat: 34, fiber: 0, sugar: 3, sodium: 294 },
  },
  'sour cream': {
    id: 'local-49', name: 'Sour Cream', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 193, protein: 2.4, carbs: 4.6, fat: 19, fiber: 0, sugar: 4, sodium: 39 },
  },
  'butter': {
    id: 'local-50', name: 'Butter', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, sugar: 0.1, sodium: 11 },
  },

  // == GRAINS & CEREALS ==
  'rice': {
    id: 'local-2', name: 'White Rice (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0, sodium: 1 },
  },
  'brown rice': {
    id: 'local-51', name: 'Brown Rice (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 5 },
  },
  'quinoa': {
    id: 'local-20', name: 'Quinoa (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, sugar: 0.9, sodium: 7 },
  },
  'oats': {
    id: 'local-52', name: 'Rolled Oats', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 10, sugar: 0, sodium: 2 },
  },
  'oatmeal': {
    id: 'local-8', name: 'Oatmeal (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 71, protein: 2.5, carbs: 12, fat: 1.5, fiber: 1.7, sugar: 0.3, sodium: 2 },
  },
  'couscous': {
    id: 'local-53', name: 'Couscous (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 112, protein: 3.8, carbs: 23, fat: 0.2, fiber: 1.4, sugar: 0, sodium: 5 },
  },
  'barley': {
    id: 'local-54', name: 'Barley (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 123, protein: 3.6, carbs: 28, fat: 0.4, fiber: 3.8, sugar: 0.4, sodium: 3 },
  },
  'farro': {
    id: 'local-55', name: 'Farro (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 150, protein: 5, carbs: 29, fat: 1, fiber: 4, sugar: 0, sodium: 5 },
  },
  'granola': {
    id: 'local-56', name: 'Granola', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 471, protein: 10, carbs: 64, fat: 20, fiber: 6, sugar: 24, sodium: 30 },
  },

  // == PASTA & BREAD ==
  'pasta': {
    id: 'local-12', name: 'Pasta (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, sodium: 1 },
  },
  'whole wheat pasta': {
    id: 'local-57', name: 'Whole Wheat Pasta (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 124, protein: 5.3, carbs: 26, fat: 0.5, fiber: 3, sugar: 0.8, sodium: 4 },
  },
  'bread': {
    id: 'local-5', name: 'White Bread', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5, sodium: 681 },
  },
  'whole wheat bread': {
    id: 'local-58', name: 'Whole Wheat Bread', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 7, sugar: 5, sodium: 527 },
  },
  'sourdough': {
    id: 'local-59', name: 'Sourdough Bread', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 266, protein: 9, carbs: 50, fat: 3, fiber: 2, sugar: 1, sodium: 538 },
  },
  'tortilla': {
    id: 'local-60', name: 'Flour Tortilla', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 300, protein: 8, carbs: 50, fat: 7, fiber: 3, sugar: 2, sodium: 600 },
  },
  'bagel': {
    id: 'local-61', name: 'Bagel (plain)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 275, protein: 11, carbs: 53, fat: 1.5, fiber: 2, sugar: 6, sodium: 440 },
  },
  'pita': {
    id: 'local-62', name: 'Pita Bread', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 275, protein: 9, carbs: 55, fat: 1, fiber: 2, sugar: 1, sodium: 380 },
  },

  // == LEGUMES & SOY ==
  'lentils': {
    id: 'local-63', name: 'Lentils (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, sugar: 1.8, sodium: 2 },
  },
  'chickpeas': {
    id: 'local-64', name: 'Chickpeas (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 164, protein: 9, carbs: 27, fat: 2.6, fiber: 7.6, sugar: 4.8, sodium: 7 },
  },
  'black beans': {
    id: 'local-65', name: 'Black Beans (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 132, protein: 8.9, carbs: 24, fat: 0.5, fiber: 8.7, sugar: 0.3, sodium: 1 },
  },
  'kidney beans': {
    id: 'local-66', name: 'Kidney Beans (cooked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 127, protein: 8.7, carbs: 23, fat: 0.5, fiber: 7.4, sugar: 0.3, sodium: 1 },
  },
  'edamame': {
    id: 'local-67', name: 'Edamame (shelled)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 121, protein: 12, carbs: 8.9, fat: 5.2, fiber: 5.2, sugar: 2.2, sodium: 6 },
  },
  'tofu': {
    id: 'local-16', name: 'Tofu (firm)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6, sodium: 7 },
  },
  'tempeh': {
    id: 'local-68', name: 'Tempeh', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 193, protein: 19, carbs: 9, fat: 11, fiber: 0, sugar: 0, sodium: 9 },
  },
  'hummus': {
    id: 'local-69', name: 'Hummus', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 166, protein: 8, carbs: 14, fat: 10, fiber: 4, sugar: 0, sodium: 379 },
  },

  // == VEGETABLES ==
  'broccoli': {
    id: 'local-11', name: 'Broccoli', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33 },
  },
  'spinach': {
    id: 'local-70', name: 'Spinach', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79 },
  },
  'kale': {
    id: 'local-71', name: 'Kale', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9, fiber: 3.6, sugar: 2.3, sodium: 43 },
  },
  'carrots': {
    id: 'local-72', name: 'Carrots', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69 },
  },
  'bell pepper': {
    id: 'local-73', name: 'Red Bell Pepper', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, sugar: 4.2, sodium: 3 },
  },
  'cucumber': {
    id: 'local-74', name: 'Cucumber', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, sugar: 1.7, sodium: 2 },
  },
  'tomato': {
    id: 'local-75', name: 'Tomato', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5 },
  },
  'onion': {
    id: 'local-76', name: 'Onion', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2, sodium: 4 },
  },
  'garlic': {
    id: 'local-77', name: 'Garlic', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1, sugar: 1, sodium: 17 },
  },
  'mushrooms': {
    id: 'local-78', name: 'Mushrooms', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1, sugar: 2, sodium: 5 },
  },
  'asparagus': {
    id: 'local-79', name: 'Asparagus', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, fiber: 2.1, sugar: 1.9, sodium: 2 },
  },
  'zucchini': {
    id: 'local-80', name: 'Zucchini', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, sugar: 2.5, sodium: 8 },
  },
  'sweet potato': {
    id: 'local-19', name: 'Sweet Potato', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sugar: 4.2, sodium: 55 },
  },
  'potato': {
    id: 'local-81', name: 'Potato (baked)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 93, protein: 2.5, carbs: 21, fat: 0.1, fiber: 2.2, sugar: 1.2, sodium: 10 },
  },
  'corn': {
    id: 'local-82', name: 'Corn (sweet)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 96, protein: 3.4, carbs: 21, fat: 1.5, fiber: 2.4, sugar: 4.5, sodium: 15 },
  },
  'peas': {
    id: 'local-83', name: 'Green Peas', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 81, protein: 5.4, carbs: 14, fat: 0.4, fiber: 5.1, sugar: 5.9, sodium: 3 },
  },
  'cauliflower': {
    id: 'local-84', name: 'Cauliflower', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, sugar: 1.9, sodium: 30 },
  },
  'green beans': {
    id: 'local-85', name: 'Green Beans', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 31, protein: 1.8, carbs: 7, fat: 0.1, fiber: 2.7, sugar: 3.3, sodium: 6 },
  },
  'celery': {
    id: 'local-86', name: 'Celery', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 16, protein: 0.7, carbs: 3.5, fat: 0.2, fiber: 1.6, sugar: 1.8, sodium: 80 },
  },

  // == FRUITS ==
  'banana': {
    id: 'local-3', name: 'Banana', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1 },
  },
  'apple': {
    id: 'local-7', name: 'Apple', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1 },
  },
  'orange': {
    id: 'local-87', name: 'Orange', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, sugar: 9.4, sodium: 0 },
  },
  'strawberries': {
    id: 'local-88', name: 'Strawberries', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9, sodium: 1 },
  },
  'blueberries': {
    id: 'local-89', name: 'Blueberries', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sugar: 10, sodium: 1 },
  },
  'grapes': {
    id: 'local-90', name: 'Grapes', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, sugar: 16, sodium: 2 },
  },
  'watermelon': {
    id: 'local-91', name: 'Watermelon', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, sugar: 6.2, sodium: 1 },
  },
  'pineapple': {
    id: 'local-92', name: 'Pineapple', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, sugar: 9.9, sodium: 1 },
  },
  'mango': {
    id: 'local-93', name: 'Mango', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 13.7, sodium: 1 },
  },
  'kiwi': {
    id: 'local-94', name: 'Kiwi', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3, sugar: 9, sodium: 3 },
  },
  'avocado': {
    id: 'local-10', name: 'Avocado', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7, sodium: 7 },
  },
  'dates': {
    id: 'local-95', name: 'Medjool Dates', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 277, protein: 1.8, carbs: 75, fat: 0.2, fiber: 6.7, sugar: 66, sodium: 1 },
  },
  'raisins': {
    id: 'local-96', name: 'Raisins', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 299, protein: 3.1, carbs: 79, fat: 0.5, fiber: 3.7, sugar: 59, sodium: 11 },
  },
  'cherries': {
    id: 'local-97', name: 'Cherries (sweet)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 63, protein: 1.1, carbs: 16, fat: 0.2, fiber: 2.1, sugar: 13, sodium: 0 },
  },

  // == NUTS & SEEDS ==
  'almonds': {
    id: 'local-98', name: 'Almonds', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, sugar: 4.4, sodium: 1 },
  },
  'walnuts': {
    id: 'local-99', name: 'Walnuts', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, sugar: 2.6, sodium: 2 },
  },
  'cashews': {
    id: 'local-100', name: 'Cashews', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3, sugar: 5.9, sodium: 12 },
  },
  'pistachios': {
    id: 'local-101', name: 'Pistachios', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 560, protein: 20, carbs: 27, fat: 45, fiber: 10, sugar: 7.7, sodium: 1 },
  },
  'peanuts': {
    id: 'local-102', name: 'Peanuts', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, sugar: 4.7, sodium: 18 },
  },
  'peanut butter': {
    id: 'local-18', name: 'Peanut Butter', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, sugar: 9, sodium: 17 },
  },
  'chia seeds': {
    id: 'local-103', name: 'Chia Seeds', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 486, protein: 16, carbs: 42, fat: 31, fiber: 34, sugar: 0, sodium: 16 },
  },
  'flax seeds': {
    id: 'local-104', name: 'Flax Seeds', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 534, protein: 18, carbs: 29, fat: 42, fiber: 27, sugar: 1.5, sodium: 30 },
  },
  'pumpkin seeds': {
    id: 'local-105', name: 'Pumpkin Seeds', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 559, protein: 30, carbs: 11, fat: 49, fiber: 6, sugar: 0, sodium: 7 },
  },
  'sunflower seeds': {
    id: 'local-106', name: 'Sunflower Seeds', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 584, protein: 21, carbs: 20, fat: 51, fiber: 9, sugar: 2.6, sodium: 9 },
  },

  // == OILS & FATS ==
  'olive oil': {
    id: 'local-107', name: 'Olive Oil', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0 },
  },
  'coconut oil': {
    id: 'local-108', name: 'Coconut Oil', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0 },
  },

  // == SUPPLEMENTS ==
  'whey protein': {
    id: 'local-109', name: 'Whey Protein (Isolate)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 380, protein: 90, carbs: 3, fat: 1, fiber: 0, sugar: 1, sodium: 180 },
  },
  'casein protein': {
    id: 'local-110', name: 'Casein Protein', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 370, protein: 85, carbs: 4, fat: 1, fiber: 0, sugar: 2, sodium: 200 },
  },
  'mass gainer': {
    id: 'local-111', name: 'Mass Gainer', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 400, protein: 25, carbs: 65, fat: 4, fiber: 1, sugar: 20, sodium: 150 },
  },
  'creatine': {
    id: 'local-112', name: 'Creatine Monohydrate', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
  },
  'protein bar': {
    id: 'local-113', name: 'Protein Bar', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 350, protein: 30, carbs: 40, fat: 8, fiber: 5, sugar: 15, sodium: 200 },
  },
  'rice cakes': {
    id: 'local-114', name: 'Rice Cakes', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 386, protein: 8, carbs: 82, fat: 3, fiber: 4, sugar: 1, sodium: 0 },
  },
  'protein shake': {
    id: 'local-17', name: 'Protein Shake (ready-to-drink)', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 120, protein: 25, carbs: 3, fat: 1, fiber: 0, sugar: 1, sodium: 130 },
  },

  // == DRINKS ==
  'coconut water': {
    id: 'local-115', name: 'Coconut Water', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, fiber: 0, sugar: 2.6, sodium: 105 },
  },
  'chocolate milk': {
    id: 'local-116', name: 'Chocolate Milk', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 83, protein: 3.4, carbs: 13, fat: 2, fiber: 0, sugar: 11, sodium: 56 },
  },
  'orange juice': {
    id: 'local-117', name: 'Orange Juice', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 45, protein: 0.7, carbs: 10, fat: 0.2, fiber: 0, sugar: 8.5, sodium: 1 },
  },
  'coffee': {
    id: 'local-118', name: 'Black Coffee', source: 'openfoodfacts', servingSize: 100, servingUnit: 'ml',
    nutrition: { calories: 1, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 2 },
  },

  // == ATHLETE MEAL COMBOS ==
  'chicken and rice': {
    id: 'local-119', name: 'Chicken & Rice Bowl', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 145, protein: 16, carbs: 14, fat: 2, fiber: 0.5, sugar: 0, sodium: 40 },
  },
  'beef and potato': {
    id: 'local-120', name: 'Beef & Potato Bowl', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 170, protein: 14, carbs: 10, fat: 8, fiber: 1, sugar: 0.5, sodium: 45 },
  },
  'salmon and quinoa': {
    id: 'local-121', name: 'Salmon & Quinoa Bowl', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 160, protein: 12, carbs: 10, fat: 7, fiber: 1.5, sugar: 0.5, sodium: 35 },
  },
  'tuna salad': {
    id: 'local-122', name: 'Tuna Salad', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 150, protein: 15, carbs: 5, fat: 8, fiber: 1, sugar: 2, sodium: 300 },
  },
  'egg and rice': {
    id: 'local-123', name: 'Egg & Rice Bowl', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 140, protein: 8, carbs: 14, fat: 6, fiber: 0.3, sugar: 0.3, sodium: 60 },
  },
  'steak and sweet potato': {
    id: 'local-124', name: 'Steak & Sweet Potato', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 175, protein: 14, carbs: 10, fat: 9, fiber: 1.5, sugar: 2, sodium: 45 },
  },
  'greek yogurt parfait': {
    id: 'local-125', name: 'Greek Yogurt Parfait', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 110, protein: 7, carbs: 15, fat: 2, fiber: 1, sugar: 10, sodium: 35 },
  },
  'turkey sandwich': {
    id: 'local-126', name: 'Turkey Sandwich', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 190, protein: 12, carbs: 22, fat: 6, fiber: 2, sugar: 3, sodium: 450 },
  },
  'oatmeal protein bowl': {
    id: 'local-127', name: 'Oatmeal Protein Bowl', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 130, protein: 10, carbs: 18, fat: 2, fiber: 2, sugar: 3, sodium: 50 },
  },
  'pasta bolognese': {
    id: 'local-128', name: 'Pasta Bolognese', source: 'openfoodfacts', servingSize: 100, servingUnit: 'g',
    nutrition: { calories: 140, protein: 8, carbs: 18, fat: 4, fiber: 2, sugar: 2, sodium: 80 },
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
