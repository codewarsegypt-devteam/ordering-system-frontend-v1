import {
  QrCode,
  Monitor,
  ClipboardList,
  MapPin,
  Layers,
  Coins,
  BarChart3,
  Users,
  ShieldCheck,
} from "lucide-react";

export const STATS = [
  { value: "∞", label: "Menus & items" },
  { value: "QR", label: "Per-table codes" },
  { value: "Live", label: "Order tracking" },
  { value: "Multi", label: "Currency display" },
];

export const FEATURES = [
  {
    icon: QrCode,
    title: "QR Ordering",
    description:
      "Guests scan and order instantly - zero app downloads, zero friction.",
  },
  {
    icon: Monitor,
    title: "Real-time Kitchen Display",
    description:
      "Orders flash on screen the moment they're placed. WebSocket-powered, no refresh.",
  },
  {
    icon: ClipboardList,
    title: "Smart Table Sessions",
    description:
      "Track every order per table. Cashiers see running totals and close bills with one tap.",
  },
  {
    icon: MapPin,
    title: "Multi-Branch Support",
    description:
      "Manage menus, staff, and analytics across your locations from one dashboard.",
  },
  {
    icon: Layers,
    title: "Customizable Menu",
    description:
      "Build menus with categories, variants, and modifiers. Update prices in real time.",
  },
  {
    icon: Coins,
    title: "Multi-Currency",
    description:
      "Show prices in your customers' preferred currency. Perfect for tourist-heavy areas.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Track revenue, popular items, peak hours, and order trends with clear charts.",
  },
  {
    icon: Users,
    title: "Role-based Access",
    description:
      "Owner, manager, cashier, kitchen - everyone sees only what they need.",
  },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create your account",
    description:
      "Sign up with a username and restaurant name. No credit card needed.",
  },
  {
    step: "02",
    title: "Build your menu",
    description:
      "Add categories, items, variants and modifiers. Upload photos and set prices.",
  },
  {
    step: "03",
    title: "Set up branches & tables",
    description:
      "Add your location, create tables, and download the per-table QR codes.",
  },
  {
    step: "04",
    title: "Guests scan & order",
    description:
      "Customers scan the QR, browse the menu on their phone, and place orders.",
  },
  {
    step: "05",
    title: "Manage from dashboard",
    description:
      "Accept, prepare, and complete orders in real time from the staff dashboard.",
  },
];

export const PLANS = [
  {
    name: "Starter",
    price: "$10",
    period: "mo",
    description: "Perfect for single-location cafes and small restaurants.",
    features: [
      "1 branch",
      "Up to 50 menu items",
      "QR ordering",
      "Kitchen display",
      "Basic analytics",
      "Email support",
    ],
    cta: "Get Started",
    ctaHref: "/signup",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$20",
    period: "mo",
    description: "For growing restaurants with multiple branches.",
    features: [
      "Up to 5 branches",
      "Unlimited menu items",
      "Multi-currency support",
      "Advanced analytics",
      "Role management",
      "Priority support",
      "Custom branding",
    ],
    cta: "Get Started",
    ctaHref: "/signup",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored for large chains and franchises.",
    features: [
      "Unlimited branches",
      "Dedicated account manager",
      "API access",
      "Custom integrations",
      "Custom branding",
      "Unlimited menu items",
      // "SLA guarantee",
      // "On-premise option",
      "24/7 phone support",
    ],
    cta: "Contact Sales",
    ctaHref: "/signup",
    highlighted: false,
  },
];

export const TESTIMONIALS = [
  {
    name: "Ahmed K.",
    role: "Café owner, Cairo",
    quote:
      "We went from paper menus to full QR ordering in one afternoon. The dashboard is intuitive and our staff picked it up immediately.",
    avatar: "A",
  },
  {
    name: "Sara M.",
    role: "Restaurant manager, Alexandria",
    quote:
      "The multi-branch setup means I can monitor all three locations from one account. Game-changer for us.",
    avatar: "S",
  },
  {
    name: "Omar N.",
    role: "Food court operator",
    quote:
      "Modifier groups and variants saved us so much confusion. Customers can customise their order exactly the way they want.",
    avatar: "O",
  },
];
