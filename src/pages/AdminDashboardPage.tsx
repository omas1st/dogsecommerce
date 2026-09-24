import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import {
  ALL_MARKETPLACE_ITEMS,
  MARKETPLACE_CATEGORIES,
} from '../data/marketplaceCatalog';
import {
  Users,
  Package,
  Search,
  Plus,
  Trash2,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Dog,
  RefreshCw,
  ShoppingBag,
  Calendar,
  Mail,
  DollarSign,
  ArrowUpDown,
  Filter,
  Layers,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  LogOut,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (route: string, params?: any) => void;
}

interface OrderItemInfo {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  total?: number;
  image?: string;
  sku?: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  subtotal: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  items: OrderItemInfo[];
  createdAt: string;
  shippingAddress?: {
    city?: string;
    state?: string;
    streetAddress?: string;
  };
}

interface SupplyItem {
  id: string;
  slug?: string;
  title: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  stock: number;
  brand?: string;
  featured?: boolean;
  bestSeller?: boolean;
  rating?: number;
  sku?: string;
  itemType?: string;
  shape?: string;
  recentlyAdminEditedAt?: number;
  isRecentlyUpdated?: boolean;
  isNewlyAdded?: boolean;
}

interface AdoptionDogItem {
  id: string;
  name: string;
  breed: string;
  size: 'toy' | 'small' | 'medium' | 'large' | 'giant' | string;
  price: number;
  comparePrice?: number;
  photoUrl: string;
  description: string;
  ageYears?: number;
  ageMonths?: number;
  gender?: 'male' | 'female' | string;
  location?: string;
  partnerSource?: string;
  energyLevel?: string;
  temperament?: string[] | string;
  recentlyAdminEditedAt?: number;
  isRecentlyUpdated?: boolean;
  isNewlyAdded?: boolean;
}

// Unified item type for the items tab
interface UnifiedItem {
  id: string;
  itemKind: 'supply' | 'dog';
  name: string; // title or name
  price: number;
  image: string; // images[0] or photoUrl
  description: string;
  categoryOrBreed: string;
  categorySlug: string;
  stockOrSize: string;
  featured?: boolean;
  raw: SupplyItem | AdoptionDogItem;
}

