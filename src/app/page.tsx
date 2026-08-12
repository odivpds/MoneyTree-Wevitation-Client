"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TemplateConfig } from "@/config/templates";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [templatesData, setTemplatesData] = useState<TemplateConfig[]>([]);
  const totalSlides = 3;
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const handleProtectedNavigation = (url: string) => {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(url)}`);
    } else {
      router.push(url);
    }
  };

  useEffect(() => {
    // Scroll Reveal Initialization
    const revealElements = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale');
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
        if (Array.isArray(data)) {
          setTemplatesData(data);
        }
      })
      .catch(err => console.error('Gagal mengambil template', err));
  }, []);

  useEffect(() => {
    // Auto-advance testimonials
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  return (
    <>
      {/* Floating Petals */}
      <div className="petal-container" id="petalContainer">
        <span className="petal">🌸</span>
        <span className="petal">🌺</span>
        <span className="petal">🌸</span>
        <span className="petal">✿</span>
        <span className="petal">🌸</span>
        <span className="petal">🌺</span>
        <span className="petal">✿</span>
        <span className="petal">🌸</span>
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="hero bali-hero" id="beranda">
        <div className="hero__bg">
          <img src="/images/hero-bg.png" alt="Candi Bentar Bali" />
        </div>
        <div className="hero__overlay"></div>

        <div className="bali-hero__ornament-top"></div>
        <div className="bali-hero__ornament-bottom"></div>
        <img src="/images/ornaments/corner.png" className="bali-hero__corner-tl" alt="" />
        <img src="/images/ornaments/corner.png" className="bali-hero__corner-tr" alt="" />
        <img src="/images/ornaments/corner.png" className="bali-hero__corner-bl" alt="" />
        <img src="/images/ornaments/corner.png" className="bali-hero__corner-br" alt="" />

        <div className="hero__content">
          <p className="hero__label">Undangan Bali</p>
          <h1 className="hero__title">
            Rayakan Cinta Dalam
            <span>Keanggunan Bali</span>
          </h1>
          <p className="hero__subtitle">
            Buat undangan pernikahan digital eksklusif dengan nuansa tradisi Bali yang memukau.
            Pilih template, upload foto, kustomisasi, dan bagikan kebahagiaan Anda.
          </p>
          <div className="hero__actions">
            <button onClick={() => handleProtectedNavigation('/templates')} className="btn btn--primary btn--lg">
              ✨ Mulai Buat Undangan
            </button>
            <Link href="#desain" className="btn btn--secondary btn--lg">
              🎨 Lihat Template
            </Link>
          </div>
        </div>

        <div className="hero__scroll-indicator">
          <div className="mouse"></div>
          <span>Scroll</span>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="section bali-pattern-bg bali-corners" id="fitur">
        <div className="container text-center">
          <span className="section-label reveal">Fitur Unggulan</span>
          <h2 className="section-title reveal">Semua yang Anda Butuhkan</h2>
          <p className="section-subtitle reveal">
            Platform lengkap untuk membuat undangan pernikahan digital yang elegan dan mudah disebarkan.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)', marginTop: 'var(--space-12)' }} className="reveal-stagger">
            <div className="glass-card feature-card reveal">
              <div className="feature-card__icon">🎨</div>
              <h3 className="feature-card__title">Pilih Template</h3>
              <p className="feature-card__desc">Koleksi template eksklusif bertemakan Bali — dari tradisional hingga modern minimalis.</p>
            </div>
            <div className="glass-card feature-card reveal">
              <div className="feature-card__icon">📸</div>
              <h3 className="feature-card__title">Upload Foto</h3>
              <p className="feature-card__desc">Tambahkan foto pasangan Anda langsung ke template undangan dengan mudah.</p>
            </div>
            <div className="glass-card feature-card reveal">
              <div className="feature-card__icon">✏️</div>
              <h3 className="feature-card__title">Kustomisasi</h3>
              <p className="feature-card__desc">Edit nama, tanggal, lokasi, dan detail acara sesuai kebutuhan pernikahan Anda.</p>
            </div>
            <div className="glass-card feature-card reveal">
              <div className="feature-card__icon">🔗</div>
              <h3 className="feature-card__title">Bagikan</h3>
              <p className="feature-card__desc">Sebarkan undangan via WhatsApp, Instagram, atau link langsung ke tamu undangan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TEMPLATE SHOWCASE ===== */}
      <section className="section bali-border-top bali-border-bottom" id="desain" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container text-center">
          <span className="section-label reveal">Koleksi Template</span>
          <h2 className="section-title reveal">Template Pilihan</h2>
          <p className="section-subtitle reveal">
            Desain eksklusif yang terinspirasi dari keindahan dan kekayaan budaya Bali.
          </p>

          <div className="template-grid reveal-stagger" style={{ marginTop: 'var(--space-12)' }}>
            {templatesData.slice(0, 3).map((tpl) => (
              <div key={tpl.id} className="template-card reveal shimmer-border">
                <div className="template-card__image">
                  <img src={tpl.image} alt={`Template ${tpl.name}`} loading="lazy" />
                  {tpl.badge && <span className="template-card__badge" style={tpl.badge === 'Gratis' ? { background: 'linear-gradient(135deg, #2ecc71, #27ae60)' } : {}}>{tpl.badge}</span>}
                  <div className="template-card__overlay">
                    <button onClick={() => handleProtectedNavigation(`/setup?template=${tpl.id}`)} className="btn btn--primary">Pilih Template</button>
                  </div>
                </div>
                <div className="template-card__body">
                  <h3 className="template-card__name">{tpl.name}</h3>
                  <p className="template-card__desc">{tpl.desc}</p>
                  <div className="template-card__footer">
                    <span className="template-card__price">
                      {tpl.price === 'Gratis' ? <span className="free" style={{ color: 'var(--success)' }}>Gratis</span> : tpl.price}
                    </span>
                    <button onClick={() => handleProtectedNavigation(`/setup?template=${tpl.id}`)} className="btn btn--secondary btn--sm">Pilih</button>
                  </div>
                </div>
              </div>
            ))}

            {templatesData.length === 0 && (
              <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>Memuat template desain eksklusif...</p>
            )}
          </div>

          <div style={{ marginTop: 'var(--space-12)' }} className="reveal">
            <Link href="/templates" className="btn btn--primary btn--lg">
              Lihat Semua Template →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section bali-corners" id="cara-kerja" style={{ position: 'relative', overflow: 'hidden' }}>
        <img src="/images/ornaments/corner.png" alt="" style={{ position: 'absolute', bottom: 0, left: 0, width: '200px', height: '200px', opacity: 0.18, pointerEvents: 'none', zIndex: 0, transform: 'scaleY(-1)' }} />
        <img src="/images/ornaments/corner.png" alt="" style={{ position: 'absolute', bottom: 0, right: 0, width: '200px', height: '200px', opacity: 0.18, pointerEvents: 'none', zIndex: 0, transform: 'scale(-1, -1)' }} />

        <div className="container text-center">
          <span className="section-label reveal">Langkah Mudah</span>
          <h2 className="section-title reveal">Cara Kerja</h2>
          <p className="section-subtitle reveal">
            Buat undangan pernikahan digital dalam hitungan menit dengan 4 langkah sederhana.
          </p>

          <div className="steps reveal" style={{ marginTop: 'var(--space-12)' }}>
            <div className="step">
              <div className="step__number">1</div>
              <h3 className="step__title">Pilih Template</h3>
              <p className="step__desc">Jelajahi koleksi template bertemakan Bali dan pilih favorit Anda.</p>
            </div>
            <div className="step">
              <div className="step__number">2</div>
              <h3 className="step__title">Upload Foto</h3>
              <p className="step__desc">Tambahkan foto pasangan Anda ke dalam template yang dipilih.</p>
            </div>
            <div className="step">
              <div className="step__number">3</div>
              <h3 className="step__title">Kustomisasi</h3>
              <p className="step__desc">Isi nama, tanggal, lokasi, dan detail acara pernikahan.</p>
            </div>
            <div className="step">
              <div className="step__number">4</div>
              <h3 className="step__title">Bagikan</h3>
              <p className="step__desc">Sebarkan undangan via WhatsApp, media sosial, atau QR code.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="section bali-pattern-bg" id="harga" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container text-center">
          <span className="section-label reveal">Paket Harga</span>
          <h2 className="section-title reveal">Pilih Paket Anda</h2>
          <p className="section-subtitle reveal">
            Tersedia berbagai pilihan paket sesuai kebutuhan dan budget Anda.
          </p>

          <div className="pricing-grid reveal" style={{ marginTop: 'var(--space-12)' }}>
            <div className="glass-card pricing-card">
              <h3 className="pricing-card__name">Gratis</h3>
              <p className="pricing-card__price"><span className="free" style={{ color: 'var(--success)' }}>Rp 0</span></p>
              <p className="pricing-card__desc">Coba buat undangan pertama Anda</p>
              <ul className="pricing-card__features">
                <li>1 Template dasar</li>
                <li>Upload 1 foto</li>
                <li>Kustomisasi teks</li>
                <li>Bagikan via link</li>
                <li className="disabled">Hapus watermark</li>
                <li className="disabled">Template premium</li>
                <li className="disabled">QR Code</li>
                <li className="disabled">Custom domain</li>
              </ul>
              <Link href="/templates" className="btn btn--secondary" style={{ width: '100%' }}>Mulai Gratis</Link>
            </div>

            <div className="glass-card pricing-card pricing-card--featured gold-pulse">
              <h3 className="pricing-card__name">Premium</h3>
              <p className="pricing-card__price">Rp 299K</p>
              <p className="pricing-card__desc">Paket terlengkap dan paling populer</p>
              <ul className="pricing-card__features">
                <li>Semua template premium</li>
                <li>Upload foto unlimited</li>
                <li>Kustomisasi penuh</li>
                <li>Bagikan semua platform</li>
                <li>Tanpa watermark</li>
                <li>RSVP tracking</li>
                <li>QR Code</li>
                <li className="disabled">Custom domain</li>
              </ul>
              <Link href="/templates" className="btn btn--primary" style={{ width: '100%' }}>Pilih Premium</Link>
            </div>

            <div className="glass-card pricing-card">
              <h3 className="pricing-card__name">Eksklusif</h3>
              <p className="pricing-card__price">Rp 599K</p>
              <p className="pricing-card__desc">Untuk pernikahan yang sempurna</p>
              <ul className="pricing-card__features">
                <li>Semua fitur Premium</li>
                <li>Custom template design</li>
                <li>Background music</li>
                <li>Video undangan</li>
                <li>Custom domain</li>
                <li>Countdown timer</li>
                <li>Gallery foto</li>
                <li>Priority support</li>
              </ul>
              <Link href="/templates" className="btn btn--burgundy" style={{ width: '100%' }}>Pilih Eksklusif</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section bali-border-top bali-border-bottom" id="testimoni">
        <div className="container text-center">
          <span className="section-label reveal">Testimoni</span>
          <h2 className="section-title reveal">Apa Kata Mereka</h2>
          <p className="section-subtitle reveal">
            Ribuan pasangan telah mempercayakan undangan pernikahan mereka kepada kami.
          </p>

          <div className="testimonial-slider reveal" style={{ marginTop: 'var(--space-12)' }}>
            <div className="testimonial-track" style={{ transform: `translateX(-${currentSlide * 100}%)`, transition: 'transform 0.5s ease-in-out' }}>
              <div className="testimonial-card glass-card">
                <p className="testimonial-card__quote">
                  Undangan digitalnya sangat cantik dan elegan! Tamu-tamu kami terkagum dengan desain bernuansa Bali. Proses pembuatannya juga sangat mudah.
                </p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">👫</div>
                  <div>
                    <p className="testimonial-card__name">Made & Komang</p>
                    <p className="testimonial-card__location">Denpasar, Bali</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card glass-card">
                <p className="testimonial-card__quote">
                  Fitur upload foto langsung ke template sangat memudahkan. Hasil undangannya profesional dan mewah. Sangat recommended!
                </p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">💑</div>
                  <div>
                    <p className="testimonial-card__name">Putu & Kadek</p>
                    <p className="testimonial-card__location">Ubud, Bali</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card glass-card">
                <p className="testimonial-card__quote">
                  Kami memilih template Surya dan hasilnya luar biasa! Share via WhatsApp sangat praktis dan semua tamu langsung bisa RSVP.
                </p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">👩‍❤️‍👨</div>
                  <div>
                    <p className="testimonial-card__name">Wayan & Luh</p>
                    <p className="testimonial-card__location">Gianyar, Bali</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="testimonial-dots">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className={currentSlide === i ? 'active' : ''}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="section text-center bali-corners" style={{ background: 'linear-gradient(135deg, var(--surface-subtle), var(--bg-tertiary))', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', backgroundImage: 'url("/images/ornaments/border-top.png")', backgroundRepeat: 'repeat-x', backgroundPosition: 'top center', backgroundSize: 'auto 120px', opacity: 0.15, pointerEvents: 'none', zIndex: 0 }}></div>
        <div className="container">
          <h2 className="section-title reveal" style={{ fontSize: 'var(--text-5xl)' }}>
            Siap Membuat Undangan Impian?
          </h2>
          <p className="section-subtitle reveal" style={{ marginBottom: 'var(--space-10)' }}>
            Mulai buat undangan pernikahan digital bertemakan Bali sekarang juga. Gratis untuk dicoba!
          </p>
          <div className="reveal">
            <Link href="/templates" className="btn btn--primary btn--lg">
              ✨ Mulai Sekarang — Gratis
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
