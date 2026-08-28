"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TEMPLATES } from "@/config/templates";
import { Loader2 } from "lucide-react";

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [templatesData, setTemplatesData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    // Fetch templates
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTemplatesData(data);
        }
      })
      .catch(err => {
        console.warn('Gagal memuat template dari CMS, menggunakan config lokal:', err.message || err);
        setTemplatesData(TEMPLATES);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(err => console.error('Failed to load categories', err));
  }, []);

  const PRIORITY_ORDER = ["Basic", "Premium", "Exclusive"];

  const groupedTemplates = useMemo(() => {
    const filtered = templatesData.filter(tpl =>
      !searchQuery || tpl.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // If there are specific DB categories, use them to structure the groups
    // Otherwise fallback to extracting unique categories from templates
    let categoryGroups: { id: string, name: string, slug: string, templates: any[] }[] = [];

    if (categories.length > 0) {
      categoryGroups = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        templates: filtered.filter(tpl => tpl.category === cat.name)
      }));
    } else {
      // Fallback: extract unique categories from templates data
      const uniqueCats = Array.from(new Set(filtered.map(t => t.category || 'Belum Berkategori')));
      categoryGroups = uniqueCats.map(catName => ({
        id: catName,
        name: catName,
        slug: catName.toLowerCase().replace(/\s+/g, '-'),
        templates: filtered.filter(tpl => (tpl.category || 'Belum Berkategori') === catName)
      }));
    }

    // Sort categories based on priority order
    categoryGroups.sort((a, b) => {
      const indexA = PRIORITY_ORDER.indexOf(a.name);
      const indexB = PRIORITY_ORDER.indexOf(b.name);
      const weightA = indexA === -1 ? 99 : indexA;
      const weightB = indexB === -1 ? 99 : indexB;
      return weightA - weightB;
    });

    return categoryGroups.filter(g => g.templates.length > 0);
  }, [searchQuery, templatesData, categories]);

  return (
    <>
      {/* ===== PAGE HEADER ===== */}
      <section className="section bali-pattern-bg bali-corners" style={{ paddingTop: '140px' }}>
        <div className="container text-center">
          <span className="section-label reveal">Koleksi Desain</span>
          <h1 className="section-title reveal" style={{ fontSize: 'var(--text-5xl)' }}>Galeri Template</h1>
          <p className="section-subtitle reveal">
            Pilih template undangan pernikahan Bali yang sempurna untuk hari istimewa Anda.
          </p>

          {/* Search Bar */}
          <div className="search-bar reveal" style={{ marginTop: 'var(--space-8)', marginBottom: '0' }}>
            <span className="search-bar__icon"></span>
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

      {/* ===== TEMPLATE CATEGORIES ===== */}
      <section className="section--sm">
        <div className="container">

          {isLoading ? (
            <div className="text-center reveal" style={{ padding: 'var(--space-20) 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Loader2 className="animate-spin" style={{ width: '48px', height: '48px', color: 'var(--primary)', marginBottom: 'var(--space-4)' }} />
              <p style={{ color: 'var(--text-muted)' }}>Memuat koleksi desain...</p>
            </div>
          ) : groupedTemplates.length === 0 ? (
            <div className="text-center reveal" style={{ padding: 'var(--space-20) 0' }}>
              <p style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}></p>
              <h3>Template Tidak Ditemukan</h3>
              <button
                className="btn btn--secondary"
                style={{ marginTop: 'var(--space-6)' }}
                onClick={() => setSearchQuery('')}
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <div className="space-y-16">
              {groupedTemplates.map((group, index) => (
                <div key={group.id} className="reveal-stagger" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* Category Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <div>
                      <h2 className="section-title" style={{ fontSize: 'var(--text-3xl)', marginBottom: 0, textAlign: 'left' }}>
                        {group.name}
                      </h2>
                    </div>
                    <Link href={`/templates/${group.slug}`} style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }} className="hover:text-primary transition-colors">
                      Lihat Semua <span style={{ fontSize: '1.2em' }}>→</span>
                    </Link>
                  </div>

                  {/* Horizontal Scroll Container */}
                  <div
                    className="horizontal-scroll-container"
                    style={{
                      display: 'flex',
                      gap: 'var(--space-6)',
                      overflowX: 'auto',
                      paddingBottom: 'var(--space-4)',
                      scrollbarWidth: 'none', /* Firefox */
                      msOverflowStyle: 'none'
                    }}
                  >
                    <style jsx>{`
                      .horizontal-scroll-container::-webkit-scrollbar {
                        display: none;
                      }
                      .template-card-wrapper {
                        flex: 0 0 320px; /* Fixed width for horizontal scroll */
                        min-width: 280px;
                      }
                      @media (max-width: 768px) {
                        .template-card-wrapper {
                          flex: 0 0 280px;
                        }
                      }
                    `}</style>
                    {group.templates.map((tpl) => (
                      <div key={tpl.id} className="template-card-wrapper">
                        <div
                          className="template-card shimmer-border"
                          style={{
                            cursor: 'pointer',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          onClick={() => handleSelectTemplate(tpl.id)}
                        >
                          <div className="template-card__image" style={{ height: '220px' }}>
                            <img src={tpl.image} alt={`Template ${tpl.name}`} loading="lazy" style={{ objectFit: 'cover', height: '100%', width: '100%' }} />
                            {tpl.badge && (
                              <span className="template-card__badge" style={tpl.badge === 'Gratis' ? { background: 'linear-gradient(135deg, #2ecc71, #27ae60)' } : {}}>
                                {tpl.badge}
                              </span>
                            )}
                          </div>
                          <div className="template-card__body" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 className="template-card__name">{tpl.name}</h3>
                            <p className="template-card__desc" style={{ flexGrow: 1 }}>{tpl.desc}</p>
                            <div className="template-card__footer" style={{ marginTop: 'auto' }}>
                              <span className="template-card__price">
                                {tpl.price === 'Gratis' ? <span className="free" style={{ color: 'var(--success)' }}>Gratis</span> : tpl.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="section text-center bali-corners" style={{ background: 'linear-gradient(135deg, var(--surface-subtle), var(--bg-tertiary))', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', backgroundImage: 'url("/images/ornaments/border-top.png")', backgroundRepeat: 'repeat-x', backgroundPosition: 'top center', backgroundSize: 'auto 120px', opacity: 0.15, pointerEvents: 'none', zIndex: 0 }}></div>
        <div className="container text-center">
          <span className="section-label reveal">Custom Design</span>
          <h2 className="section-title reveal">Ingin Desain Khusus?</h2>
          <p className="section-subtitle reveal" style={{ marginBottom: 'var(--space-10)' }}>
            Tim desainer kami siap membuat template eksklusif yang sesuai dengan impian pernikahan Anda.
          </p>
          <div className="reveal" style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="#" className="btn btn--primary btn--lg">💬 Hubungi Kami</Link>
          </div>
        </div>
      </section>
    </>
  );
}