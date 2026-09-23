import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { PetModel, OrderModel, ProductModel, SubscriptionModel } from '../models';
import { RecommendationService } from '../services/recommendationService';
import { ReorderService } from '../services/reorderService';

export const getPets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user) {
      const userPets = await PetModel.find({ userId: req.user.id });
      if (req.query.all === 'true' || userPets.length === 0) {
        const allDogs = await PetModel.find();
        return res.json({ success: true, pets: allDogs });
      }
      return res.json({ success: true, pets: userPets });
    }
    // Return all default dogs if guest/unauthenticated so visitors can explore
    const allDogs = await PetModel.find();
    return res.json({ success: true, pets: allDogs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAllPets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allDogs = await PetModel.find();
    return res.json({ success: true, pets: allDogs, count: allDogs.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createPet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const {
      name,
      type = 'dog',
      breed,
      gender,
      isNeuteredOrSpayed,
      birthDate,
      ageYears = 2,
      ageMonths = 0,
      weightLbs = 50,
      size,
      activityLevel = 'moderate',
      dietType,
      allergies = [],
      foodPreferences = [],
      specialNeeds,
      photoUrl,
      notes,
    } = req.body;

    if (!name || !breed) {
      return res.status(400).json({ success: false, error: 'Pet name and breed are required.' });
    }

    // Determine default canine size bucket if not provided
    let calculatedSize = size;
    if (!calculatedSize) {
      const weight = Number(weightLbs);
      if (weight < 12) calculatedSize = 'toy';
      else if (weight < 25) calculatedSize = 'small';
      else if (weight < 55) calculatedSize = 'medium';
      else if (weight < 90) calculatedSize = 'large';
      else calculatedSize = 'giant';
    }

    // Sample dog avatar if none provided
    const defaultDogAvatars = [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80',
    ];
    const finalPhoto = photoUrl || defaultDogAvatars[Math.floor(Math.random() * defaultDogAvatars.length)];

    const pet = await PetModel.create({
      userId: req.user.id,
      name: name.trim(),
      type: type || 'dog',
      breed: breed.trim(),
      gender: gender || 'male',
      isNeuteredOrSpayed: isNeuteredOrSpayed ?? true,
      birthDate: birthDate || '',
      ageYears: Number(ageYears) || 0,
      ageMonths: Number(ageMonths) || 0,
      weightLbs: Number(weightLbs) || 45,
      size: calculatedSize,
      activityLevel: activityLevel || 'moderate',
      dietType: dietType || 'dry_kibble',
      allergies: Array.isArray(allergies) ? allergies : [],
      foodPreferences: Array.isArray(foodPreferences) ? foodPreferences : [],
      specialNeeds: specialNeeds || '',
      photoUrl: finalPhoto,
      notes: notes || '',
      favoriteProductIds: [],
    });

    return res.status(201).json({ success: true, pet });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updatePet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const { id } = req.params;
    const pet = await PetModel.findById(id);

    if (!pet || pet.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Pet profile not found.' });
    }

    const updated = await PetModel.findByIdAndUpdate(id, req.body);
    return res.json({ success: true, pet: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deletePet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const { id } = req.params;
    const pet = await PetModel.findById(id);

    if (!pet || pet.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Pet profile not found.' });
    }

    await PetModel.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Pet profile deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getPetDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let pet = await PetModel.findById(id);

    if (!pet) {
      pet = await PetModel.findOne();
    }

    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet profile not found.' });
    }

    // Get recommendations tailored to this pet
    const { recommendations, reasons } = await RecommendationService.getPersonalizedForPet(pet, 6);

    // Get active subscriptions associated with this pet
    const subscriptions = await SubscriptionModel.find({ petId: pet.id, status: 'active' });

    // Recent orders associated with this pet or user
    const orders = await OrderModel.find({ $or: [{ petId: pet.id }, { userId: pet.userId }] });

    // Reorder reminders
    const reorderAlerts = await ReorderService.getUserReorderAlerts(pet.userId);
    const petAlerts = reorderAlerts.filter((a) => !a.petId || a.petId === pet.id);

    // Pet Reminders & Milestones
    const reminders = [
      {
        id: 'rem-1',
        title: 'Monthly Heartworm & Tick Protection',
        dueDate: 'In 5 days',
        isUrgent: false,
        category: 'wellness',
      },
      {
        id: 'rem-2',
        title: `${pet.name}'s Annual Veterinary Wellness Check`,
        dueDate: 'In 3 weeks',
        isUrgent: false,
        category: 'health',
      },
    ];

    const enrichedRecommendations = recommendations.map((prod) => ({
      ...((prod as any).toObject ? (prod as any).toObject() : prod),
      product: prod,
      reason: reasons[prod.id] || `Tailored specifically for ${pet.name}'s wellness`,
    }));

    return res.json({
      success: true,
      pet,
      recommendations: enrichedRecommendations,
      recommendationReasons: reasons,
      subscriptions,
      recentOrders: orders.slice(0, 3),
      reorderAlerts: petAlerts,
      reminders,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
