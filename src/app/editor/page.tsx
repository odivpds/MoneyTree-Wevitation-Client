"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from 'react';
import { useAuth } from "@/context/AuthContext";
import AgungTemplate from "@/components/templates/AgungTemplate";
import HtmlAdapter from "@/components/templates/HtmlAdapter";
import { TEMPLATES } from "@/config/templates";

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = searchParams.get('template') || 'agung';
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent('/editor?template=' + template)}`);
    }
  }, [isLoggedIn, router, template]);

  const [activeTab, setActiveTab] = useState("info");
  const [showToast, setShowToast] = useState({ show: false, message: "", type: "success" });
  const [templatesData, setTemplatesData] = useState(TEMPLATES);

  useEffect(() => {
    // Fetch from CMS
    fetch('http://localhost:3001/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTemplatesData(data);
        }
      })
      .catch(err => console.error('Failed to load templates from CMS, using local config:', err));
  }, []);
  
  const [formData, setFormData] = useState({
    groomName: "",
    brideName: "",
    weddingDate: "",
    mainVenue: "",
    dressCode: "",
    akadTime: "",
    akadVenue: "",
    resepsiTime: "",
    resepsiVenue: "",
    mapLink: "",
    accentColor: "#d4a574",
    fontFamily: "'Great Vibes', cursive",
    greeting: "Om Swastyastu"
  });
  
  const [photo, setPhoto] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: '--', hours: '--', minutes: '--', seconds: '--' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for WYSIWYG Editor
  const [domOverrides, setDomOverrides] = useState<Record<string, string>>({});
  const [selectedElement, setSelectedElement] = useState<{ selector: string; content: string; tagName: string } | null>(null);
  const [detectedSections, setDetectedSections] = useState<{ id: string; name: string }[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('undanganBali_data');
      if (savedData) {
        setFormData(prev => ({ ...prev, ...JSON.parse(savedData) }));
      }
      const savedPhoto = localStorage.getItem('undanganBali_photo');
      if (savedPhoto) {
        setPhoto(savedPhoto);
      }
      const savedOverrides = localStorage.getItem('undanganBali_overrides');
      if (savedOverrides) {
        setDomOverrides(JSON.parse(savedOverrides));
      }
    } catch (e) {}
  }, []);

  // Timer logic
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

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ 
        days: days.toString(), 
        hours: hours.toString(), 
        minutes: minutes.toString(), 
        seconds: seconds.toString() 
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [formData.weddingDate]);

  // Apply accent color to root
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-gold', formData.accentColor);
  }, [formData.accentColor]);

  // Visual Builder Message Listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.type === 'ELEMENT_CLICKED') {
        setSelectedElement({ selector: msg.selector, content: msg.content, tagName: msg.tagName });
        setActiveTab('visual');
      }
      if (msg.type === 'SECTIONS_DETECTED') {
        setDetectedSections(msg.sections);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleVisualEdit = (content: string) => {
    if (!selectedElement) return;
    
    // Update local overrides state
    setDomOverrides(prev => ({
      ...prev,
      [selectedElement.selector]: content
    }));
    
    // Update selectedElement content so input reflects it
    setSelectedElement(prev => prev ? { ...prev, content } : null);

    // Send back to iframe
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'UPDATE_ELEMENT',
        selector: selectedElement.selector,
        content: content
      }, '*');
    }
  };

  const scrollToSection = (id: string) => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'SCROLL_TO_SECTION',
        id: id
      }, '*');
    }
  };

  const handleVisualImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleVisualEdit(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const displayToast = (message: string, type = "success") => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      displayToast('Ukuran file terlalu besar! Maksimal 5MB.', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      displayToast('Format file tidak didukung! Gunakan JPG, PNG, atau WebP.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPhoto(e.target.result as string);
        displayToast('Foto berhasil diupload! 📸', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    displayToast('Foto berhasil dihapus', 'success');
  };

  const handleSave = () => {
    if (!formData.groomName || !formData.brideName) {
      displayToast('Harap isi nama mempelai pria dan wanita! ⚠️', 'error');
      return;
    }

    try {
      localStorage.setItem('undanganBali_data', JSON.stringify(formData));
      localStorage.setItem('undanganBali_overrides', JSON.stringify(domOverrides));
      if (photo) {
        localStorage.setItem('undanganBali_photo', photo);
      } else {
        localStorage.removeItem('undanganBali_photo');
      }
      
      displayToast('Undangan berhasil disimpan! 🎉', 'success');
      
      setTimeout(() => {
        router.push('/preview');
      }, 1500);
    } catch (e) {
      displayToast('Gagal menyimpan. Coba lagi.', 'error');
    }
  };

  const formattedDate = formData.weddingDate 
    ? new Date(formData.weddingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Tanggal Pernikahan';

  return (
    <>
      <div className="editor container bali-pattern-bg" id="editorLayout" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
        
        {/* LEFT: Live Preview */}
        <div className="editor__preview">
          <div className="editor__preview-frame bali-frame" id="previewFrame">
            {(() => {
              const config = templatesData.find(t => t.id === template || (t as any).slug === template);
              
              if (config?.type === 'html' || config?.type === 'html-js') {
                return <HtmlAdapter templateId={template} data={formData} photo={photo} timeLeft={timeLeft} domOverrides={domOverrides} />;
              }

              if (template === 'agung' || !template) {
                return <AgungTemplate data={formData} photo={photo} timeLeft={timeLeft} />;
              }

              return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p>Template <strong>{template}</strong> belum tersedia.</p>
                  <p style={{ fontSize: '0.8rem', color: 'gray' }}>Silakan buat komponennya di `src/components/templates/` atau tambahkan HTML di `/public/templates/`</p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* RIGHT: Edit Panel */}
        <div className="editor__panel">
          <div className="editor__panel-card">
            <h2 className="editor__panel-title">✏️ Edit Undangan</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: '-20px', marginBottom: 'var(--space-6)' }}>
              Template: <strong style={{ color: 'var(--accent-gold)', textTransform: 'capitalize' }}>{template}</strong>
            </p>

            <div className="editor__tabs" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <button className={`editor__tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>👤 Info</button>
              <button className={`editor__tab ${activeTab === 'foto' ? 'active' : ''}`} onClick={() => setActiveTab('foto')}>📸 Foto</button>
              <button className={`editor__tab ${activeTab === 'acara' ? 'active' : ''}`} onClick={() => setActiveTab('acara')}>📍 Acara</button>
              <button className={`editor__tab ${activeTab === 'desain' ? 'active' : ''}`} onClick={() => setActiveTab('desain')}>🎨 Desain</button>
              <button className={`editor__tab ${activeTab === 'visual' ? 'active' : ''}`} style={{ border: '1px dashed #0070f3', color: activeTab === 'visual' ? 'white' : '#0070f3', backgroundColor: activeTab === 'visual' ? '#0070f3' : 'transparent' }} onClick={() => setActiveTab('visual')}>✨ Visual Edit</button>
            </div>

            {/* TAB: INFO */}
            {activeTab === 'info' && (
              <div className="editor__tab-content active" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
                <div className="form-group">
                  <label className="form-group__label">Nama Mempelai Pria</label>
                  <input type="text" name="groomName" className="form-group__input" placeholder="Contoh: I Putu Agus Rama" value={formData.groomName} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Nama Mempelai Wanita</label>
                  <input type="text" name="brideName" className="form-group__input" placeholder="Contoh: Ni Kadek Dewi Sari" value={formData.brideName} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Tanggal Pernikahan</label>
                  <input type="date" name="weddingDate" className="form-group__input" value={formData.weddingDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Lokasi Utama</label>
                  <input type="text" name="mainVenue" className="form-group__input" placeholder="Contoh: Puri Saren, Ubud, Bali" value={formData.mainVenue} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* TAB: FOTO */}
            {activeTab === 'foto' && (
              <div className="editor__tab-content active" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
                <div className="form-group">
                  <label className="form-group__label">Foto Pasangan</label>
                  <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                    <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                    {!photo ? (
                      <div>
                        <p className="upload-area__icon">📸</p>
                        <p className="upload-area__text"><span>Klik untuk upload</span></p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>Format: JPG, PNG, WebP · Maks. 5MB</p>
                      </div>
                    ) : (
                      <div className="upload-area__preview active">
                        <img src={photo} alt="Preview" />
                        <button className="remove-btn" onClick={removePhoto}>✕</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ACARA */}
            {activeTab === 'acara' && (
              <div className="editor__tab-content active" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
                <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)' }}>Akad / Pawiwahan</p>
                <div className="form-group">
                  <label className="form-group__label">Waktu Akad</label>
                  <input type="text" name="akadTime" className="form-group__input" placeholder="Contoh: 09:00 WITA - Selesai" value={formData.akadTime} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Tempat Akad</label>
                  <input type="text" name="akadVenue" className="form-group__input" placeholder="Contoh: Pura Keluarga, Br. Taman" value={formData.akadVenue} onChange={handleInputChange} />
                </div>
                <div className="bali-divider bali-divider--sm" style={{ margin: 'var(--space-4) 0' }}><img src="/images/ornaments/divider.png" alt="" /></div>
                
                <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)' }}>Resepsi</p>
                <div className="form-group">
                  <label className="form-group__label">Waktu Resepsi</label>
                  <input type="text" name="resepsiTime" className="form-group__input" placeholder="Contoh: 18:00 WITA - Selesai" value={formData.resepsiTime} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Tempat Resepsi</label>
                  <input type="text" name="resepsiVenue" className="form-group__input" placeholder="Contoh: The Royal Pita Maha, Ubud" value={formData.resepsiVenue} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* TAB: DESAIN */}
            {activeTab === 'desain' && (
              <div className="editor__tab-content active" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
                <div className="form-group">
                  <label className="form-group__label">Warna Aksen</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                    {['#d4a574', '#e8c87a', '#8b1a2b', '#2ecc71', '#c0a0e0'].map(color => (
                      <button 
                        key={color}
                        onClick={() => setFormData(prev => ({ ...prev, accentColor: color }))}
                        style={{
                          width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: color, cursor: 'pointer', transition: 'all 0.3s',
                          border: formData.accentColor === color ? `3px solid var(--text-primary)` : '3px solid transparent'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
                  <label className="form-group__label">Gaya Font Nama</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {[
                      { label: "Great Vibes — Contoh Nama", value: "'Great Vibes', cursive", size: "var(--text-xl)" },
                      { label: "Playfair Display — Contoh Nama", value: "'Playfair Display', serif", size: "var(--text-lg)" },
                      { label: "Inter Light — Contoh Nama", value: "'Inter', sans-serif", size: "var(--text-lg)" }
                    ].map(font => (
                      <button
                        key={font.value}
                        onClick={() => setFormData(prev => ({ ...prev, fontFamily: font.value }))}
                        style={{
                          padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                          fontFamily: font.value, fontSize: font.size,
                          border: formData.fontFamily === font.value ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                          color: formData.fontFamily === font.value ? 'var(--accent-gold)' : 'var(--text-primary)'
                        }}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
                  <label className="form-group__label">Greeting / Salam Pembuka</label>
                  <select className="form-group__input" name="greeting" value={formData.greeting} onChange={handleInputChange} style={{ cursor: 'pointer' }}>
                    <option value="Om Swastyastu">Om Swastyastu (Hindu Bali)</option>
                    <option value="Bismillahirrahmanirrahim">Bismillahirrahmanirrahim</option>
                    <option value="Assalamualaikum">Assalamualaikum Wr. Wb.</option>
                    <option value="Dengan Hormat">Dengan Hormat</option>
                    <option value="Our Journey Begins">Our Journey Begins</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB: VISUAL EDIT */}
            {activeTab === 'visual' && (
              <div className="editor__tab-content active" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>Mode Visual Builder Aktif</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    Silakan klik elemen apa saja di dalam preview (di sebelah kiri) untuk mengedit kontennya di sini.
                  </p>
                </div>

                {selectedElement ? (
                  <div className="form-group" style={{ animation: 'fadeIn 0.3s ease forwards' }}>
                    <label className="form-group__label">
                      Edit Elemen: <code style={{ fontSize: '0.75rem', background: '#eee', padding: '2px 4px', borderRadius: '4px' }}>{selectedElement.tagName}</code>
                    </label>
                    
                    {selectedElement.tagName === 'IMG' ? (
                      <div className="upload-area">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleVisualImageUpload}
                          style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }}
                        />
                        <div style={{ padding: '1rem', textAlign: 'center' }}>
                          <p style={{ margin: '0 0 10px 0' }}>📸 Ganti Gambar</p>
                          <img src={selectedElement.content} alt="Selected" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }} />
                        </div>
                      </div>
                    ) : (
                      <textarea
                        className="form-group__input"
                        style={{ minHeight: '100px', resize: 'vertical' }}
                        value={selectedElement.content}
                        onChange={(e) => handleVisualEdit(e.target.value)}
                        placeholder="Ketik teks di sini..."
                      />
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>🖱️</span>
                    <p style={{ fontSize: '0.9rem' }}>Belum ada elemen yang dipilih.</p>
                  </div>
                )}

                {detectedSections.length > 0 && (
                  <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>Struktur Halaman</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Klik untuk melompat ke bagian (*section*):</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {detectedSections.map(sec => (
                        <button 
                          key={sec.id}
                          onClick={() => scrollToSection(sec.id)}
                          style={{ 
                            padding: '8px 12px', 
                            textAlign: 'left', 
                            background: 'white', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          📍 {sec.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="editor__actions" style={{ marginTop: 'var(--space-8)' }}>
              <Link href="/preview" className="btn btn--secondary btn--lg">👁️ Preview</Link>
              <button className="btn btn--primary btn--lg" onClick={handleSave}>💾 Simpan & Bagikan</button>
            </div>
          </div>
        </div>
      </div>

      {showToast.show && (
        <div className={`toast toast--${showToast.type} show`}>
          <span>{showToast.message}</span>
        </div>
      )}
    </>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="container" style={{paddingTop: '150px'}}>Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
