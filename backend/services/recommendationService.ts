import { ProductModel } from '../models';
import { IPet, IProduct } from '../models/types';

export class RecommendationService {
  public static async getPersonalizedForPet(pet: IPet, limit: number = 8): Promise<{
    recommendations: IProduct[];
    reasons: Record<string, string>;
  }> {
    const allProducts = await ProductModel.find({ isPublished: true });
    const reasons: Record<string, string> = {};

    const scoredProducts = allProducts.map((prod) => {
      let score = 0;
      const reasonsList: string[] = [];

      // Check allergies (strict negative penalty)
      if (pet.allergies && pet.allergies.length > 0) {
        const hasAllergen = pet.allergies.some((allergen) => {
          const lowerAllergen = allergen.toLowerCase();
          const allergenInIngredients = prod.ingredients?.some((ing) => ing.toLowerCase().includes(lowerAllergen));
          const allergenInTitle = prod.title.toLowerCase().includes(lowerAllergen);
          return allergenInIngredients || allergenInTitle;
        });

        if (hasAllergen) {
          score -= 100; // Skip allergic items
        }
      }

      // Match Life Stage
      const petLifeStage = pet.ageYears < 1 ? 'puppy' : pet.ageYears >= 7 ? 'senior' : 'adult';
      if (prod.suitability.lifeStages.includes(petLifeStage) || prod.suitability.lifeStages.includes('all_stages')) {
        score += 30;
        if (prod.suitability.lifeStages.includes(petLifeStage)) {
          reasonsList.push(`Formulated for ${petLifeStage} dogs like ${pet.name}`);
        }
      }

      // Match Size
      if (prod.suitability.sizes.includes(pet.size) || prod.suitability.sizes.includes('all_sizes')) {
        score += 25;
        if (prod.suitability.sizes.includes(pet.size)) {
          reasonsList.push(`Engineered for ${pet.size}-breed canines (${pet.weightLbs} lbs)`);
        }
      }

      // Match Breed Suitability
      if (prod.suitability.breedRecommendations?.some((b) => b.toLowerCase().includes(pet.breed.toLowerCase()))) {
        score += 35;
        reasonsList.push(`Tailored specifically for ${pet.breed}s`);
      }

      // High Activity Dogs
      if (pet.activityLevel === 'high' || pet.activityLevel === 'athletic') {
        if (prod.tags.includes('high-protein') || prod.tags.includes('durable') || prod.tags.includes('agility')) {
          score += 20;
          reasonsList.push(`High-energy nutrition & durability for active dogs`);
        }
      }

      // Senior dogs joint care
      if (pet.ageYears >= 7) {
        if (prod.tags.includes('joint-support') || prod.tags.includes('orthopedic')) {
          score += 30;
          reasonsList.push(`Supports joint flexibility & comfort for senior dogs`);
        }
      }

      if (prod.bestSeller) score += 5;

      const primaryReason = reasonsList[0] || `Selected for ${pet.name}'s breed & wellness profile`;
      reasons[prod.id] = primaryReason;

      return { product: prod, score };
    });

    const filtered = scoredProducts
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.product);

    return { recommendations: filtered, reasons };
  }

  public static async getSimilarProducts(productId: string, limit: number = 4): Promise<IProduct[]> {
    const current = await ProductModel.findById(productId);
    if (!current) return [];

    const products = await ProductModel.find({
      isPublished: true,
      category: current.category,
      id: { $ne: current.id },
    });

    return products.slice(0, limit);
  }
}
