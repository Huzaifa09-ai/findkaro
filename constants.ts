
import { Store, Product, Order, Plan } from './types';

export const COLORS = {
  primary: '#0047AB', 
  secondary: '#FF9F1C', 
  merchant: '#01411C', 
  success: '#10B981',
  danger: '#EF4444',
  background: '#F8FAFC',
};

export const PLANS: Plan[] = [
  { id: 'FREE', name: 'Basic', price: '0', features: ['50 Listings'], color: '#94A3B8' },
  { id: 'BASIC', name: 'Starter', price: '1500', features: ['200 Listings'], color: '#0047AB' },
  { id: 'PRO', name: 'Grower', price: '3500', features: ['Unlimited'], color: '#FF9F1C' },
  { id: 'ELITE', name: 'Elite', price: '7500', features: ['Automation'], color: '#01411C' }
];

export const PK_CITIES: Record<string, string[]> = {
  "Karachi": ["Clifton", "DHA", "Gulshan", "Malir"],
  "Lahore": ["Gulberg", "DHA", "Johar Town", "Model Town"],
  "Islamabad": ["F-6", "F-7", "G-11", "I-8"],
};

export const CURRENCY = 'PKR';
export const SUPPORT_NUMBER = '03290144760';
export const ADMIN_EMAIL = 'Huzifawork.099@gmail.com';
export const ADMIN_PASSWORD = '01';

