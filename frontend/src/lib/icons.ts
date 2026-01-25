import {
    // Row 1-2: Finance & Commerce
    Wallet, DollarSign, Briefcase, TrendingUp, TrendingDown, CreditCard, Banknote, PiggyBank, Coins, Bitcoin, Landmark, HandCoins,
    Calculator, Receipt, ReceiptText, Percent, Scale, Tag, Gavel, Handshake, Euro, PoundSterling, Vault, ShoppingCart,

    // Row 3-4: Housing & Utilities
    Home, Zap, Flame, Droplet, Wifi, Smartphone, Tv, Armchair, Wrench, Key, Lock, ShieldCheck,
    Building, Building2, Hotel, Warehouse, Factory, Construction, Hammer, Bed, ShowerHead, Refrigerator, Microwave, WashingMachine,

    // Row 5-6: Food & Drink
    Apple, ChefHat, Utensils, UtensilsCrossed, Coffee, Pizza, Beer, Wine, Cookie, IceCream, Cake, Soup,
    Popcorn, GlassWater, Sandwich, Drumstick, Candy, Lollipop, Cigarette, Camera, Music, Gamepad, Headphones, Video,
    Hamburger, // Added

    // Row 7-8: Life & Social
    Radio, Trophy, Award, Ticket, Repeat, Gift, PartyPopper, Dices, Heart, HeartPulse, User,
    Baby, Shirt, Scissors, Pill, Dumbbell, GraduationCap, Hospital, Stethoscope, BriefcaseMedical, Brain, Syringe, Thermometer, Footprints, Shield, CookingPot, // Added Sneaker,

    // Row 9-10: Education & Nature
    Microscope, Telescope, Library, Book, BookOpen, Globe, Compass, MapPin, Map, Sun, Moon, Cloud,
    Umbrella, Leaf, Sprout, Flower, TreeDeciduous, TreePine, Palmtree, Waves, Mountain, MountainSnow, Trees, Cat,

    // Row 11-12: Animals, Travel & Transport
    Dog, Bird, Fish, Car, Bus, Train, Plane, Fuel, Tent, Anchor,
    LifeBuoy, Pencil, Bike, Scooter, Truck, Rocket, Binoculars, Luggage, Brush, PenTool, Shovel, Clock, Joystick, Laptop,
    ChessKnight, IdCard // Added
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
    // Row 1
    'wallet': Wallet, 'dollar': DollarSign, 'job': Briefcase, 'growth': TrendingUp,
    'loss': TrendingDown, 'card': CreditCard, 'cash': Banknote, 'savings': PiggyBank,
    'coins': Coins, 'crypto': Bitcoin, 'bank': Landmark, 'income': HandCoins,

    // Row 2
    'calc': Calculator, 'bill': Receipt, 'invoice': ReceiptText, 'tax': Percent,
    'legal': Scale, 'sale': Tag, 'court': Gavel, 'deal': Handshake,
    'euro': Euro, 'pound': PoundSterling, 'safety': Vault, 'cart': ShoppingCart,

    // Row 3
    'home': Home, 'energy': Zap, 'gas': Flame, 'water': Droplet,
    'wifi': Wifi, 'phone': Smartphone, 'tv': Tv, 'furniture': Armchair,
    'repair': Wrench, 'key': Key, 'security': Lock, 'protection': ShieldCheck, 'shield': Shield, 'laptop': Laptop, // Added

    // Row 4
    'building': Building, 'office': Building2, 'travel': Hotel, 'storage': Warehouse,
    'industry': Factory, 'project': Construction, 'tools': Hammer, 'sleep': Bed, 'bed': Bed, // Added alias
    'bath': ShowerHead, 'kitchen': Refrigerator, 'cooking': Microwave, 'cleaning': WashingMachine, 'cooking-pot': CookingPot, // Added

    // Row 5
    'grocery': Apple, 'chef': ChefHat, 'dine': Utensils, 'restaurant': UtensilsCrossed,
    'coffee': Coffee, 'pizza': Pizza, 'beer': Beer, 'wine': Wine,
    'snack': Cookie, 'dessert': IceCream, 'celebration': Cake, 'meal': Soup,

    // Row 6
    'cinema': Popcorn, 'drink': GlassWater, 'lunch': Sandwich, 'sandwich': Sandwich, 'poultry': Drumstick,
    'sweets': Candy, 'treat': Lollipop, 'smoking': Cigarette, 'photography': Camera,
    'music': Music, 'gaming': Gamepad, 'audio': Headphones, 'movie': Video, 'burger': Hamburger,

    // Row 7
    'news': Radio, 'win': Trophy, 'achievement': Award,
    'event': Ticket, 'recurring': Repeat, 'gift': Gift, 'party': PartyPopper,
    'gambling': Dices, 'health': Heart, 'vital': HeartPulse, 'profile': User,

    // Row 8
    'family': Baby, 'clothed': Shirt, 'grooming': Scissors, 'meds': Pill, 'shoe': Footprints, 'sneaker': Footprints, // Added
    'gym': Dumbbell, 'study': GraduationCap, 'medical': Hospital, 'hospital': Hospital, 'sports': ChessKnight, // Added
    'checkup': Stethoscope, 'stethoscope': Stethoscope,
    'firstaid': BriefcaseMedical, 'brain': Brain, 'injection': Syringe, 'temp': Thermometer,
    'shield-user': ShieldCheck, 'joystick': Joystick, 'passport': IdCard, // Added

    // Row 9
    'science': Microscope, 'stargaze': Telescope, 'knowledge': Library, 'reading': Book,
    'learning': BookOpen, 'world': Globe, 'adventure': Compass, 'location': MapPin,
    'navigation': Map, 'weather': Sun, 'night': Moon, 'cloudy': Cloud,

    // Row 10
    'rainy': Umbrella, 'nature': Leaf, 'ecology': Sprout, 'garden': Flower,
    'forest': TreeDeciduous, 'park': TreePine, 'beach': Palmtree, 'ocean': Waves,
    'climb': Mountain, 'resort': MountainSnow, 'hills': Trees, 'meow': Cat,

    // Row 11
    'puppy': Dog, 'wildlife': Bird, 'seafood': Fish,
    'driving': Car, 'public-transport': Bus, 'railway': Train,
    'flight': Plane, 'refuel': Fuel, 'camping': Tent, 'marina': Anchor,

    // Row 12
    'sailing': LifeBuoy, 'writing': Pencil, 'cycling': Bike, 'commute': Scooter,
    'shipping': Truck, 'launch': Rocket, 'sightseeing': Binoculars, 'vacation': Luggage,
    'art': Brush, 'brush': Brush, 'design': PenTool, 'landscaping': Shovel, 'reminder': Clock
};

export const ICONS_LIST = Object.keys(ICON_MAP);

export const DEFAULT_ICON = ShoppingCart;

export const getIconComponent = (iconName?: string): LucideIcon => {
    if (iconName && ICON_MAP[iconName]) {
        return ICON_MAP[iconName];
    }
    return DEFAULT_ICON;
};