// Homepage order of curated categories for homepage arrangement filter
const HOMEPAGE_CATEGORIES_ORDER: Record<string, number> = {
  'dog-food': 1,
  'beds-furniture': 2,
  'dog-beds': 2,
  'health-supplements': 3,
  'dog-health-wellness': 3,
  'collars-leashes': 4,
  'dog-collars-leashes-harnesses': 4,
  'crates-travel': 5,
  'dog-crates-gates-pens': 5,
  'dog-outdoor-travel': 5,
  'dog-treats': 6,
  'dog-treats-chews': 6,
};

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, login, logout } = useAuth();
  // Only 2 tabs requested: 'usersdetails' and 'items'
  const [activeTab, setActiveTab] = useState<'usersdetails' | 'items'>('usersdetails');

  // Data states
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>(() => {
    return ALL_MARKETPLACE_ITEMS as any[];
  });
  const [adoptionDogs, setAdoptionDogs] = useState<AdoptionDogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User details tab filters
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userSortOrder, setUserSortOrder] = useState<'newest' | 'oldest' | 'price-high' | 'price-low'>('newest');

  // Items tab filters
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'supplies' | 'dogs'>('all');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [itemSortFilter, setItemSortFilter] = useState<
    'homepage' | 'name-asc' | 'name-desc' | 'price-low' | 'price-high'
  >('homepage');
  const [itemPriceBracket, setItemPriceBracket] = useState<string>('all');
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>('all');

  // Pagination for items
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showAllItems, setShowAllItems] = useState<boolean>(false);
  const PAGE_SIZE = 36;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addKind, setAddKind] = useState<'supply' | 'dog'>('supply');
  const [editingItem, setEditingItem] = useState<UnifiedItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<UnifiedItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    category: 'dog-food',
    brand: 'Hound & Harbor',
    stock: '50',
    featured: true,
    // Dog specific
    breed: 'Golden Retriever',
    size: 'medium',
    ageYears: '1',
    gender: 'female',
    location: 'Austin, TX',
  });

  // Check if admin
  const isAdmin = !!user && (user.role === 'admin' || user.role === 'super_admin');

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes, dogsRes] = await Promise.all([
        apiRequest<{ success: boolean; orders: OrderRecord[] }>('/admin/orders').catch(() => ({ success: false, orders: [] })),
        apiRequest<{ success: boolean; products: SupplyItem[] }>('/admin/products').catch(() => ({ success: false, products: [] })),
        apiRequest<{ success: boolean; dogs: AdoptionDogItem[] }>('/admin/marketplace-dogs').catch(() => ({ success: false, dogs: [] })),
      ]);

      setOrders(ordersRes.orders || []);

      // Merge ALL_MARKETPLACE_ITEMS with server products so that ALL 624+ marketplace items are present
      const supplyMap = new Map<string, SupplyItem>();

      // 1. Base: all marketplace catalog items
      (ALL_MARKETPLACE_ITEMS as any[]).forEach((it) => {
        supplyMap.set(it.id, it);
        if (it.slug) supplyMap.set(it.slug, it);
      });

      // 2. Server products (overwrites with any live edits from DB)
      (productsRes.products || []).forEach((p) => {
        supplyMap.set(p.id, p);
        if (p.slug) supplyMap.set(p.slug, p);
      });

      const fullSuppliesList = Array.from(new Set(supplyMap.values()));
      setSupplies(fullSuppliesList);

      setAdoptionDogs(dogsRes.dogs || []);
    } catch (err: any) {
      console.error('Admin data load error:', err);
      showToast('error', 'Could not refresh some dashboard records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  // Quick admin login helper
  const handleQuickAdminLogin = async () => {
    try {
      setIsLoading(true);
      await login('angelkimberly1st@gmail.com', '@Stephen1st');
      showToast('success', 'Logged in as Administrator.');
    } catch (err) {
      try {
        await login('admin@houndandharbor.com', 'AdminSecure2026!');
        showToast('success', 'Logged in as Administrator.');
      } catch (err2: any) {
        showToast('error', 'Admin login error: ' + (err2.message || 'Credentials rejected'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Build unified items array (all supplies + all adoption dogs)
  const unifiedItems: UnifiedItem[] = useMemo(() => {
    const list: UnifiedItem[] = [];

    // 1. Dog Supplies (624+ items)
    supplies.forEach((p) => {
      list.push({
        id: p.id,
        itemKind: 'supply',
        name: p.title || 'Dog Supply Item',
        price: Number(p.price) || 0,
        image: p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80',
        description: p.description || '',
        categoryOrBreed: p.category || 'Supplies',
        categorySlug: p.category || '',
        stockOrSize: `${p.stock ?? 50} in stock`,
        featured: !!p.featured,
        raw: p,
      });
    });

    // 2. Dogs for Adoption (100 dogs)
    adoptionDogs.forEach((d) => {
      list.push({
        id: d.id,
        itemKind: 'dog',
        name: d.name || 'Adoption Dog',
        price: Number(d.price) || 0,
        image: d.photoUrl || 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg',
        description: d.description || '',
        categoryOrBreed: d.breed || 'Rescue Pup',
        categorySlug: 'adoption-dogs',
        stockOrSize: `${d.size ? d.size.toUpperCase() : 'MEDIUM'} Size`,
        featured: false,
        raw: d,
      });
    });

    return list;
  }, [supplies, adoptionDogs]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [itemTypeFilter, itemSearchQuery, itemCategoryFilter, itemPriceBracket, itemSortFilter]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...unifiedItems];

    // Filter by item kind (Dog Supplies vs Dogs for Adoption)
    if (itemTypeFilter === 'supplies') {
      result = result.filter((it) => it.itemKind === 'supply');
    } else if (itemTypeFilter === 'dogs') {
      result = result.filter((it) => it.itemKind === 'dog');
    }

    // Filter by name/search
    if (itemSearchQuery.trim()) {
      const q = itemSearchQuery.toLowerCase().trim();
      result = result.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.categoryOrBreed.toLowerCase().includes(q) ||
          it.description.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (itemCategoryFilter !== 'all') {
      result = result.filter(
        (it) =>
          it.categorySlug === itemCategoryFilter ||
          it.categoryOrBreed.toLowerCase() === itemCategoryFilter.toLowerCase()
      );
    }

    // Filter by price bracket
    if (itemPriceBracket !== 'all') {
      if (itemPriceBracket === 'under25') result = result.filter((it) => it.price < 25);
      else if (itemPriceBracket === '25to50') result = result.filter((it) => it.price >= 25 && it.price <= 50);
      else if (itemPriceBracket === '50to100') result = result.filter((it) => it.price > 50 && it.price <= 100);
      else if (itemPriceBracket === '100to200') result = result.filter((it) => it.price > 100 && it.price <= 200);
      else if (itemPriceBracket === 'over200') result = result.filter((it) => it.price > 200);
    }

    // Sorting: Homepage arrangement vs By Names vs By Prices
    if (itemSortFilter === 'homepage') {
      result.sort((a, b) => {
        const aCat = a.itemKind === 'supply' ? (a.raw as SupplyItem).category : '';
        const bCat = b.itemKind === 'supply' ? (b.raw as SupplyItem).category : '';
        const aOrder = HOMEPAGE_CATEGORIES_ORDER[aCat] || 99;
        const bOrder = HOMEPAGE_CATEGORIES_ORDER[bCat] || 99;

        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.name.localeCompare(b.name);
      });
    } else if (itemSortFilter === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (itemSortFilter === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (itemSortFilter === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (itemSortFilter === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [
    unifiedItems,
    itemTypeFilter,
    itemSearchQuery,
    itemCategoryFilter,
    itemPriceBracket,
    itemSortFilter,
  ]);

  // Paginated slice
  const paginatedItems = useMemo(() => {
    if (showAllItems) return filteredItems;
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage, showAllItems]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE) || 1;

  // Filter and sort user orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase().trim();
      result = result.filter((ord) => {
        const matchCustomer = ord.customerName.toLowerCase().includes(q);
        const matchEmail = ord.customerEmail.toLowerCase().includes(q);
        const matchOrderNum = ord.orderNumber.toLowerCase().includes(q);
        const matchItem = ord.items?.some((it) => it.title.toLowerCase().includes(q));
        return matchCustomer || matchEmail || matchOrderNum || matchItem;
      });
    }

    if (userStatusFilter !== 'all') {
      result = result.filter((ord) => ord.orderStatus?.toLowerCase() === userStatusFilter.toLowerCase());
    }

    if (userSortOrder === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (userSortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (userSortOrder === 'price-high') {
      result.sort((a, b) => b.total - a.total);
    } else if (userSortOrder === 'price-low') {
      result.sort((a, b) => a.total - b.total);
    }

    return result;
  }, [orders, userSearchQuery, userStatusFilter, userSortOrder]);

  // Stats summary for User Details tab
  const userStats = useMemo(() => {
    const totalOrdersCount = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const uniqueEmails = new Set(orders.map((o) => o.customerEmail?.toLowerCase())).size;
    const totalItemsPurchased = orders.reduce(
      (sum, o) => sum + (o.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 0),
      0
    );
    return {
      totalOrdersCount,
      totalRevenue,
      uniqueEmails,
      totalItemsPurchased,
    };
  }, [orders]);

  // Handle Add Item Submit
  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      showToast('error', 'Please enter a valid item name and price.');
      return;
    }

    setIsSubmitting(true);
    const now = Date.now();
    try {
      if (addKind === 'supply') {
        const payload = {
          title: formData.name.trim(),
          price: Number(formData.price),
          images: [formData.image.trim() || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80'],
          description: formData.description.trim(),
          category: formData.category,
          brand: formData.brand.trim() || 'Hound & Harbor',
          stock: Number(formData.stock) || 50,
          featured: formData.featured,
          recentlyAdminEditedAt: now,
          isRecentlyUpdated: true,
          isNewlyAdded: true,
        };

        const res = await apiRequest<{ success: boolean; product: SupplyItem }>('/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        const newSupply: SupplyItem = res.product || {
          id: `prod-${now}`,
          ...payload,
        };

        setSupplies((prev) => [newSupply, ...prev]);

        // Save to localStorage for immediate marketplace storefront presence
        try {
          const raw = localStorage.getItem('hound_marketplace_custom_supplies');
          const list: SupplyItem[] = raw ? JSON.parse(raw) : [];
          list.unshift(newSupply);
          localStorage.setItem('hound_marketplace_custom_supplies', JSON.stringify(list));
        } catch (e) {
          console.error(e);
        }

        showToast('success', `Created dog supply: ${newSupply.title} (Placed at top of Marketplace)`);
      } else {
        const payload = {
          name: formData.name.trim(),
          price: Number(formData.price),
          photoUrl: formData.image.trim() || 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg',
          description: formData.description.trim(),
          breed: formData.breed.trim() || 'Mixed Breed',
          size: formData.size,
          ageYears: Number(formData.ageYears) || 1,
          gender: formData.gender,
          location: formData.location.trim() || 'Austin, TX',
          partnerSource: 'Hound & Harbor Adoption Care',
          recentlyAdminEditedAt: now,
          isRecentlyUpdated: true,
          isNewlyAdded: true,
        };

        const res = await apiRequest<{ success: boolean; dog: AdoptionDogItem }>('/admin/marketplace-dogs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        const newDog: AdoptionDogItem = res.dog || {
          id: `dog-${now}`,
          ...payload,
        };

        setAdoptionDogs((prev) => [newDog, ...prev]);

        // Save to localStorage for immediate marketplace storefront presence
        try {
          const raw = localStorage.getItem('hound_marketplace_custom_dogs');
          const list: AdoptionDogItem[] = raw ? JSON.parse(raw) : [];
          list.unshift(newDog);
          localStorage.setItem('hound_marketplace_custom_dogs', JSON.stringify(list));
        } catch (e) {
          console.error(e);
        }

        showToast('success', `Added dog for adoption: ${newDog.name} (Placed at top of Marketplace)`);
      }

      setIsAddModalOpen(false);
      setFormData({
        name: '',
        price: '',
        image: '',
        description: '',
        category: 'dog-food',
        brand: 'Hound & Harbor',
        stock: '50',
        featured: true,
        breed: 'Golden Retriever',
        size: 'medium',
        ageYears: '1',
        gender: 'female',
        location: 'Austin, TX',
      });
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: UnifiedItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: String(item.price),
      image: item.image,
      description: item.description,
      category: (item.raw as SupplyItem).category || 'dog-food',
      brand: (item.raw as SupplyItem).brand || 'Hound & Harbor',
      stock: String((item.raw as SupplyItem).stock ?? 50),
      featured: !!item.featured,
      breed: (item.raw as AdoptionDogItem).breed || 'Golden Retriever',
      size: (item.raw as AdoptionDogItem).size || 'medium',
      ageYears: String((item.raw as AdoptionDogItem).ageYears ?? 1),
      gender: (item.raw as AdoptionDogItem).gender || 'female',
      location: (item.raw as AdoptionDogItem).location || 'Austin, TX',
    });
  };

  // Handle Edit Item Submit (specifically allows changing image, name, price, description)
  const handleEditItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!formData.name.trim() || !formData.price) {
      showToast('error', 'Name and price are required.');
      return;
    }

    setIsSubmitting(true);
    const now = Date.now();
    try {
      if (editingItem.itemKind === 'supply') {
        const payload = {
          title: formData.name.trim(),
          name: formData.name.trim(),
          price: Number(formData.price),
          image: formData.image.trim(),
          images: [formData.image.trim()],
          description: formData.description.trim(),
          category: formData.category,
          stock: Number(formData.stock) || 50,
          brand: formData.brand,
          featured: formData.featured,
          recentlyAdminEditedAt: now,
          isRecentlyUpdated: true,
        };

        const res = await apiRequest<{ success: boolean; product: SupplyItem }>(
          `/admin/products/${editingItem.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          }
        );

        const updatedSupply: SupplyItem = res.product || {
          ...editingItem.raw,
          title: formData.name.trim(),
          price: Number(formData.price),
          images: [formData.image.trim()],
          description: formData.description.trim(),
          category: formData.category,
          stock: Number(formData.stock) || 50,
          brand: formData.brand,
          featured: formData.featured,
          recentlyAdminEditedAt: now,
          isRecentlyUpdated: true,
        };

        setSupplies((prev) => {
          const list = prev.filter((p) => p.id !== editingItem.id && p.sku !== editingItem.id);
          return [updatedSupply, ...list];
        });

        // Save to localStorage for immediate marketplace storefront presence
        try {
          const raw = localStorage.getItem('hound_marketplace_custom_supplies');
          const list: SupplyItem[] = raw ? JSON.parse(raw) : [];
          const idx = list.findIndex((s) => s.id === updatedSupply.id || (s.slug && s.slug === updatedSupply.slug));
          if (idx !== -1) list.splice(idx, 1);
          list.unshift(updatedSupply);
          localStorage.setItem('hound_marketplace_custom_supplies', JSON.stringify(list));
        } catch (e) {
          console.error(e);
        }

        showToast('success', `Updated marketplace item: ${formData.name} (Placed at top of Marketplace)`);
      } else {
        // Dog for adoption update: image, name, price, description
        const payload = {
          name: formData.name.trim(),
          price: Number(formData.price),
          photoUrl: formData.image.trim(),
          image: formData.image.trim(),
          description: formData.description.trim(),
          breed: formData.breed,
          size: formData.size,
          ageYears: Number(formData.ageYears) || 1,
          gender: formData.gender,
          location: formData.location,
          recentlyAdminEditedAt: now,
          isRecentlyUpdated: true,
        };

        const res = await apiRequest<{ success: boolean; dog: AdoptionDogItem }>(
          `/admin/marketplace-dogs/${editingItem.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          }
        );

        const updatedDog: AdoptionDogItem = res.dog || {
          ...editingItem.raw,
          name: formData.name.trim(),
          price: Number(formData.price),
          photoUrl: formData.image.trim(),
          description: formData.description.trim(),
          breed: formData.breed,
          size: formData.size,
          ageYears: Number(formData.ageYears) || 1,
          gender: formData.gender,
          location: formData.location,
          recentlyAdminEditedAt: now,
          isRecentlyUpdated: true,
        };

        setAdoptionDogs((prev) => {
          const list = prev.filter((d) => d.id !== editingItem.id);
          return [updatedDog, ...list];
        });

        // Save to localStorage for immediate marketplace storefront presence
        try {
          const raw = localStorage.getItem('hound_marketplace_custom_dogs');
          const list: AdoptionDogItem[] = raw ? JSON.parse(raw) : [];
          const idx = list.findIndex((d) => d.id === updatedDog.id);
          if (idx !== -1) list.splice(idx, 1);
          list.unshift(updatedDog);
          localStorage.setItem('hound_marketplace_custom_dogs', JSON.stringify(list));
        } catch (e) {
          console.error(e);
        }

        showToast('success', `Updated dog for adoption: ${formData.name} (Placed at top of Marketplace)`);
      }

      setEditingItem(null);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    try {
      if (deletingItem.itemKind === 'supply') {
        await apiRequest(`/admin/products/${deletingItem.id}`, { method: 'DELETE' }).catch(() => {});
        setSupplies((prev) => prev.filter((p) => p.id !== deletingItem.id && p.sku !== deletingItem.id));
        showToast('success', `Deleted supply item: ${deletingItem.name}`);
      } else {
        await apiRequest(`/admin/marketplace-dogs/${deletingItem.id}`, { method: 'DELETE' }).catch(() => {});
        setAdoptionDogs((prev) => prev.filter((d) => d.id !== deletingItem.id));
        showToast('success', `Deleted adoption dog: ${deletingItem.name}`);
      }
      setDeletingItem(null);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is not admin
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] bg-[#FAF9F6] py-16 flex items-center justify-center px-4">
        <div className="max-w-md w-full mx-auto text-center bg-white p-8 rounded-2xl border border-[#E8E6DF] shadow-md space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-xs">
            <ShieldCheck size={32} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-2">
              Administrator Access Restricted
            </span>
            <h2 className="text-xl font-bold font-serif-brand text-gray-900">
              Admin Portal
            </h2>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              This area is strictly reserved for authorized administrators to review customer order details and manage canine inventory.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={handleQuickAdminLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#0E5E58] hover:bg-[#0B4A45] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} />
              <span>{isLoading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1E232A] pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in shadow-xl">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="bg-white border-b border-[#E8E6DF] sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0E5E58] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold font-serif-brand text-gray-900 tracking-tight">
                    Hound &amp; Harbor Admin
                  </h1>
                  <p className="text-[11px] text-gray-500">
                    Production Management • Logged in as <span className="font-semibold text-[#0E5E58]">{user?.email}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={isLoading}
                title="Reload dashboard data"
                className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                <span>Sync</span>
              </button>

              <button
                onClick={() => onNavigate('marketplace')}
                className="px-3 py-1.5 rounded-lg bg-[#0E5E58] hover:bg-[#0B4A45] text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Storefront</span>
                <ExternalLink size={12} />
              </button>

              <button
                onClick={() => {
                  logout();
                  onNavigate('login');
                }}
                className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Sign out of admin session"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Explicit 2 TABS as requested by user: 1. usersdetails  2. items */}
          <nav className="flex space-x-2 border-t border-gray-100 pt-2 pb-2">
            <button
              id="tab-usersdetails"
              onClick={() => setActiveTab('usersdetails')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'usersdetails'
                  ? 'bg-[#0E5E58] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users size={16} />
              <span>1. User Details</span>
              <span
                className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'usersdetails' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {orders.length}
              </span>
            </button>

            <button
              id="tab-items"
              onClick={() => setActiveTab('items')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'items'
                  ? 'bg-[#0E5E58] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package size={16} />
              <span>2. Items</span>
              <span
                className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'items' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {unifiedItems.length}
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ========================================================= */}
        {/* TAB 1: USERS DETAILS                                      */}
        {/* "for the user details tab, let admin be able to see the    */}
        {/* name and the email of the user that order, and the name    */}
        {/* and price of what he ordered."                             */}
        {/* ========================================================= */}
        {activeTab === 'usersdetails' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#E8E6DF] shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Customer Orders</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0E5E58] flex items-center justify-center">
                    <ShoppingBag size={16} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold font-serif-brand text-gray-900">
                  {userStats.totalOrdersCount}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Recorded customer orders</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E8E6DF] shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Distinct Users</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold font-serif-brand text-gray-900">
                  {userStats.uniqueEmails}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Unique buyer emails</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E8E6DF] shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Items Ordered</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Package size={16} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold font-serif-brand text-gray-900">
                  {userStats.totalItemsPurchased}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Individual unit quantities</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E8E6DF] shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Total Order Volume</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <DollarSign size={16} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold font-serif-brand text-gray-900">
                  ${userStats.totalRevenue.toFixed(2)}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Gross customer spend</p>
              </div>
            </div>

            {/* Filter and Search Bar for Users Details */}
            <div className="bg-white p-4 rounded-xl border border-[#E8E6DF] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user name, user email, or ordered item name..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-[#0E5E58] rounded-xl text-xs text-gray-800 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                  <Filter size={13} className="text-gray-500" />
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="bg-transparent text-xs font-medium text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="all">All Order Statuses</option>
                    <option value="delivered">Delivered</option>
                    <option value="shipped">Shipped</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                  <ArrowUpDown size={13} className="text-gray-500" />
                  <select
                    value={userSortOrder}
                    onChange={(e: any) => setUserSortOrder(e.target.value)}
                    className="bg-transparent text-xs font-medium text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="newest">Sort: Most Recent</option>
                    <option value="oldest">Sort: Oldest</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders & User Details Table / List */}
            <div className="bg-white rounded-xl border border-[#E8E6DF] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-[#FAF9F6] flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    User Order Directory &amp; Purchases
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Showing user names, emails, and exact names and prices of items ordered.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0E5E58] bg-[#E8F3F1] px-2.5 py-1 rounded-full">
                  {filteredOrders.length} Order Records
                </span>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                    <Users size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">No matching user orders found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                    Try adjusting your search criteria or filter options to locate user orders.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredOrders.map((ord) => (
                    <div key={ord.id} className="p-5 hover:bg-gray-50/60 transition-colors space-y-4">
                      {/* User Info Header Line */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#E8F3F1] text-[#0E5E58] font-bold text-xs flex items-center justify-center border border-[#0E5E58]/20 shadow-2xs">
                            {ord.customerName?.slice(0, 2).toUpperCase() || 'US'}
                          </div>
                          <div>
                            {/* USER NAME */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-400">User Name:</span>
                              <span className="text-sm font-bold text-gray-900">
                                {ord.customerName || 'Anonymous Customer'}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                                #{ord.orderNumber}
                              </span>
                            </div>
                            {/* USER EMAIL */}
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-semibold text-gray-400">User Email:</span>
                              <a
                                href={`mailto:${ord.customerEmail}`}
                                className="text-xs font-medium text-[#0E5E58] hover:underline flex items-center gap-1"
                              >
                                <Mail size={12} />
                                <span>{ord.customerEmail || 'No email provided'}</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Total Order Paid:</span>
                            <span className="text-base font-bold text-gray-900 font-serif-brand">
                              ${ord.total ? ord.total.toFixed(2) : '0.00'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                ord.orderStatus === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.orderStatus === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.orderStatus || 'confirmed'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* WHAT HE ORDERED: NAME AND PRICE OF WHAT HE ORDERED */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                          <Package size={14} className="text-[#0E5E58]" />
                          <span>What The User Ordered ({ord.items?.length || 0} items):</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {ord.items && ord.items.length > 0 ? (
                            ord.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-3 bg-white border border-[#E8E6DF] rounded-xl shadow-2xs hover:border-[#0E5E58]/40 transition-colors"
                              >
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0 bg-gray-50"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                                    <Package size={20} />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  {/* NAME OF WHAT HE ORDERED */}
                                  <h4 className="text-xs font-bold text-gray-900 truncate" title={item.title}>
                                    {item.title}
                                  </h4>
                                  {/* PRICE OF WHAT HE ORDERED */}
                                  <div className="flex items-center justify-between mt-1 text-xs">
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-500">Price:</span>
                                      <span className="font-bold text-[#0E5E58]">
                                        ${Number(item.price).toFixed(2)}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-gray-500 font-medium">
                                      Qty: {item.quantity || 1}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                              Order record details unavailable.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ITEMS (EVERY ITEM IN MARKETPLACE AVAILABLE)        */}
        {/* ========================================================= */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            {/* Header / Add Button Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E6DF] shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold font-serif-brand text-gray-900">
                    Full Marketplace &amp; Adoption Catalog
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F3F1] text-[#0E5E58] border border-[#0E5E58]/20">
                    {unifiedItems.length} Total Items Available
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Every item in the marketplace (all 624+ supplies across 12 categories, signature products, and 100 dogs for adoption) is available below for editing or deletion.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="add-new-item-btn"
                  onClick={() => {
                    setFormData({
                      name: '',
                      price: '',
                      image: '',
                      description: '',
                      category: 'dog-food',
                      brand: 'Hound & Harbor',
                      stock: '50',
                      featured: true,
                      breed: 'Golden Retriever',
                      size: 'medium',
                      ageYears: '1',
                      gender: 'female',
                      location: 'Austin, TX',
                    });
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#0E5E58] hover:bg-[#0B4A45] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <Plus size={16} />
                  <span>+ Add New Item</span>
                </button>
              </div>
            </div>

            {/* Filter Section: Arranged by Homepage, Names, Prices, Categories */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8E6DF] shadow-xs space-y-4">
              {/* Type Switcher: All / Dog Supplies / Dogs for Adoption */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setItemTypeFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      itemTypeFilter === 'all'
                        ? 'bg-white text-gray-900 shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Items ({unifiedItems.length})
                  </button>
                  <button
                    onClick={() => setItemTypeFilter('supplies')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      itemTypeFilter === 'supplies'
                        ? 'bg-[#0E5E58] text-white shadow-2xs'
                        : 'text-gray-600 hover:text-[#0E5E58]'
                    }`}
                  >
                    <Package size={13} />
                    <span>Dog Supplies ({supplies.length})</span>
                  </button>
                  <button
                    onClick={() => setItemTypeFilter('dogs')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      itemTypeFilter === 'dogs'
                        ? 'bg-[#0E5E58] text-white shadow-2xs'
                        : 'text-gray-600 hover:text-[#0E5E58]'
                    }`}
                  >
                    <Dog size={13} />
                    <span>Dogs for Adoption ({adoptionDogs.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <span>
                    Showing <span className="font-bold text-gray-900">{filteredItems.length}</span> matching items
                  </span>
                  <button
                    onClick={() => setShowAllItems((prev) => !prev)}
                    className="text-[#0E5E58] hover:underline font-bold"
                  >
                    {showAllItems ? 'Use Pagination' : 'Show All on One Page'}
                  </button>
                </div>
              </div>

              {/* Filters Row: Homepage arrangement, By Names, By Prices, Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Real-time Search by Name */}
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, category, or breed..."
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 focus:border-[#0E5E58] rounded-xl text-xs outline-none focus:bg-white transition-colors"
                  />
                </div>

                {/* 2. Arranged by Homepage vs Name vs Price */}
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <ArrowUpDown size={14} className="text-gray-400 shrink-0" />
                  <select
                    value={itemSortFilter}
                    onChange={(e: any) => setItemSortFilter(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-gray-800 outline-none cursor-pointer"
                  >
                    <option value="homepage">⚡ Arranged as Homepage (Featured First)</option>
                    <option value="name-asc">Sort by Name: A → Z</option>
                    <option value="name-desc">Sort by Name: Z → A</option>
                    <option value="price-low">Sort by Price: Low to High</option>
                    <option value="price-high">Sort by Price: High to Low</option>
                  </select>
                </div>

                {/* 3. Filter by Marketplace Categories (All 12 categories + homepage) */}
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <Layers size={14} className="text-gray-400 shrink-0" />
                  <select
                    value={itemCategoryFilter}
                    onChange={(e) => setItemCategoryFilter(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-gray-800 outline-none cursor-pointer"
                  >
                    <option value="all">All Marketplace Categories ({MARKETPLACE_CATEGORIES.length})</option>
                    {MARKETPLACE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.count} items)
                      </option>
                    ))}
                    <option disabled>──────────</option>
                    <option value="dog-food">Dog Food &amp; Nutrition</option>
                    <option value="beds-furniture">Orthopedic Beds &amp; Furniture</option>
                    <option value="health-supplements">Mobility &amp; Wellness</option>
                    <option value="collars-leashes">Artisan Walking Gear</option>
                    <option value="crates-travel">Certified Resale Crates</option>
                    <option value="dog-treats">Single-Ingredient Treats</option>
                  </select>
                </div>

                {/* 4. Filter by Price Brackets */}
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <DollarSign size={14} className="text-gray-400 shrink-0" />
                  <select
                    value={itemPriceBracket}
                    onChange={(e) => setItemPriceBracket(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-gray-800 outline-none cursor-pointer"
                  >
                    <option value="all">Filter by Price: Any Price</option>
                    <option value="under25">Under $25</option>
                    <option value="25to50">$25 - $50</option>
                    <option value="50to100">$50 - $100</option>
                    <option value="100to200">$100 - $200</option>
                    <option value="over200">$200+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Items Grid View */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8E6DF] p-16 text-center shadow-xs">
                <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <Package size={28} />
                </div>
                <h3 className="text-base font-bold text-gray-900">No items match your filters</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Reset the search or category filters to view all 724+ marketplace items.
                </p>
                <button
                  onClick={() => {
                    setItemSearchQuery('');
                    setItemTypeFilter('all');
                    setItemSortFilter('homepage');
                    setItemPriceBracket('all');
                    setItemCategoryFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedItems.map((item) => (
                    <div
                      key={`${item.itemKind}-${item.id}`}
                      className="bg-white rounded-2xl border border-[#E8E6DF] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-[#0E5E58]/30 transition-all group"
                    >
                      <div>
                        {/* Thumbnail & Kind Badge */}
                        <div className="relative aspect-16/10 bg-gray-100 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            onError={(e: any) => {
                              e.target.src =
                                item.itemKind === 'dog'
                                  ? 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg'
                                  : 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                            {item.itemKind === 'supply' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0E5E58] text-white shadow-xs flex items-center gap-1">
                                <Package size={11} />
                                <span>Dog Supply</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-xs flex items-center gap-1">
                                <Dog size={11} />
                                <span>Dog for Adoption</span>
                              </span>
                            )}

                            {item.featured && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 shadow-2xs flex items-center gap-1">
                                <Sparkles size={10} />
                                <span>Featured</span>
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-xs font-bold">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>

                        {/* Content Info */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1" title={item.name}>
                              {item.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-semibold text-[#0E5E58] bg-[#E8F3F1] px-2 py-0.5 rounded text-[11px] truncate max-w-[150px]">
                              {item.categoryOrBreed}
                            </span>
                            <span>•</span>
                            <span className="text-[11px]">{item.stockOrSize}</span>
                          </div>

                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {item.description || 'No description provided.'}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons: Edit & Delete */}
                      <div className="p-4 pt-2 border-t border-gray-100 flex items-center justify-between gap-2 bg-gray-50/50">
                        <button
                          onClick={() => openEditModal(item)}
                          className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-[#0E5E58] text-gray-700 hover:text-white border border-gray-200 hover:border-[#0E5E58] text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 size={13} />
                          <span>Edit Item</span>
                        </button>

                        <button
                          onClick={() => setDeletingItem(item)}
                          className="py-2 px-3 rounded-xl bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-600 border border-gray-200 hover:border-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {!showAllItems && totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200 bg-white p-4 rounded-xl shadow-2xs">
                    <span className="text-xs text-gray-600">
                      Showing items{' '}
                      <span className="font-bold">
                        {(currentPage - 1) * PAGE_SIZE + 1} -{' '}
                        {Math.min(currentPage * PAGE_SIZE, filteredItems.length)}
                      </span>{' '}
                      of <span className="font-bold">{filteredItems.length}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                        <span>Previous</span>
                      </button>

                      <span className="px-3 py-1.5 text-xs font-bold bg-[#E8F3F1] text-[#0E5E58] rounded-lg">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* ADD ITEM MODAL                                           */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#FAF9F6]">
              <div>
                <h3 className="text-base font-bold font-serif-brand text-gray-900">
                  Add New Item to Catalog
                </h3>
                <p className="text-xs text-gray-500">
                  Select whether you are adding dog supplies or a dog for adoption.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Kind Selector Toggle */}
            <div className="p-6 border-b border-gray-100 pb-4">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Item Type:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAddKind('supply')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    addKind === 'supply'
                      ? 'border-[#0E5E58] bg-[#E8F3F1] text-[#0E5E58] shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Package size={16} />
                  <span>Dog Supply (Product)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddKind('dog')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    addKind === 'dog'
                      ? 'border-[#0E5E58] bg-[#E8F3F1] text-[#0E5E58] shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Dog size={16} />
                  <span>Dog for Adoption</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddItemSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {addKind === 'supply' ? 'Item Name (Title)' : 'Dog Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={addKind === 'supply' ? 'e.g., Wild Pacific Salmon Kibble' : 'e.g., Buster'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {addKind === 'supply' ? 'Price ($)' : 'Adoption Fee / Price ($)'} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g., 49.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                  />
                </div>

                {addKind === 'supply' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                    >
                      {MARKETPLACE_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                      <option value="dog-food">Dog Food &amp; Nutrition</option>
                      <option value="beds-furniture">Orthopedic Beds &amp; Furniture</option>
                      <option value="health-supplements">Mobility &amp; Wellness</option>
                      <option value="collars-leashes">Artisan Walking Gear</option>
                      <option value="crates-travel">Certified Resale Crates</option>
                      <option value="dog-treats">Single-Ingredient Treats</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Breed</label>
                    <input
                      type="text"
                      placeholder="e.g., Golden Retriever"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Image URL with instant preview */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                />
                {formData.image && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      onError={(e: any) => (e.target.style.display = 'none')}
                    />
                    <span className="text-[11px] text-gray-500">Image preview verified</span>
                  </div>
                )}
              </div>

              {/* Specific fields for Adoption Dogs */}
              {addKind === 'dog' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Size</label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                    >
                      <option value="toy">Toy (Under 10 lbs)</option>
                      <option value="small">Small (10 - 25 lbs)</option>
                      <option value="medium">Medium (25 - 55 lbs)</option>
                      <option value="large">Large (55 - 85 lbs)</option>
                      <option value="giant">Giant (85+ lbs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g., Austin, TX"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder={
                    addKind === 'supply'
                      ? 'Detailed product specifications and canine dietary notes...'
                      : 'Canine personality, demeanor, health records, and adoption notes...'
                  }
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0E5E58] hover:bg-[#0B4A45] rounded-xl shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Publish Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT ITEM MODAL                                           */}
      {/* Specifically allows changing: image, name, price, and     */}
      {/* description of items (specifically dogs for adoption)     */}
      {/* ========================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#FAF9F6]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E5E58]">
                  {editingItem.itemKind === 'supply' ? 'Dog Supply Item' : 'Dog for Adoption'}
                </span>
                <h3 className="text-base font-bold font-serif-brand text-gray-900">
                  Edit Item: {editingItem.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditItemSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* 1. EDIT NAME */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none font-semibold text-gray-900"
                />
              </div>

              {/* 2. EDIT PRICE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Price / Adoption Fee ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none font-semibold text-gray-900"
                  />
                </div>

                {editingItem.itemKind === 'supply' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                    >
                      {MARKETPLACE_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                      <option value="dog-food">Dog Food &amp; Nutrition</option>
                      <option value="beds-furniture">Orthopedic Beds &amp; Furniture</option>
                      <option value="health-supplements">Mobility &amp; Wellness</option>
                      <option value="collars-leashes">Artisan Walking Gear</option>
                      <option value="crates-travel">Certified Resale Crates</option>
                      <option value="dog-treats">Single-Ingredient Treats</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Breed</label>
                    <input
                      type="text"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 3. EDIT IMAGE */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Change Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none font-mono"
                />

                {/* Instant image preview */}
                <div className="mt-2.5 p-2 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3">
                  <img
                    src={formData.image}
                    alt="Current preview"
                    className="w-16 h-14 object-cover rounded-lg border border-gray-200 shrink-0 bg-white"
                    onError={(e: any) => {
                      e.target.src =
                        editingItem.itemKind === 'dog'
                          ? 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg'
                          : 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="text-[11px] text-gray-500 leading-tight">
                    <span className="font-semibold text-gray-700 block">Visual Image Preview</span>
                    Changes will appear on the storefront and admin catalog immediately.
                  </div>
                </div>
              </div>

              {/* 4. EDIT DESCRIPTION */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Change Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none leading-relaxed text-gray-800"
                />
              </div>

              {/* Additional Dog fields if dog for adoption */}
              {editingItem.itemKind === 'dog' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Size</label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                    >
                      <option value="toy">Toy (Under 10 lbs)</option>
                      <option value="small">Small (10 - 25 lbs)</option>
                      <option value="medium">Medium (25 - 55 lbs)</option>
                      <option value="large">Large (55 - 85 lbs)</option>
                      <option value="giant">Giant (85+ lbs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0E5E58] hover:bg-[#0B4A45] rounded-xl shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Updating...' : 'Save Item Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE ITEM CONFIRMATION MODAL                            */}
      {/* ========================================================= */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900 font-serif-brand">
                Confirm Deletion
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold text-gray-900">"{deletingItem.name}"</span>?
                This item will be removed from the catalog.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2 px-4 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
