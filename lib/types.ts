export type NavLink = { label: string; href: string };

export type SocialLink = {
  label: string;
  href: string;
  platform: "linkedin" | "figma" | "behance" | "dribbble" | "instagram" | "x";
};

export type Service = {
  id: string;
  number: string;
  title: string;
  description: string;
  shape: string;
  shapeAlt: string;
  rotate?: number;
};

export type StackItem = { id: string; name: string; description: string };

export type ProjectBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "code"; code: string; language?: string }
  | { type: "divider" };

export type Project = {
  slug: string;
  title: string;
  category: string;
  client: string;
  duration: string;
  image: string;
  gallery: string[];
  heroBackground?: string;
  heroLayout?: "full" | "container";
  previewHref: string;
  ctaHref: string;
  ctaLabel: string;
  summary: string;
  content: ProjectBlock[];
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  titleAccent?: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  author: string;
  readingTime: string;
  date: string;
  dateISO: string;
  image: string;
  imageAlt: string;
};

export type BlogCategory = { id: string; label: string };

export type ExperienceItem = {
  id: string;
  duration: string;
  position: string;
  company: string;
  description: string;
  hoverImage: string;
  hoverImageAlt: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

export type PricingPlan = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  featured?: boolean;
  features: string[];
};

export type FooterContent = {
  title: string;
  description: string;
  image: { src: string; alt: string };
  contact: {
    phone: string;
    phoneHref: string;
    email: string;
    emailHref: string;
  };
  navLinks: NavLink[];
  socialLinks: { label: string; href: string; icon: "instagram" | "linkedin" | "x" }[];
  copyright: string;
};

export type SiteContent = {
  site: { title: string; description: string };
  hero: {
    greeting: string;
    name: string;
    marqueeName: string;
    profileImage: string;
    profileAlt: string;
    ctaText: string;
    ctaHref: string;
  };
  about: { heading: string; text: string };
  navLinks: NavLink[];
  skills: string[];
  socialLinks: SocialLink[];
  stack: StackItem[];
  services: Service[];
  projects: Project[];
  blogPosts: BlogPost[];
  blogCategories: BlogCategory[];
  experience: { cvHref: string; items: ExperienceItem[] };
  testimonials: Testimonial[];
  footer: FooterContent;
  pricingPlans: PricingPlan[];
};

export type ContentSection = keyof SiteContent;
