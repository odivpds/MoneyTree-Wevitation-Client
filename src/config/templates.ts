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
    id: "agung",
    name: "Agung",
    type: "react",
    category: "tradisional",
    desc: "Candi Bentar emas megah dengan ornamen ukiran Bali tradisional dan bunga frangipani. Desain klasik yang anggun.",
    price: "Rp 350.000",
    image: "/images/templates/agung.png",
    badge: "Populer"
  },
  {
    id: "dewi",
    name: "Dewi",
    type: "react",
    category: "tradisional",
    desc: "Nuansa pura suci dengan sentuhan kain poleng dan ukiran kayu jati. Sakral dan penuh makna.",
    price: "Rp 250.000",
    image: "/images/templates/dewi.png"
  },
  {
    id: "demo-html",
    name: "Pure HTML Demo",
    type: "html",
    category: "minimalis",
    desc: "Contoh template menggunakan Vanilla HTML dan CSS buatan tim yang dipanggil melalui Adapter khusus.",
    price: "Gratis",
    image: "/images/templates/dewi.png",
    badge: "HTML"
  }
];
