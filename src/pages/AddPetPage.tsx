import React, { useState } from 'react';
import { Pet } from '../types';
import { usePets } from '../context/PetContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowLeft, ArrowRight, Check, Heart, Shield } from 'lucide-react';

interface AddPetPageProps {
  onNavigate: (route: string, params?: any) => void;
  editingPet?: Pet;
}

export const AddPetPage: React.FC<AddPetPageProps> = ({ onNavigate, editingPet }) => {
  const { createPet, updatePet } = usePets();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(editingPet?.name || '');
  const [breed, setBreed] = useState(editingPet?.breed || 'Golden Retriever');
  const [gender, setGender] = useState<'male' | 'female'>(editingPet?.gender || 'male');
  const [ageYears, setAgeYears] = useState(editingPet?.ageYears || 3);
  const [ageMonths, setAgeMonths] = useState(editingPet?.ageMonths || 0);
  const [weightLbs, setWeightLbs] = useState(editingPet?.weightLbs || 60);
  const [size, setSize] = useState<'toy' | 'small' | 'medium' | 'large' | 'giant'>(editingPet?.size || 'large');
  const [activityLevel, setActivityLevel] = useState<string>(
    editingPet?.activityLevel || 'athletic'
  );
  const [dietType, setDietType] = useState(editingPet?.dietType || 'dry_kibble');
  const [allergies, setAllergies] = useState<string[]>(editingPet?.allergies || ['chicken']);
  const [foodPreferences, setFoodPreferences] = useState<string[]>(
    editingPet?.foodPreferences || ['wild salmon', 'sweet potato']
  );
  const [specialNeeds, setSpecialNeeds] = useState(editingPet?.specialNeeds || '');
  const [photoUrl, setPhotoUrl] = useState(
    editingPet?.photoUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commonBreeds = [
    'Golden Retriever',
    'French Bulldog',
    'Labrador Retriever',
    'German Shepherd',
    'Poodle',
    'Beagle',
    'Rottweiler',
    'Yorkshire Terrier',
    'Boxer',
    'Dachshund',
    'Siberian Husky',
    'Great Dane',
    'Mixed Breed / Rescue Pup',
  ];

  const commonAllergies = ['chicken', 'beef', 'corn', 'wheat', 'dairy', 'soy', 'eggs'];

  const toggleAllergy = (allergy: string) => {
    if (allergies.includes(allergy)) {
      setAllergies(allergies.filter((a) => a !== allergy));
    } else {
      setAllergies([...allergies, allergy]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const petPayload = {
        name: name.trim(),
        type: 'dog' as const,
        breed,
        gender,
        ageYears: Number(ageYears),
        ageMonths: Number(ageMonths),
        weightLbs: Number(weightLbs),
        size,
        activityLevel,
        dietType,
        allergies,
        foodPreferences,
        specialNeeds,
        photoUrl,
      };

      if (editingPet) {
        await updatePet(editingPet.id, petPayload);
        onNavigate('pet-dashboard', { petId: editingPet.id });
      } else {
        const newPet = await createPet(petPayload);
        onNavigate('pet-dashboard', { petId: newPet.id });
      }
    } catch (err: any) {
      alert(err.message || 'Error saving dog profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => onNavigate('my-pets')}
          className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={14} /> Back to Pets
        </button>

        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-8 shadow-xs">
          {/* Header */}
          <div className="text-center pb-6 border-b border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
              {editingPet ? 'Update Pet Profile' : 'New Canine Profile Wizard'}
            </span>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#1E232A] mt-1">
              {editingPet ? `Edit ${editingPet.name}'s Profile` : 'Tell Us About Your Dog'}
            </h1>
            <p className="mt-1 text-xs text-[#525B67]">
              Our veterinary recommendation engine will calculate tailored kibble cup portions, depletion timing, and allergen-safe treats.
            </p>
          </div>

          {/* Wizard Steps Tracker */}
          <div className="flex items-center justify-between py-6 px-4">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-[#0E5E58] text-white' : 'bg-gray-100 text-gray-400'}`}>
                1
              </span>
              <span className="text-xs font-semibold text-gray-800 hidden sm:inline">Basics</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-[#0E5E58]' : 'bg-gray-200'}`} />
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-[#0E5E58] text-white' : 'bg-gray-100 text-gray-400'}`}>
                2
              </span>
              <span className="text-xs font-semibold text-gray-800 hidden sm:inline">Physical &amp; Size</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-[#0E5E58]' : 'bg-gray-200'}`} />
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-[#0E5E58] text-white' : 'bg-gray-100 text-gray-400'}`}>
                3
              </span>
              <span className="text-xs font-semibold text-gray-800 hidden sm:inline">Diet &amp; Health</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basics */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Dog’s Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Max, Bella, Cooper"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#0E5E58] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Primary Breed *
                  </label>
                  <select
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#0E5E58] focus:outline-none bg-white"
                  >
                    {commonBreeds.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`p-3 rounded-xl border text-xs font-semibold ${
                        gender === 'male' ? 'border-[#0E5E58] bg-[#E8F3F1] text-[#0E5E58]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Male Dog
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`p-3 rounded-xl border text-xs font-semibold ${
                        gender === 'female' ? 'border-[#0E5E58] bg-[#E8F3F1] text-[#0E5E58]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Female Dog
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Photo URL</label>
                  <input
                    type="url"
                    placeholder="Paste image link"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-[#0E5E58] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    disabled={!name.trim()}
                    onClick={() => setStep(2)}
                    className="rounded-xl bg-[#0E5E58] px-6 py-3 text-xs font-bold text-white hover:bg-[#0B4A45] flex items-center gap-2 disabled:bg-gray-300"
                  >
                    <span>Next: Physical Attributes</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Physical & Size */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Age (Years)</label>
                    <input
                      type="number"
                      min={0}
                      max={25}
                      value={ageYears}
                      onChange={(e) => setAgeYears(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Age (Months)</label>
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={ageMonths}
                      onChange={(e) => setAgeMonths(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Current Weight (lbs)</label>
                  <input
                    type="number"
                    min={1}
                    max={250}
                    value={weightLbs}
                    onChange={(e) => {
                      const w = Number(e.target.value);
                      setWeightLbs(w);
                      if (w < 15) setSize('toy');
                      else if (w < 30) setSize('small');
                      else if (w < 55) setSize('medium');
                      else if (w < 85) setSize('large');
                      else setSize('giant');
                    }}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Size Classification</label>
                  <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                    {(['toy', 'small', 'medium', 'large', 'giant'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`p-2 rounded-lg border capitalize ${
                          size === s ? 'border-[#0E5E58] bg-[#E8F3F1] text-[#0E5E58] font-bold' : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Activity Level</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as any)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm bg-white"
                  >
                    <option value="low">Low (Senior or Couch Cuddler)</option>
                    <option value="moderate">Moderate (Daily 30-min walk)</option>
                    <option value="high">High (Active fetch &amp; dog park)</option>
                    <option value="athletic">Athletic / Working Dog (Hiking &amp; Agility)</option>
                  </select>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-gray-300 px-5 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="rounded-xl bg-[#0E5E58] px-6 py-3 text-xs font-bold text-white hover:bg-[#0B4A45] flex items-center gap-2"
                  >
                    <span>Next: Nutrition &amp; Allergies</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Nutrition & Health */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Diet Style</label>
                  <select
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm bg-white"
                  >
                    <option value="dry_kibble">Premium Dry Kibble</option>
                    <option value="freeze_dried">Raw &amp; Freeze-Dried Patties</option>
                    <option value="fresh_cooked">Gently Cooked Fresh</option>
                    <option value="wet_canned">Wet / Canned Formulas</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Known Allergies / Sensitivities</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {commonAllergies.map((allergy) => (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize border transition-all ${
                          allergies.includes(allergy)
                            ? 'bg-[#E05338] text-white border-[#E05338]'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {allergy} {allergies.includes(allergy) && '✕'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Special Health Needs or Veterinarian Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Sensitive stomach, requires elevated bowls, seasonal dry paw pads..."
                    value={specialNeeds}
                    onChange={(e) => setSpecialNeeds(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-[#0E5E58] focus:outline-none"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-xl border border-gray-300 px-5 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-[#0E5E58] px-6 py-3 text-xs font-bold text-white hover:bg-[#0B4A45] flex items-center gap-2 shadow-md"
                  >
                    <span>{editingPet ? 'Save Profile Changes' : 'Complete Dog Profile'}</span>
                    <Check size={14} />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
