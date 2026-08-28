"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HtmlAdapter from "@/components/templates/HtmlAdapter";
import { TEMPLATES } from "@/config/templates";
import { useAuth } from "@/context/AuthContext";

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateFromUrl = searchParams.get('template');
  const { user } = useAuth();

  const [template, setTemplate] = useState('agung');
  const [templatesData, setTemplatesData] = useState(TEMPLATES);
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
    resepsiTime: "18:00 WITA - Selesai",
    resepsiVenue: "Nama Venue",
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

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedTemplate = templateFromUrl || localStorage.getItem('undanganBali_template') || 'agung';
      setTemplate(savedTemplate);

      const userKey = user?.email ? `${user.email}_` : '';
      const dataKey = savedTemplate ? `undanganBali_data_${userKey}${savedTemplate}` : `undanganBali_data_${userKey}default`;
      const photoKey = savedTemplate ? `undanganBali_photo_${userKey}${savedTemplate}` : `undanganBali_photo_${userKey}default`;
      const overrideKey = savedTemplate ? `undanganBali_overrides_${userKey}${savedTemplate}` : `undanganBali_overrides_${userKey}default`;

      const savedData = localStorage.getItem(dataKey);
      if (savedData) setFormData(prev => ({ ...prev, ...JSON.parse(savedData) }));

      const savedPhoto = localStorage.getItem(photoKey);
      if (savedPhoto) setPhoto(savedPhoto);

      const savedOverrides = localStorage.getItem(overrideKey);
      if (savedOverrides) setDomOverrides(JSON.parse(savedOverrides));
    } catch (e) { }
  }, [templateFromUrl]);

  // Load templates from API
  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTemplatesData(data);
        }
      })
      .catch(() => { });
  }, []);

  // Apply accent color
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-gold', formData.accentColor);
  }, [formData.accentColor]);

  // Countdown timer
  useEffect(() => {
    if (!formData.weddingDate) return;
    const targetDate = new Date(formData.weddingDate).getTime();

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
  }, [formData.weddingDate]);

  // Convert file to Base64 with compression
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
      
      // Save directly to localStorage so Editor can use it
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

  const config = templatesData.find(t => t.id === template || (t as any).slug === template);
  const isHtmlTemplate = config?.type === 'html' || config?.type === 'html-js';

  return (
    <>
      <div className="preview-container bali-pattern-bg" style={{ minHeight: '100vh', display: 'flex', paddingTop: '80px' }}>
        
        {/* Left Side: Generated Invitation Preview */}
        <div style={{ flex: 1, position: 'relative', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          {/* INVITATION CONTENT - Mobile Phone Mockup Style */}
          <div style={{
            width: '390px',
            height: '844px',
            margin: '40px 0',
            transform: 'scale(0.8)',
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
        <div style={{
          width: '400px',
          background: 'var(--bg-elevated)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.05)',
          borderLeft: '1px solid var(--border-color)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          overflowY: 'auto'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>Hasil Generate</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Undangan Anda berhasil dibuat dengan data awal yang telah diisi.</p>

          <div style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Ubah Foto Utama</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Ganti foto utama yang ditampilkan pada undangan ini.</p>
            
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button 
              className="btn btn--outline" 
              style={{ width: '100%', marginBottom: '1rem' }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Mengunggah...' : 'Pilih Foto Baru 📷'}
            </button>
            {photo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--success)' }}>
                <span>✓ Foto telah terpasang</span>
                <button 
                  onClick={() => { 
                    setPhoto(null); 
                    const userKey = user?.email ? `${user.email}_` : '';
                    localStorage.removeItem(`undanganBali_photo_${userKey}${template}`); 
                  }} 
                  style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', textDecoration: 'underline' }}>
                  Hapus
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: '0' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
              Ingin mengubah ukuran font, letak teks, atau mengganti warna yang lebih spesifik?
            </p>
            <button 
              onClick={() => router.push(`/editor?template=${template}`)} 
              className="btn btn--primary btn--lg" 
              style={{ width: '100%', boxShadow: 'var(--shadow-lg)' }}
            >
              Lanjut Edit Detail (Visual Editor) ✨
            </button>
          </div>
        </div>

      </div>
    </>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>Memuat...</div>}>
      <ResultContent />
    </Suspense>
  );
}
