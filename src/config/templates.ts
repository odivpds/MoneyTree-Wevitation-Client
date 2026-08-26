export type TemplateType = 'react' | 'html' | 'html-js';

export interface TemplateConfig {
  id: string;
  slug?: string;
  name: string;
  type: TemplateType;
  category: string;
  desc: string;
  price: string;
  image: string;
  badge?: string;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: "uuid-template-1",
    slug: "tirta-empul-classic",
    name: "Tirta Empul Classic",
    type: "react",
    category: "Premium",
    desc: "Desain elegan dengan nuansa ukiran kayu Bali klasik dan palet warna emas kehitaman. Sangat cocok untuk tema pernikahan sakral.",
    price: "Rp 250.000",
    image: "/images/templates/agung.png", // Fallback image if real one missing
    badge: "Terlaris"
  },
  {
    id: "uuid-template-2",
    slug: "ubud-minimalist",
    name: "Ubud Minimalist",
    type: "html-js",
    category: "Basic",
    desc: "Tampilan modern, bersih, dan minimalis. Menonjolkan tipografi yang rapi dengan sentuhan ornamen daun tropis.",
    price: "Gratis",
    image: "/images/templates/dewi.png",
    badge: "Gratis"
  },
  {
    id: "uuid-template-3",
    slug: "uluwatu-sunset",
    name: "Uluwatu Sunset",
    type: "react",
    category: "Exclusive",
    desc: "Animasi premium dengan transisi halus ala cinematic. Menggunakan palet warna hangat seperti matahari terbenam di tebing Uluwatu.",
    price: "Rp 500.000",
    image: "/images/templates/agung.png",
    badge: "Eksklusif"
  },
  {
    id: "uuid-template-4",
    slug: "sekar-jepun",
    name: "Sekar Jepun",
    type: "html",
    category: "Basic",
    desc: "Desain manis dengan ilustrasi bunga kamboja (jepun) di setiap sudut halaman. Sederhana namun sangat menawan.",
    price: "Rp 150.000",
    image: "/images/templates/dewi.png"
  },
  {
    id: "uuid-template-5",
    slug: "seminyak-chic",
    name: "Seminyak Chic",
    type: "react",
    category: "Premium",
    desc: "Cocok untuk pernikahan bergaya internasional dengan venue beach club atau outdoor. Tampilan responsif dan sangat interaktif.",
    price: "Rp 350.000",
    image: "/images/templates/agung.png",
    badge: "Populer"
  }
];
