"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PreviewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    groomName: "Nama Pria",
    brideName: "Nama Wanita",
    weddingDate: "",
    mainVenue: "Lokasi Acara",
    akadTime: "09:00 WITA - Selesai",
    akadVenue: "Pura Keluarga",
    resepsiTime: "18:00 WITA - Selesai",
    resepsiVenue: "Nama Venue",
    accentColor: "#d4a574",
    fontFamily: "'Great Vibes', cursive",
    greeting: "Om Swastyastu"
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: '--', hours: '--', minutes: '--', seconds: '--' });
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [rsvpData, setRsvpData] = useState({ name: '', count: '1', status: 'hadir', message: '' });

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('undanganBali_data');
      if (savedData) setFormData(prev => ({ ...prev, ...JSON.parse(savedData) }));
      const savedPhoto = localStorage.getItem('undanganBali_photo');
      if (savedPhoto) setPhoto(savedPhoto);
    } catch (e) {}
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-gold', formData.accentColor);
  }, [formData.accentColor]);

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

  return (
    <>
      <div className="preview-container bali-pattern-bg">
        
        {/* ACTION BUTTONS (Floating) */}
        <div style={{ position: 'fixed', top: '100px', right: 'var(--space-4)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <button onClick={() => router.push('/editor')} className="btn btn--secondary" style={{ boxShadow: 'var(--shadow-lg)' }}>
            ✏️ Edit Ulang
          </button>
          <button onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Link undangan disalin ke clipboard!');
          }} className="btn btn--primary" style={{ boxShadow: 'var(--shadow-lg)' }}>
            🔗 Copy Link
          </button>
        </div>

        {/* INVITATION CONTENT */}
        <div style={{ maxWidth: '600px', margin: '100px auto 40px auto', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-2)', boxShadow: 'var(--shadow-xl)' }}>
          <div className="invitation-preview" style={{ transform: 'none', position: 'relative' }}>
            
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
                <span style={{ display: 'block' }}>{formData.groomName}</span>
                <span style={{ fontSize: '0.5em', display: 'block', margin: '-10px 0', color: 'var(--accent-gold)' }}>&</span>
                <span style={{ display: 'block' }}>{formData.brideName}</span>
              </h2>

              <p className="invitation-preview__date" style={{ fontSize: 'var(--text-xl)', marginTop: 'var(--space-6)' }}>{formattedDate}</p>
              <p className="invitation-preview__venue" style={{ fontSize: 'var(--text-md)' }}>{formData.mainVenue}</p>
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

            <img src="/images/ornaments/corner.png" alt="" style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '120px', height: '120px', opacity: 0.4, pointerEvents: 'none', transform: 'scaleY(-1)' }} />
            <img src="/images/ornaments/corner.png" alt="" style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '120px', height: '120px', opacity: 0.4, pointerEvents: 'none', transform: 'scale(-1, -1)' }} />
          </div>
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
