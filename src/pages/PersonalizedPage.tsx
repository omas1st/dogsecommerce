import React, { useState } from 'react';
import { usePets } from '../context/PetContext';
import { Product } from '../types';
import {
  Sparkles,
  Heart,
  ShieldCheck,
  ArrowRight,
  Home,
  ChevronRight,
  CheckCircle2,
  Award,
  Activity,
  Zap,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface PersonalizedPageProps {
  onNavigate: (route: string, params?: any) => void;
  onSelectProduct?: (product: Product) => void;
}

export const PersonalizedPage: React.FC<PersonalizedPageProps> = ({
  onNavigate,
  onSelectProduct,
}) => {
  const { pets, activePet, setActivePet } = usePets();

  // Interactive Questionnaire State
  const [step, setStep] = useState<number>(1);
  const [dogName, setDogName] = useState('');
  const [dogBreed, setDogBreed] = useState('Golden Retriever');
  const [dogAge, setDogAge] = useState('adult'); // puppy, adult, senior
  const [dogWeight, setDogWeight] = useState(55);
  const [activity, setActivity] = useState('moderate');
  const [healthGoal, setHealthGoal] = useState('digestive'); // digestive, joints, coat, energy, weight
  const [hasAllergies, setHasAllergies] = useState<string[]>(['chicken']);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const toggleAllergy = (allergy: string) => {
    setHasAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const handleFinishQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizCompleted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E6DF]">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1 text-[#0E5E58] font-bold hover:underline"
            >
              <Home size={14} />
              <span>Home</span>
            </button>
            <ChevronRight size={12} className="text-gray-400" />
            <span className="font-semibold text-gray-800">Canine Personalization Lab</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs"
            >
              ← Back to Homepage
            </button>
            <button
              onClick={() => onNavigate('pet-dashboard')}
              className="px-3.5 py-1.5 rounded-lg bg-[#0E5E58] text-xs font-bold text-white hover:bg-[#0B4A45] transition-colors shadow-2xs"
            >
              View 50 Dogs Directory
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3F1] text-[#0E5E58] text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Precision Canine Nutrition &amp; Ergonomics</span>
          </div>
          <h1 className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#1E232A] tracking-tight">
            Personalized For Your Dog's Unique Biology
          </h1>
          <p className="text-sm text-[#525B67] leading-relaxed">
            Every canine metabolism is distinct. Answer 3 quick clinical questions to generate a tailor-made feeding regimen, joint supplement dosage, and crate sizing—or browse our directory of 50 pre-calibrated companion dogs.
          </p>
        </div>

        {/* Interactive Personalization Engine */}
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-10 shadow-xs">
          {!quizCompleted ? (
            <form onSubmit={handleFinishQuiz} className="space-y-8">
              {/* Step indicator */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#0E5E58] text-white flex items-center justify-center text-xs font-bold">
                    {step}
                  </span>
                  <span className="text-xs font-bold text-gray-800">
                    {step === 1 && 'Step 1: Dog Profile & Breed'}
                    {step === 2 && 'Step 2: Metabolism & Allergies'}
                    {step === 3 && 'Step 3: Primary Health Objective'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span>Step {step} of 3</span>
                </div>
              </div>

              {/* Step 1: Name, Breed, Age, Weight */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Your Dog's Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Barnaby, Luna, Winston"
                        value={dogName}
                        onChange={(e) => setDogName(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] p-3 text-sm focus:border-[#0E5E58] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Breed or Mix
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Labrador Retriever, French Bulldog, Doodle"
                        value={dogBreed}
                        onChange={(e) => setDogBreed(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] p-3 text-sm focus:border-[#0E5E58] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Life Stage
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'puppy', label: 'Puppy (<1 yr)' },
                          { id: 'adult', label: 'Adult (1-7 yrs)' },
                          { id: 'senior', label: 'Senior (7+ yrs)' },
                        ].map((stage) => (
                          <button
                            type="button"
                            key={stage.id}
                            onClick={() => setDogAge(stage.id)}
                            className={`p-3 rounded-xl text-xs font-bold border transition-colors ${
                              dogAge === stage.id
                                ? 'border-[#0E5E58] bg-[#F4F8F7] text-[#0E5E58]'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {stage.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Current Weight
                        </label>
                        <span className="text-xs font-bold text-[#0E5E58]">{dogWeight} lbs</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="160"
                        value={dogWeight}
                        onChange={(e) => setDogWeight(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0E5E58] mt-3"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>Toy (4 lbs)</span>
                        <span>Medium (45 lbs)</span>
                        <span>Giant (160 lbs)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={!dogName.trim()}
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 rounded-xl bg-[#0E5E58] px-6 py-3 text-xs font-bold text-white hover:bg-[#0B4A45] disabled:opacity-50 transition-colors"
                    >
                      <span>Continue to Metabolism &amp; Allergies</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Activity & Allergies */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Daily Activity &amp; Energy Burn
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'low', label: 'Couch Companion (Low)', desc: '< 30 min gentle strolls' },
                        { id: 'moderate', label: 'Playful Walker (Moderate)', desc: '1 to 2 hours of park & trail walks' },
                        { id: 'athletic', label: 'High-Drive Athlete (High)', desc: 'Agility, hiking, working dog duties' },
                      ].map((act) => (
                        <div
                          key={act.id}
                          onClick={() => setActivity(act.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                            activity === act.id
                              ? 'border-[#0E5E58] bg-[#F4F8F7]'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-xs font-bold text-gray-900">{act.label}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{act.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Known Sensitivities or Excluded Ingredients
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      We will automatically filter out all formulas containing these proteins and allergens:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'chicken', label: 'Poultry / Chicken' },
                        { id: 'beef', label: 'Beef' },
                        { id: 'dairy', label: 'Dairy / Lactose' },
                        { id: 'grain', label: 'Corn / Wheat / Soy' },
                        { id: 'egg', label: 'Eggs' },
                        { id: 'lamb', label: 'Lamb' },
                        { id: 'fish', label: 'Fish / Shellfish' },
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => toggleAllergy(item.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                            hasAllergies.includes(item.id)
                              ? 'border-rose-300 bg-rose-50 text-rose-800'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {hasAllergies.includes(item.id) ? '✕ Excluded: ' : '+ Exclude: '}
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex items-center gap-2 rounded-xl bg-[#0E5E58] px-6 py-3 text-xs font-bold text-white hover:bg-[#0B4A45]"
                    >
                      <span>Continue to Primary Health Goal</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Health Goal */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      What is your top health priority for {dogName || 'your dog'}?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          id: 'digestive',
                          title: 'Optimal Gut & Sensitive Stomach',
                          desc: 'Firm stools, no gas, balanced microbiome with prebiotics.',
                        },
                        {
                          id: 'joints',
                          title: 'Hip, Joint & Mobility Support',
                          desc: 'Glucosamine and green-lipped mussel for ease of movement.',
                        },
                        {
                          id: 'coat',
                          title: 'Glossy Coat & Anti-Itch Skin',
                          desc: 'Rich omega-3 EPA/DHA fatty acids easing seasonal allergies.',
                        },
                        {
                          id: 'weight',
                          title: 'Lean Muscle & Weight Maintenance',
                          desc: 'High biological protein with controlled clean calories.',
                        },
                      ].map((g) => (
                        <div
                          key={g.id}
                          onClick={() => setHealthGoal(g.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                            healthGoal === g.id
                              ? 'border-[#0E5E58] bg-[#F4F8F7]'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-xs font-bold text-gray-900">{g.title}</div>
                          <div className="text-[11px] text-gray-500 mt-1">{g.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-[#0E5E58] px-8 py-3 text-xs font-bold text-white hover:bg-[#0B4A45] shadow-xs"
                    >
                      <Sparkles size={14} />
                      <span>Generate Personalized Regimen</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* Results Screen */
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center space-y-2 pb-4 border-b border-gray-100">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 size={14} />
                  <span>Custom Formulation Ready for {dogName}</span>
                </span>
                <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#1E232A]">
                  Recommended Care &amp; Nutrition Routine
                </h2>
                <p className="text-xs text-gray-500">
                  Calibrated for a {dogWeight} lb {dogBreed} ({dogAge}) focusing on{' '}
                  {healthGoal} health.
                </p>
              </div>

              {/* Regimen Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-gray-200 p-5 bg-[#FAF9F6] space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E5E58]">
                    1. Primary Nutrition
                  </span>
                  <h4 className="font-serif-brand text-lg font-bold text-gray-900">
                    Cold-Pressed Wild Salmon &amp; Sweet Potato
                  </h4>
                  <p className="text-xs text-gray-600">
                    100% chicken-free single marine protein. Easy on sensitive stomachs and naturally rich in omega-3.
                  </p>
                  <div className="text-xs font-semibold text-gray-800">
                    Serving: <strong>{Math.max(1, Math.round(dogWeight * 0.04))} cups / day</strong>
                  </div>
                  <button
                    onClick={() => onNavigate('shop', { category: 'dog-food' })}
                    className="w-full mt-2 rounded-xl bg-[#0E5E58] py-2 text-xs font-bold text-white hover:bg-[#0B4A45]"
                  >
                    View Formula in Shop
                  </button>
                </div>

                <div className="rounded-2xl border border-gray-200 p-5 bg-[#FAF9F6] space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E5E58]">
                    2. Targeted Supplement
                  </span>
                  <h4 className="font-serif-brand text-lg font-bold text-gray-900">
                    {healthGoal === 'joints'
                      ? 'Green-Lipped Mussel Mobility Chews'
                      : '5 Billion CFU Probiotic Digestive Soft Chews'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    Veterinary clinical dosage formulated to soothe inflammation and promote cellular longevity.
                  </p>
                  <div className="text-xs font-semibold text-gray-800">
                    Dosage: <strong>{dogWeight > 50 ? '2 soft chews' : '1 soft chew'} daily</strong>
                  </div>
                  <button
                    onClick={() => onNavigate('shop', { category: 'health-supplements' })}
                    className="w-full mt-2 rounded-xl bg-[#0E5E58] py-2 text-xs font-bold text-white hover:bg-[#0B4A45]"
                  >
                    View Supplements
                  </button>
                </div>

                <div className="rounded-2xl border border-gray-200 p-5 bg-[#FAF9F6] space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E5E58]">
                    3. Recommended Sizing
                  </span>
                  <h4 className="font-serif-brand text-lg font-bold text-gray-900">
                    Orthopedic Bed &amp; Crate Size: {dogWeight > 70 ? 'Extra Large (XL)' : dogWeight > 40 ? 'Large (L)' : 'Medium (M)'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    Provides 4+ inches of zero-compression memory foam to protect hip and elbow joints during sleep.
                  </p>
                  <div className="text-xs font-semibold text-gray-800">
                    Pre-Owned Available: <strong className="text-emerald-700">Save 60% in Resale</strong>
                  </div>
                  <button
                    onClick={() => onNavigate('resale')}
                    className="w-full mt-2 rounded-xl border border-[#0E5E58] py-2 text-xs font-bold text-[#0E5E58] hover:bg-[#F4F8F7]"
                  >
                    Check Pre-Owned Crates
                  </button>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setQuizCompleted(false);
                    setStep(1);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  ↺ Retake Questionnaire
                </button>
                <button
                  onClick={() => onNavigate('add-pet')}
                  className="px-6 py-2.5 rounded-xl bg-[#0E5E58] text-xs font-bold text-white hover:bg-[#0B4A45]"
                >
                  Save {dogName}'s Profile Permanently
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Explore 50 Default Canines Showcase */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif-brand text-2xl font-bold text-[#1E232A]">
                Or Choose from 50 Pre-Calibrated Canines
              </h2>
              <p className="text-xs text-[#525B67] mt-1">
                Browse our clinical catalog of 50 dogs with tailored caloric burns and nutrition diets ready to test:
              </p>
            </div>
            <button
              onClick={() => onNavigate('pet-dashboard')}
              className="px-4 py-2 rounded-xl border border-[#0E5E58] text-xs font-bold text-[#0E5E58] hover:bg-[#F4F8F7] transition-colors shrink-0"
            >
              Open Full 50 Dogs Directory →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {pets.filter((dog) => dog && dog.id).slice(0, 12).map((dog) => (
              <div
                key={dog.id}
                onClick={() => {
                  setActivePet(dog);
                  onNavigate('pet-dashboard', { petId: dog.id });
                }}
                className={`p-3 rounded-2xl border text-center cursor-pointer transition-all hover:shadow-xs group ${
                  activePet?.id === dog.id
                    ? 'border-[#0E5E58] bg-[#F4F8F7] ring-1 ring-[#0E5E58]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <img
                  src={dog.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80'}
                  alt={dog.name}
                  className="w-14 h-14 rounded-full mx-auto object-cover mb-2 group-hover:scale-105 transition-transform"
                />
                <div className="font-bold text-xs text-gray-900 truncate">{dog.name}</div>
                <div className="text-[10px] text-gray-500 truncate">{dog.breed}</div>
                <div className="mt-1 text-[9px] font-semibold text-[#0E5E58] bg-white border border-gray-100 px-1.5 py-0.5 rounded-full inline-block">
                  {dog.weightLbs} lbs
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
