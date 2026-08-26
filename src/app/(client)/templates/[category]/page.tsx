"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TEMPLATES } from "@/config/templates";

export default function CategoryTemplatesPage() {
  const params = useParams();
  const rawCategory = params?.category;
  const currentCategory = (typeof rawCategory === 'string' ? rawCategory.toLowerCase() : 'semua');

  const [searchQuery, setSearchQuery] = useState("");
  const [templatesData, setTemplatesData] = useState(TEMPLATES);
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const handleSelectTemplate = (templateId: string) => {
    const targetUrl = `/setup?template=${templateId}`;

    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal-stagger');
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [templatesData, categories]);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTemplatesData(data);
        }
      })
      .catch(err => {
        console.warn('Gagal memuat template dari CMS, menggunakan config lokal:', err.message || err);
      });

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(err => console.error('Failed to load categories', err));
  }, []);

  const filteredTemplates = useMemo(() => {
    return templatesData.filter(tpl => {
      const matchCategory = currentCategory === "semua" || (tpl.category && tpl.category.toLowerCase() === currentCategory);
      const matchSearch = !searchQuery || tpl.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [currentCategory, searchQuery, templatesData]);

  const categoryName = useMemo(() => {
    if (currentCategory === 'semua') return 'Semua Kelas';
    const found = categories.find(c => c.slug.toLowerCase() === currentCategory);
    return found ? found.name : currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
  }, [currentCategory, categories]);

  return (
    <>
      {/* ===== PAGE HEADER ===== */}
      <section className="section bali-pattern-bg bali-corners" style={{ paddingTop: '140px' }}>
        <div className="container text-center">
          <span className="section-label reveal">Koleksi Desain</span>
          <h1 className="section-title reveal" style={{ fontSize: 'var(--text-5xl)' }}>Koleksi Desain {categoryName}</h1>
          <p className="section-subtitle reveal">
            Pilih template undangan pernikahan Bali yang sempurna untuk hari istimewa Anda.
          </p>

          {/* Search Bar */}
          <div className="search-bar reveal" style={{ marginTop: 'var(--space-8)' }}>
            <span className="search-bar__icon">🔍</span>
            <input
              type="text"
              className="search-bar__input"
              placeholder="Cari template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ===== TEMPLATE GRID ===== */}
      <section className="section--sm">
        <div className="container">
          <div className="template-grid reveal-stagger">
            {filteredTemplates.map((tpl) => (
              <div key={tpl.id} className="template-card shimmer-border" style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
                <div className="template-card__image">
                  <img src={tpl.image} alt={`Template ${tpl.name}`} loading="lazy" />
                  {tpl.badge && (
                    <span className="template-card__badge" style={tpl.badge === 'Gratis' ? { background: 'linear-gradient(135deg, #2ecc71, #27ae60)' } : {}}>
                      {tpl.badge}
                    </span>
                  )}
                  {/* <div className="template-card__overlay">
                    <button onClick={() => handleSelectTemplate(tpl.id)} className="btn btn--primary">Pilih Template Ini</button>
                  </div> */}
                </div>
                <div className="template-card__body">
                  <h3 className="template-card__name">{tpl.name}</h3>
                  <p className="template-card__desc">{tpl.desc}</p>
                  <div className="template-card__footer">
                    <span className="template-card__price">
                      {tpl.price === 'Gratis' ? <span className="free" style={{ color: 'var(--success)' }}>Gratis</span> : tpl.price}
                    </span>
                    <button onClick={() => handleSelectTemplate(tpl.id)} className="btn btn--secondary btn--sm">Pilih →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center" style={{ padding: 'var(--space-20) 0' }}>
              <p style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🔍</p>
              <h3 style={{ marginBottom: 'var(--space-2)' }}>Template Tidak Ditemukan</h3>
              <p className="text-muted">Kategori ini belum memiliki template aktif.</p>
              <button
                className="btn btn--secondary"
                style={{ marginTop: 'var(--space-6)' }}
                onClick={() => router.push('/templates')}
              >
                Lihat Semua Template
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
