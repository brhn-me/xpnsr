import {
    // Income (8)
    Wallet, DollarSign, Briefcase, TrendingUp, CreditCard,
    Banknote, PiggyBank, Building2,

    // Housing & Bills (8)
    Home, Zap, Droplet, Wifi, Smartphone,
    Tv, Armchair, Wrench,

    // Food & Drink (4)
    Utensils, Coffee, ShoppingCart, Apple,

    // Transport (5)
    Car, Bus, Train, Plane, Fuel,

    // Personal & Health (7)
    User, Shirt, Scissors, Pill, Dumbbell,
    Heart, GraduationCap,

    // Misc & Entertainment (8)
    Gift, Music, Gamepad, Camera, Headphones,
    PawPrint, Baby, Globe
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
    // Income
    'wallet': Wallet,
    'dollar-sign': DollarSign,
    'briefcase': Briefcase,
    'trending-up': TrendingUp,
    'credit-card': CreditCard,
    'banknote': Banknote,
    'piggy-bank': PiggyBank,
    'building': Building2,

    // Housing
    'home': Home,
    'zap': Zap,
    'droplet': Droplet,
    'wifi': Wifi,
    'smartphone': Smartphone,
    'tv': Tv,
    'armchair': Armchair,
    'wrench': Wrench,

    // Food
    'utensils': Utensils,
    'coffee': Coffee,
    'shopping-cart': ShoppingCart,
    'apple': Apple,

    // Transport
    'car': Car,
    'bus': Bus,
    'train': Train,
    'plane': Plane,
    'fuel': Fuel,

    // Personal
    'user': User,
    'shirt': Shirt,
    'scissors': Scissors,
    'pill': Pill,
    'dumbbell': Dumbbell,
    'heart': Heart,
    'graduation-cap': GraduationCap,

    // Misc
    'gift': Gift,
    'music': Music,
    'gamepad': Gamepad,
    'camera': Camera,
    'headphones': Headphones,
    'paw-print': PawPrint,
    'baby': Baby,
    'globe': Globe
};

export const ICONS_LIST = Object.keys(ICON_MAP);

export const DEFAULT_ICON = ShoppingCart;

export const getIconComponent = (iconName?: string): LucideIcon => {
    if (iconName && ICON_MAP[iconName]) {
        return ICON_MAP[iconName];
    }
    return DEFAULT_ICON;
};