// Comprehensive Grocery Library
export const GLOBAL_ITEM_LIBRARY: Record<string, any[]> = {
  'Grocery': [
    // 🌾 Grains, Flour & Rice
    { name: 'Wheat Flour Chakki (10kg)', price: 1450, category: 'Grains, Flour & Rice', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', icon: '🌾' },
    { name: 'Wheat Flour Fine (10kg)', price: 1550, category: 'Grains, Flour & Rice', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', icon: '🌾' },
    { name: 'Super Kernel Basmati (5kg)', price: 1950, category: 'Grains, Flour & Rice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', icon: '🍚' },
    { name: 'Brown Rice (1kg)', price: 450, category: 'Grains, Flour & Rice', image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400', icon: '🍚' },
    { name: 'Sella Rice (1kg)', price: 380, category: 'Grains, Flour & Rice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', icon: '🍚' },
    { name: 'Irri-6 Rice (1kg)', price: 220, category: 'Grains, Flour & Rice', image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400', icon: '🍚' },
    { name: 'Semolina (Suji) 1kg', price: 180, category: 'Grains, Flour & Rice', image: 'https://images.unsplash.com/photo-1505253304499-671c55fb57fe?w=400', icon: '🥣' },
    { name: 'Vermicelli (Seviyan)', price: 120, category: 'Grains, Flour & Rice', image: 'https://images.unsplash.com/photo-1614735241165-d944e194aa0a?w=400', icon: '🍝' },
    { name: 'Barley (Jau)', price: 210, category: 'Grains, Flour & Rice', image: 'https://images.unsplash.com/photo-1532296078045-0d1964f4340c?w=400', icon: '🌾' },
    { name: 'Oats (Rolled)', price: 550, category: 'Grains, Flour & Rice', image: 'https://images.unsplash.com/photo-1583115482441-4828560d0144?w=400', icon: '🥣' },

    // 🫘 Pulses & Beans
    { name: 'Daal Moong Washed (1kg)', price: 320, category: 'Pulses & Beans', image: 'https://images.unsplash.com/photo-1585994192627-210134a6258f?w=400', icon: '🫘' },
    { name: 'Daal Moong Whole (1kg)', price: 300, category: 'Pulses & Beans', image: 'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?w=400', icon: '🫘' },
    { name: 'Daal Mash (1kg)', price: 450, category: 'Pulses & Beans', image: 'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?w=400', icon: '🫘' },
    { name: 'Daal Arhar (Toor) (1kg)', price: 380, category: 'Pulses & Beans', image: 'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?w=400', icon: '🫘' },
    { name: 'Red Kidney Beans (1kg)', price: 310, category: 'Pulses & Beans', image: 'https://images.unsplash.com/photo-1551462147-37885abb3e4a?w=400', icon: '🫘' },
    { name: 'Chickpeas White (1kg)', price: 340, category: 'Pulses & Beans', image: 'https://images.unsplash.com/photo-1547825407-2d060104b7f8?w=400', icon: '🫘' },
    { name: 'Chickpeas Black (1kg)', price: 290, category: 'Pulses & Beans', image: 'https://images.unsplash.com/photo-1547825407-2d060104b7f8?w=400', icon: '🫘' },

    // 🧂 Spices & Masala
    { name: 'Garam Masala (100g)', price: 160, category: 'Spices & Masala', image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400', icon: '🧂' },
    { name: 'Chat Masala (Pack)', price: 110, category: 'Spices & Masala', image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400', icon: '🍛' },
    { name: 'Biryani Masala (Pack)', price: 125, category: 'Spices & Masala', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', icon: '🍛' },
    { name: 'Tikka Masala (Pack)', price: 125, category: 'Spices & Masala', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', icon: '🍗' },
    { name: 'Red Chili Powder (200g)', price: 220, category: 'Spices & Masala', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', icon: '🌶️' },
    { name: 'Turmeric Powder (200g)', price: 140, category: 'Spices & Masala', image: 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?w=400', icon: '🧪' },
    { name: 'Ajwain Seeds (100g)', price: 90, category: 'Spices & Masala', image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400', icon: '🧂' },

    // 🛢️ Cooking Oils & Fats
    { name: 'Canola Oil (1L)', price: 620, category: 'Cooking Oils & Fats', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', icon: '🛢️' },
    { name: 'Olive Oil Extra Virgin (500ml)', price: 1250, category: 'Cooking Oils & Fats', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', icon: '🫒' },
    { name: 'Desi Ghee (1kg)', price: 1950, category: 'Cooking Oils & Fats', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', icon: '🧈' },
    { name: 'Vanaspati Ghee (1kg)', price: 695, category: 'Cooking Oils & Fats', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', icon: '🧈' },

    // 🥛 Dairy & Eggs
    { name: 'Fresh Milk (1L)', price: 290, category: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1563636619-e9107da5a1bb?w=400', icon: '🥛' },
    { name: 'Powdered Milk (Pack)', price: 850, category: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1563636619-e9107da5a1bb?w=400', icon: '🥛' },
    { name: 'Fresh Yogurt (1kg)', price: 270, category: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', icon: '🍦' },
    { name: 'Farm Eggs (Dozen)', price: 345, category: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1582722872445-44ad5c7864bc?w=400', icon: '🥚' },
    { name: 'Desi Eggs (Dozen)', price: 480, category: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1582722872445-44ad5c7864bc?w=400', icon: '🥚' },
    { name: 'Mozzarella Cheese (200g)', price: 550, category: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1485962391905-dc37bb36024a?w=400', icon: '🧀' },

    // 🍞 Bakery & Bread
    { name: 'White Bread (Large)', price: 195, category: 'Bakery & Bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', icon: '🍞' },
    { name: 'Brown Bread (Large)', price: 210, category: 'Bakery & Bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', icon: '🍞' },
    { name: 'Rusk Elaichi (Pack)', price: 140, category: 'Bakery & Bread', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', icon: '🥖' },
    { name: 'Cake Rusk (Large)', price: 280, category: 'Bakery & Bread', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', icon: '🥖' },

    // 🍪 Biscuits & Snacks
    { name: 'Sooper Biscuits (12 pack)', price: 200, category: 'Biscuits & Snacks', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', icon: '🍪' },
    { name: 'Oreo Biscuits (Large)', price: 160, category: 'Biscuits & Snacks', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', icon: '🍪' },
    { name: 'Nimko Mix (250g)', price: 185, category: 'Biscuits & Snacks', image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400', icon: '🥡' },
    { name: 'Potato Chips Plain', price: 130, category: 'Biscuits & Snacks', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', icon: '🍟' },
    { name: 'Kurkure (Large)', price: 100, category: 'Biscuits & Snacks', image: 'https://images.unsplash.com/photo-1600611417594-e81622f9862d?w=400', icon: '🥡' }
  ]
};

export const MOCK_STORES: Store[] = [];
export const MOCK_PRODUCTS: Product[] = [];

export const SOUND_URLS = {
  tap: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', 
  error: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
  notify: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  ambient: 'https://assets.mixkit.co/active_storage/sfx/123/ambient-background.mp3' // Placeholder
};
