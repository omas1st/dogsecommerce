import React, { createContext, useContext, useState, useEffect } from 'react';
import { Pet } from '../types';
import { apiRequest } from '../services/api';
import { useAuth } from './AuthContext';

interface PetContextType {
  pets: Pet[];
  activePet: Pet | null;
  isLoading: boolean;
  setActivePet: (pet: Pet | null) => void;
  refreshPets: () => Promise<void>;
  createPet: (petData: Partial<Pet>) => Promise<Pet>;
  updatePet: (id: string, petData: Partial<Pet>) => Promise<Pet>;
  deletePet: (id: string) => Promise<void>;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshPets = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ success: boolean; pets: Pet[] }>('/pets');
      const loadedPets = data.pets || [];
      setPets(loadedPets);
      if (loadedPets.length > 0 && !activePet) {
        setActivePet(loadedPets[0]);
      }
    } catch (err) {
      console.error('Failed to load pet profiles', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPets();
  }, [user]);

  const createPet = async (petData: Partial<Pet>): Promise<Pet> => {
    const data = await apiRequest<{ success: boolean; pet: Pet }>('/pets', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
    setPets((prev) => [...prev, data.pet]);
    setActivePet(data.pet);
    return data.pet;
  };

  const updatePet = async (id: string, petData: Partial<Pet>): Promise<Pet> => {
    const data = await apiRequest<{ success: boolean; pet: Pet }>(`/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(petData),
    });
    setPets((prev) => prev.map((p) => (p.id === id ? data.pet : p)));
    if (activePet?.id === id) setActivePet(data.pet);
    return data.pet;
  };

  const deletePet = async (id: string) => {
    await apiRequest(`/pets/${id}`, { method: 'DELETE' });
    setPets((prev) => prev.filter((p) => p.id !== id));
    if (activePet?.id === id) {
      setActivePet(pets.find((p) => p.id !== id) || null);
    }
  };

  return (
    <PetContext.Provider
      value={{
        pets,
        activePet,
        isLoading,
        setActivePet,
        refreshPets,
        createPet,
        updatePet,
        deletePet,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePets = () => {
  const context = useContext(PetContext);
  if (!context) throw new Error('usePets must be used within a PetProvider');
  return context;
};
