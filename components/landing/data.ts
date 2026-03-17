import {
  QrCode,
  LayoutDashboard,
  MapPin,
  Coins,
  Layers,
  ClipboardList,
  Users,
  Zap,
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
    title: "QR code ordering",
    description:
      "Guests scan a table QR, browse your menu, and order from their phone. Zero app download—just a link.",
    badge: "Core",
  },
  {
    icon: LayoutDashboard,
    title: "Staff dashboard",
    description:
      "Manage menus, orders, branches and team from one place. Real-time flow from placed to completed.",
    badge: "Core",
  },
  {
    icon: MapPin,
    title: "Multi-branch & tables",
    description:
      "Add multiple locations and tables. Every table gets its own QR code so orders are always tied to the right seat.",
    badge: "Core",
  },
  {
    icon: Coins,
    title: "Multi-currency display",
    description:
      "Set a base currency and let guests view prices in their preferred currency. No duplicate menus needed.",
    badge: "Pro",
  },
  {
    icon: Layers,
    title: "Modifiers & variants",
    description:
      "Sizes, add-ons, extras. Attach modifier groups to items and enforce min/max selection rules.",
    badge: "Core",
  },
  {
    icon: ClipboardList,
    title: "Orders & table services",
    description:
      "Track orders in real time. Let guests call the waiter or request the bill straight from the menu.",
    badge: "Core",
  },
  {
    icon: Users,
    title: "Role-based access",
    description:
      "Owner, manager, cashier, kitchen—each role sees exactly what they need and nothing they don't.",
    badge: "Core",
  },
  {
    icon: Zap,
    title: "Instant setup",
    description:
      "Create your account, set up a menu, and print QR codes in under 10 minutes. No hardware required.",
    badge: "Core",
  },
  {
    icon: ShieldCheck,
    title: "Secure & reliable",
    description:
      "JWT-based auth, token-scoped QR sessions, and hosted on production-grade infrastructure.",
    badge: "Core",
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
    price: "Free",
    period: "forever",
    description: "Everything you need to run QR ordering for one venue.",
    features: [
      "1 branch",
      "Unlimited menus & items",
      "QR codes per table",
      "Live order dashboard",
      "Multi-currency display",
      "Modifier groups",
      "Role-based access",
    ],
    cta: "Start for free",
    ctaHref: "#signup",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "Coming soon",
    period: "",
    description: "For growing restaurants with multiple locations.",
    features: [
      "Unlimited branches",
      "Advanced analytics",
      "Priority support",
      "Custom domain menu",
      "Loyalty & promotions",
      "API access",
    ],
    cta: "Notify me",
    ctaHref: null,
    highlighted: true,
    badge: "Most popular",
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
