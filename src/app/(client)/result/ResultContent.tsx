"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import HtmlAdapter from "@/components/templates/HtmlAdapter";
import { TemplateConfig } from "@/config/templates";
import { useAuth } from "@/context/AuthContext";

interface ResultContentProps {
  templateId: string;
  initialTemplate: TemplateConfig | null;
}

export default function ResultContent({ templateId, initialTemplate }: ResultContentProps) {
  const router = useRouter();
  const { user, isInitialized } = useAuth();

  const [template] = useState(templateId);
  const [formData, setFormData] = useState({
    groomName: "Nama Pria",
    brideName: "Nama Wanita",
    groomParents: "",
    brideParents: "",
    weddingDate: "",
    mainVenue: "Lokasi Acara",
    dressCode: "",
    akadTime: "09:00 WITA - Selesai",
    akadVenue: "Pura Keluarga",
    akadMapKeyword: "",
    resepsiTime: "18:00 WITA - Selesai",
    resepsiVenue: "Nama Venue",
    resepsiMapKeyword: "",
    mapLink: "",
    accentColor: "#d4a574",
    fontFamily: "'Great Vibes', cursive",
    greeting: "Om Swastyastu"
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [domOverrides, setDomOverrides] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState({ days: '--', hours: '--', minutes: '--', seconds: '--' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [waCopied, setWaCopied] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    if (!isInitialized) return;

    try {
      const userKey = user?.email ? `${user.email}_` : '';
      const dataKey = template ? `undanganBali_data_${userKey}${template}` : `undanganBali_data_${userKey}default`;
      const photoKey = template ? `undanganBali_photo_${userKey}${template}` : `undanganBali_photo_${userKey}default`;
      const overrideKey = template ? `undanganBali_overrides_${userKey}${template}` : `undanganBali_overrides_${userKey}default`;

      const savedData = localStorage.getItem(dataKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        delete parsed.akadMapIframe;
        delete parsed.resepsiMapIframe;
        setFormData(prev => ({ ...prev, ...parsed }));
      }

      const savedPhoto = localStorage.getItem(photoKey);
      if (savedPhoto) setPhoto(savedPhoto);

      const savedOverrides = localStorage.getItem(overrideKey);
      if (savedOverrides) setDomOverrides(JSON.parse(savedOverrides));
    } catch (e) { }
  }, [template, isInitialized, user?.email]);

  // Apply accent color
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-gold', formData.accentColor);
  }, [formData.accentColor]);

  // Countdown timer
  useEffect(() => {
    const dateStr = (formData as any).countdownDate || (formData as any).akadDate || formData.weddingDate || (formData as any).resepsiDate;
    if (!dateStr) return;

    let timeStr = (formData as any).countdownTime || formData.akadTime || formData.resepsiTime || '00:00:00';
    if (timeStr.length === 5) {
      timeStr = `${timeStr}:00`;
    }

    const targetDate = new Date(`${dateStr}T${timeStr}`).getTime();

    const tick = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0 || isNaN(diff)) {
        setTimeLeft({ days: '0', hours: '0', minutes: '0', seconds: '0' });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)).toString(),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString(),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString(),
        seconds: Math.floor((diff % (1000 * 60)) / 1000).toString()
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [(formData as any).countdownDate, (formData as any).countdownTime, (formData as any).akadDate, formData.akadTime, formData.weddingDate, (formData as any).resepsiDate, formData.resepsiTime]);

  const fileToBase64 = (file: File, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/webp', 0.75));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar! Maksimal 5MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Format file tidak didukung! Gunakan JPG, PNG, atau WebP.');
      return;
    }

    try {
      setIsUploading(true);
      const base64Data = await fileToBase64(file);
      setPhoto(base64Data);

      const userKey = user?.email ? `${user.email}_` : '';
      const photoKey = template ? `undanganBali_photo_${userKey}${template}` : `undanganBali_photo_${userKey}default`;
      localStorage.setItem(photoKey, base64Data);

    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Gagal memproses foto.');
    } finally {
      setIsUploading(false);
    }
  };

  // Use the pre-fetched template config — no fetch needed!
  const isHtmlTemplate = initialTemplate?.type === 'html' || initialTemplate?.type === 'html-js';

  // --- Helper functions ---

  // Format date nicely
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getWaDraft = () => {
    const dateStr = (formData as any).akadDate || formData.weddingDate || (formData as any).resepsiDate || '';
    const formattedDate = formatDate(dateStr);
    const venue = formData.akadVenue || formData.mainVenue || 'lokasi acara';

    return `Assalamu'alaikum / Om Swastyastu 

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:

${formData.groomName} & ${formData.brideName}
${formattedDate}
${venue}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.

Terima kasih 🙏`;
  };

  const handleCopyWa = () => {
    navigator.clipboard.writeText(getWaDraft());
    setWaCopied(true);
    setTimeout(() => setWaCopied(false), 2000);
  };

  const handleShareWa = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(getWaDraft())}`;
    window.open(waUrl, '_blank');
  };

  // --- Styles ---
  const sectionStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1.25rem',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: 'var(--accent-gold)',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '0.9rem',
  };

  const btnSecondaryStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid var(--accent-gold)',
    background: 'transparent',
    color: 'var(--accent-gold)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  };

  // --- Stepper data ---
  const steps = [
    { number: 1, label: 'Isi Data', done: true },
    { number: 2, label: 'Preview', done: true },
    { number: 3, label: 'Edit Detail', done: false, current: true },
    { number: 4, label: 'Publikasi', done: false },
  ];

  return (
    <>
      <style>{`
        .result-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          padding-top: 80px;
        }
        .result-left {
          flex: 1;
          position: relative;
          overflow-y: auto;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
        }
        .result-right {
          width: 100%;
          background: var(--bg-elevated);
          box-shadow: -10px 0 30px rgba(0,0,0,0.05);
          border-top: 1px solid var(--border-color);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          z-index: 10;
        }
        @media (min-width: 1024px) {
          .result-container {
            flex-direction: row;
            height: 100vh;
            overflow: hidden;
          }
          .result-right {
            width: 420px;
            border-top: none;
            border-left: 1px solid var(--border-color);
            overflow-y: auto;
            flex-shrink: 0;
          }
          .result-mockup-wrap {
            transform: scale(0.9);
            margin: 40px 0;
          }
        }
        @media (max-width: 1023px) {
          .result-mockup-wrap {
            transform: scale(0.85);
            margin: 24px 0;
          }
        }
      `}</style>
      <div className="result-container bali-pattern-bg">
        {/* Left Side: Generated Invitation Preview */}
        <div className="result-left">
          {/* INVITATION CONTENT - Mobile Phone Mockup Style */}
          <div className="result-mockup-wrap" style={{
            width: '390px',
            height: '844px',
            transformOrigin: 'top center',
            background: '#000000',
            borderRadius: '55px',
            padding: '0',
            boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden',
            border: '14px solid #121212',
            position: 'relative',
            flexShrink: 0
          }}>
            {/* iPhone Dynamic Island */}
            <div style={{
              position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
              width: '125px', height: '35px', background: '#000000', borderRadius: '20px',
              zIndex: 999, pointerEvents: 'none'
            }} />

            {/* iPhone Side Buttons */}
            <div style={{ position: 'absolute', top: '120px', right: '-16px', width: '3px', height: '60px', background: '#121212', borderTopRightRadius: '3px', borderBottomRightRadius: '3px' }} />
            <div style={{ position: 'absolute', top: '100px', left: '-16px', width: '3px', height: '30px', background: '#121212', borderTopLeftRadius: '3px', borderBottomLeftRadius: '3px' }} />
            <div style={{ position: 'absolute', top: '160px', left: '-16px', width: '3px', height: '60px', background: '#121212', borderTopLeftRadius: '3px', borderBottomLeftRadius: '3px' }} />

            <div className="invitation-preview" style={{ transform: 'none', position: 'relative', height: '100%', width: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', border: 'none', borderRadius: 0, background: 'transparent', boxShadow: 'none' }}>
              {isHtmlTemplate ? (
                <div style={{ width: '100%', height: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <HtmlAdapter templateId={template} data={formData} photo={photo} timeLeft={timeLeft} domOverrides={domOverrides} isEditable={false} />
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', marginTop: '100px', color: 'white' }}>
                  Template tidak didukung format HTML/JS
                </div>
              )}
            </div>

            {/* iPhone Home Indicator */}
            <div style={{
              position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
              width: '135px', height: '5px', background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '100px', zIndex: 999, pointerEvents: 'none'
            }} />
          </div>
        </div>

        {/* Right Side: Actions Panel */}
        <div className="result-right">
          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: '2px', fontSize: '1.3rem' }}>
                  Undangan Berhasil Dibuat!
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                  Berikut ringkasan dan langkah selanjutnya.
                </p>
              </div>
            </div>

            {/* Progress Stepper */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 0.5rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
            }}>
              {steps.map((step, i) => (
                <div key={step.number} style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: step.done ? 'var(--accent-gold)' : step.current ? 'transparent' : 'rgba(255,255,255,0.08)',
                      border: step.current ? '2px solid var(--accent-gold)' : step.done ? 'none' : '1px solid rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700,
                      color: step.done ? '#1a1a2e' : step.current ? 'var(--accent-gold)' : 'var(--text-muted)',
                    }}>
                      {step.done ? '✓' : step.number}
                    </div>
                    <span style={{
                      fontSize: '0.6rem',
                      color: step.done || step.current ? 'var(--accent-gold)' : 'var(--text-muted)',
                      fontWeight: step.current ? 700 : 400,
                      whiteSpace: 'nowrap',
                    }}>
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      width: '30px', height: '2px', margin: '0 4px',
                      marginBottom: '18px',
                      background: step.done ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                      borderRadius: '2px',
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 1: Ringkasan Info */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>
              Ringkasan Undangan
            </div>
            <div style={infoRowStyle}>
              <span style={{ color: 'var(--text-muted)' }}>Mempelai</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formData.groomName} & {formData.brideName}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={{ color: 'var(--text-muted)' }}>Tanggal</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {formatDate((formData as any).akadDate || formData.weddingDate || (formData as any).resepsiDate)}
              </span>
            </div>
            <div style={infoRowStyle}>
              <span style={{ color: 'var(--text-muted)' }}>Lokasi Akad</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formData.akadVenue || '-'}</span>
            </div>
            <div style={{ ...infoRowStyle, borderBottom: 'none' }}>
              <span style={{ color: 'var(--text-muted)' }}>Lokasi Resepsi</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formData.resepsiVenue || '-'}</span>
            </div>
          </div>

          {/* Section 2: Status Publikasi */}
          <div style={{ ...sectionStyle, background: 'rgba(255, 200, 50, 0.04)', borderColor: 'rgba(255, 200, 50, 0.15)' }}>
            <div style={sectionTitleStyle}>
              <span></span> Status: Draft (Belum Dipublikasi)
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              Undangan Anda saat ini masih berupa <strong style={{ color: 'var(--accent-gold)' }}>draft</strong> dan tersimpan di perangkat ini.
              Setelah puas dengan desainnya, hubungi admin untuk <strong style={{ color: 'var(--accent-gold)' }}>mempublikasikan</strong> undangan Anda agar mendapatkan:
            </p>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '1.2rem', margin: '0.5rem 0 0 0' }}>
              <li>Link undangan unik yang bisa dibagikan</li>
              <li>Fitur daftar tamu & RSVP</li>
              <li>Kirim undangan via WhatsApp per-tamu dengan nama personal</li>
            </ul>
          </div>

          {/* Section 3: Draft Pesan WhatsApp */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>
              Draft Pesan WhatsApp
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Preview pesan yang bisa Anda gunakan sebagai referensi. Setelah dipublikasi, link undangan akan otomatis ditambahkan.
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              maxHeight: '180px',
              overflowY: 'auto',
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {getWaDraft()}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCopyWa}
                style={{
                  ...btnSecondaryStyle,
                  flex: 1,
                  background: waCopied ? '#22c55e' : 'transparent',
                  color: waCopied ? '#fff' : 'var(--accent-gold)',
                  borderColor: waCopied ? '#22c55e' : 'var(--accent-gold)',
                }}
              >
                {waCopied ? '✓ Pesan Tersalin!' : 'Salin Draft'}
              </button>
              <button
                onClick={handleShareWa}
                style={{
                  ...btnSecondaryStyle,
                  flex: 1,
                  background: '#25D366',
                  color: '#fff',
                  borderColor: '#25D366',
                }}
              >
                Buka WhatsApp
              </button>
            </div>
          </div>

          {/* Section 4: Langkah Selanjutnya */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>
              Langkah Selanjutnya
            </div>

            <button
              onClick={() => router.push(`/editor?template=${template}`)}
              className="btn btn--primary btn--lg"
              style={{
                width: '100%',
                boxShadow: 'var(--shadow-lg)',
                marginBottom: '0.75rem',
                padding: '0.85rem',
              }}
            >
              Lanjut Edit Detail
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
              Sesuaikan ukuran font, letak teks, warna, dan elemen visual lainnya.
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => router.push(`/setup?template=${template}`)}
                style={{ ...btnSecondaryStyle, flex: 1 }}
              >
                Ubah Data
              </button>
              <button
                onClick={() => router.push('/')}
                style={{ ...btnSecondaryStyle, flex: 1 }}
              >
                Dashboard
              </button>
            </div>
          </div>

          {/* Footer */}
          <p style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: 'auto',
            paddingTop: '1rem',
            opacity: 0.6,
          }}>
            Data tersimpan di perangkat ini. Setelah dipublikasi oleh admin, undangan Anda akan online dan bisa dibagikan.
          </p>
        </div>

      </div>
    </>
  );
}
