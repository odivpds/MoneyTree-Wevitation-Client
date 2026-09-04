"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HtmlAdapter from "@/components/templates/HtmlAdapter";
import { TemplateConfig } from "@/config/templates";
import { useAuth } from "@/context/AuthContext";

interface PreviewContentProps {
  templateId: string;
  initialTemplate: TemplateConfig | null;
  isPure: boolean;
}

export default function PreviewContent({ templateId, initialTemplate, isPure }: PreviewContentProps) {
  const router = useRouter();
  const { user } = useAuth();

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
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [rsvpData, setRsvpData] = useState({ name: '', count: '1', status: 'hadir', message: '' });

  // Load data from localStorage
  useEffect(() => {
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
  }, [template, user?.email]);

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

  const handleRsvpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRsvpData(prev => ({ ...prev, [name]: value }));
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`RSVP Terkirim!\nNama: ${rsvpData.name}\nStatus: ${rsvpData.status}\nPesan: ${rsvpData.message}`);
    setIsRsvpOpen(false);
    setRsvpData({ name: '', count: '1', status: 'hadir', message: '' });
  };

  const formattedDate = formData.weddingDate
    ? new Date(formData.weddingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Tanggal Pernikahan';

  const isHtmlTemplate = initialTemplate?.type === 'html' || initialTemplate?.type === 'html-js';

  if (isPure) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {isHtmlTemplate ? (
          <HtmlAdapter templateId={template} data={formData} photo={photo} timeLeft={timeLeft} domOverrides={domOverrides} />
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Fallback React Template not supported in pure mode yet.</div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="preview-container bali-pattern-bg">

        {/* ACTION BUTTONS (Floating) */}
        <div style={{ position: 'fixed', top: '100px', right: 'var(--space-4)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <button onClick={() => router.push(`/editor?template=${template}`)} className="btn btn--secondary" style={{ boxShadow: 'var(--shadow-lg)' }}>
            ✏️ Edit Ulang
          </button>
          <button onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Link undangan disalin ke clipboard!');
          }} className="btn btn--primary" style={{ boxShadow: 'var(--shadow-lg)' }}>
            🔗 Copy Link
          </button>
        </div>

        {/* INVITATION CONTENT - Mobile Phone Mockup Style */}
        <div style={{
          width: '390px', // Exact width for internal canvas
          height: '844px', // Exact height for internal canvas
          margin: '80px auto -80px auto', // Negative bottom margin to compensate for scaling
          transform: 'scale(0.85)', // Scale down visually without affecting internal resolution
          transformOrigin: 'top center',
          background: '#000000',
          borderRadius: '44px',
          padding: '0',
          boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          border: '14px solid #1a1a1a', // Phone bezel
          position: 'relative'
        }}>
          {/* iPhone Dynamic Island */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120px',
            height: '35px',
            background: '#000000',
            borderRadius: '20px',
            zIndex: 999,
            pointerEvents: 'none'
          }} />

          {/* iPhone Side Buttons (Power & Volume) */}
          <div style={{ position: 'absolute', top: '120px', right: '-14px', width: '3px', height: '60px', background: '#1a1a1a', borderTopRightRadius: '3px', borderBottomRightRadius: '3px' }} />
          <div style={{ position: 'absolute', top: '100px', left: '-14px', width: '3px', height: '30px', background: '#1a1a1a', borderTopLeftRadius: '3px', borderBottomLeftRadius: '3px' }} />
          <div style={{ position: 'absolute', top: '150px', left: '-14px', width: '3px', height: '60px', background: '#1a1a1a', borderTopLeftRadius: '3px', borderBottomLeftRadius: '3px' }} />

          <div className="invitation-preview" style={{ transform: 'none', position: 'relative', height: '100%' }}>

            {/* Render using the correct template system */}
            {isHtmlTemplate ? (
              <div style={{ width: '100%', height: '100%' }}>
                <HtmlAdapter templateId={template} data={formData} photo={photo} timeLeft={timeLeft} domOverrides={domOverrides} />
              </div>
            ) : (
              <>
                <div className="invitation-preview__header">
                  <div className="invitation-preview__ornament-top">🕉️</div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', color: 'var(--accent-gold)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 'var(--space-2)', marginTop: 'var(--space-8)' }}>
                    {formData.greeting}
                  </p>
                  <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                    The Wedding Celebration of
                  </p>

                  <div className="invitation-preview__photo" style={{ width: '250px', height: '250px' }}>
                    {!photo ? (
                      <div className="invitation-preview__photo-placeholder" style={{ fontSize: '4rem' }}>📷</div>
                    ) : (
                      <img src={photo} alt="Foto Pasangan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>

                  <h2 className="invitation-preview__names" style={{ fontFamily: formData.fontFamily, fontSize: 'var(--text-6xl)' }}>
                    <span style={{ display: 'block' }}>{formData.groomName || 'Nama Pria'}</span>
                    <span style={{ fontSize: '0.5em', display: 'block', margin: '-10px 0', color: 'var(--accent-gold)' }}>&amp;</span>
                    <span style={{ display: 'block' }}>{formData.brideName || 'Nama Wanita'}</span>
                  </h2>

                  <p className="invitation-preview__date" style={{ fontSize: 'var(--text-xl)', marginTop: 'var(--space-6)' }}>{formattedDate}</p>
                  <p className="invitation-preview__venue" style={{ fontSize: 'var(--text-md)' }}>{formData.mainVenue || 'Lokasi Acara'}</p>
                </div>

                <div className="invitation-preview__body">
                  <div className="bali-divider bali-divider--sm" style={{ margin: 'var(--space-8) 0' }}>
                    <img src="/images/ornaments/divider.png" alt="" />
                  </div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>Menghitung Hari</p>
                  <div className="invitation-preview__countdown">
                    <div className="countdown-item" style={{ padding: 'var(--space-4) var(--space-2)' }}><span className="countdown-item__value" style={{ fontSize: 'var(--text-3xl)' }}>{timeLeft.days}</span><span className="countdown-item__label">Hari</span></div>
                    <div className="countdown-item" style={{ padding: 'var(--space-4) var(--space-2)' }}><span className="countdown-item__value" style={{ fontSize: 'var(--text-3xl)' }}>{timeLeft.hours}</span><span className="countdown-item__label">Jam</span></div>
                    <div className="countdown-item" style={{ padding: 'var(--space-4) var(--space-2)' }}><span className="countdown-item__value" style={{ fontSize: 'var(--text-3xl)' }}>{timeLeft.minutes}</span><span className="countdown-item__label">Menit</span></div>
                    <div className="countdown-item" style={{ padding: 'var(--space-4) var(--space-2)' }}><span className="countdown-item__value" style={{ fontSize: 'var(--text-3xl)' }}>{timeLeft.seconds}</span><span className="countdown-item__label">Detik</span></div>
                  </div>

                  <div className="bali-divider bali-divider--sm" style={{ margin: 'var(--space-10) 0' }}>
                    <img src="/images/ornaments/divider.png" alt="" />
                  </div>

                  <div style={{ textAlign: 'left', padding: '0 var(--space-6)' }}>
                    <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--accent-gold)', marginBottom: 'var(--space-2)' }}>Akad / Pawiwahan</p>
                      <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>{formData.akadTime}</p>
                      <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-muted)' }}>{formData.akadVenue}</p>
                    </div>
                    <div style={{ padding: 'var(--space-6)', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--accent-gold)', marginBottom: 'var(--space-2)' }}>Resepsi</p>
                      <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>{formData.resepsiTime}</p>
                      <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-muted)' }}>{formData.resepsiVenue}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: 'var(--space-10)', textAlign: 'center' }}>
                    <button className="btn btn--primary btn--lg" onClick={() => setIsRsvpOpen(true)} style={{ width: '80%' }}>Konfirmasi Kehadiran (RSVP)</button>
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-6)', borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ fontFamily: 'var(--font-script)', fontSize: 'var(--text-3xl)', color: 'var(--accent-gold)' }}>Merupakan suatu kehormatan bagi kami</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>apabila Bapak/Ibu/Saudara/i berkenan hadir</p>
                </div>
              </>
            )}
          </div>

          {/* iPhone Home Indicator */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '135px',
            height: '5px',
            background: 'rgba(255, 255, 255, 0.7)',
            mixBlendMode: 'difference',
            borderRadius: '100px',
            zIndex: 999,
            pointerEvents: 'none'
          }} />
        </div>

        {/* RSVP MODAL */}
        {isRsvpOpen && (
          <div className="modal" style={{ display: 'flex' }}>
            <div className="modal__overlay" onClick={() => setIsRsvpOpen(false)}></div>
            <div className="modal__content glass-card">
              <button className="modal__close" onClick={() => setIsRsvpOpen(false)}>✕</button>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-2)' }}>Konfirmasi Kehadiran</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>Silakan isi form di bawah ini untuk RSVP.</p>

              <form onSubmit={handleRsvpSubmit}>
                <div className="form-group">
                  <label className="form-group__label">Nama Lengkap</label>
                  <input type="text" name="name" required className="form-group__input" value={rsvpData.name} onChange={handleRsvpChange} />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Jumlah Kehadiran</label>
                  <select name="count" className="form-group__input" value={rsvpData.count} onChange={handleRsvpChange}>
                    <option value="1">1 Orang</option>
                    <option value="2">2 Orang</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-group__label">Konfirmasi Kehadiran</label>
                  <select name="status" className="form-group__input" value={rsvpData.status} onChange={handleRsvpChange}>
                    <option value="hadir">Ya, saya akan hadir</option>
                    <option value="tidak_hadir">Maaf, saya tidak bisa hadir</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-group__label">Pesan untuk Mempelai</label>
                  <textarea name="message" className="form-group__input" rows={3} value={rsvpData.message} onChange={handleRsvpChange}></textarea>
                </div>
                <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 'var(--space-4)' }}>Kirim RSVP</button>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
