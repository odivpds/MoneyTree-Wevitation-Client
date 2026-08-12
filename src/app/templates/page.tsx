"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TEMPLATES } from "@/config/templates";

export default function TemplatesPage() {
  const [activeFilter, setActiveFilter] = useState("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [templatesData, setTemplatesData] = useState(TEMPLATES);
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
    // Scroll Reveal Initialization
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
  }, [templatesData]);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTemplatesData(data);
        }
      })
      .catch(err => {
        // Log as warning and stringify to prevent Next.js Error Overlay
        console.warn('Gagal memuat template dari CMS, menggunakan config lokal:', err.message || err);
      });
  }, []);

  const filteredTemplates = useMemo(() => {
    return templatesData.filter(tpl => {
      const matchCategory = activeFilter === "semua" || tpl.category === activeFilter;
      const matchSearch = !searchQuery || tpl.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeFilter, searchQuery, templatesData]);

  return (
    <>
      {/* ===== PAGE HEADER ===== */}
      <section className="section bali-pattern-bg bali-corners" style={{ paddingTop: '140px' }}>
        <div className="container text-center">
          <span className="section-label reveal">Koleksi Desain</span>
          <h1 className="section-title reveal" style={{ fontSize: 'var(--text-5xl)' }}>Galeri Template</h1>
          <p className="section-subtitle reveal">
            Pilih template undangan pernikahan Bali yang sempurna untuk hari istimewa Anda.
            Setiap desain terinspirasi dari keindahan dan kekayaan budaya Pulau Dewata.
          </p>

          {/* Search Bar */}
          <div className="search-bar reveal" style={{ marginTop: 'var(--space-8)' }}>
            <span className="search-bar__icon">🔍</span>
            <input
              type="text"
              className="search-bar__input"
              placeholder="Cari template... (contoh: tradisional, modern, minimalis)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          <div className="filter-bar reveal" id="filterBar">
            <button className={`filter-btn ${activeFilter === 'semua' ? 'active' : ''}`} onClick={() => setActiveFilter('semua')}>Semua</button>
            <button className={`filter-btn ${activeFilter === 'tradisional' ? 'active' : ''}`} onClick={() => setActiveFilter('tradisional')}>🏛️ Tradisional</button>
            <button className={`filter-btn ${activeFilter === 'modern' ? 'active' : ''}`} onClick={() => setActiveFilter('modern')}>✨ Modern</button>
            <button className={`filter-btn ${activeFilter === 'minimalis' ? 'active' : ''}`} onClick={() => setActiveFilter('minimalis')}>🌿 Minimalis</button>
            <button className={`filter-btn ${activeFilter === 'romantis' ? 'active' : ''}`} onClick={() => setActiveFilter('romantis')}>💕 Romantis</button>
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
                  <div className="template-card__overlay">
                    <button onClick={() => handleSelectTemplate(tpl.id)} className="btn btn--primary">Pilih Template Ini</button>
                  </div>
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
              <p className="text-muted">Coba kata kunci lain atau reset filter Anda.</p>
              <button
                className="btn btn--secondary"
                style={{ marginTop: 'var(--space-6)' }}
                onClick={() => { setActiveFilter('semua'); setSearchQuery(''); }}
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="section text-center bali-corners" style={{ background: 'linear-gradient(135deg, var(--surface-subtle), var(--bg-tertiary))', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', backgroundImage: 'url("/images/ornaments/border-top.png")', backgroundRepeat: 'repeat-x', backgroundPosition: 'top center', backgroundSize: 'auto 120px', opacity: 0.15, pointerEvents: 'none', zIndex: 0 }}></div>
        <div className="container">
          <span className="section-label reveal">Custom Design</span>
          <h2 className="section-title reveal">Ingin Desain Khusus?</h2>
          <p className="section-subtitle reveal" style={{ marginBottom: 'var(--space-10)' }}>
            Tim desainer kami siap membuat template eksklusif yang sesuai dengan impian pernikahan Anda.
          </p>
          <div className="reveal" style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="#" className="btn btn--primary btn--lg">💬 Hubungi Kami</Link>
            <Link href="/#harga" className="btn btn--secondary btn--lg">📋 Lihat Harga</Link>
          </div>
        </div>
      </section>
    </>
  );
}
