"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
// import AgungTemplate from "@/components/templates/AgungTemplate";
import HtmlAdapter from "@/components/templates/HtmlAdapter";
import { TEMPLATES, TemplateConfig } from "@/config/templates";
import { uploadToR2 } from "@/utils/r2Upload";

// UX-H — Color palette with descriptive visible labels
const ACCENT_COLORS = [
  { value: '#b69d74', label: 'Emas Klasik' },
  { value: '#c9a96e', label: 'Bronze Hangat' },
  { value: '#7d3c4a', label: 'Burgundy Elegan' },
  { value: '#b08d8d', label: 'Dusty Rose' },
  { value: '#5c4033', label: 'Cokelat Tua' },
];

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = searchParams.get('template') || 'agung';
  const { isLoggedIn, isInitialized } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // UX-D — Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // UX-C — CMS loading state
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  // UX-G — Dirty tracking for unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  // UX-F — Per-field validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // UX-J — Mobile preview toggle
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Auth guard redirect
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent('/editor?template=' + template)}`);
    }
  }, [isLoggedIn, isInitialized, router, template]);

  const [activeTab, setActiveTab] = useState("info");
  const [showToast, setShowToast] = useState({ show: false, message: "", type: "success" });
  const [templatesData, setTemplatesData] = useState<TemplateConfig[]>(TEMPLATES);
  const [isDragOver, setIsDragOver] = useState(false);

  // UX-C — Merge CMS data with loading state
  useEffect(() => {
    setIsLoadingTemplates(true);
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const localMap = new Map(TEMPLATES.map(t => [t.id, t]));
          data.forEach((t: TemplateConfig) => {
            localMap.set(t.id, t);
          });
          setTemplatesData(Array.from(localMap.values()));
        }
      })
      .catch(err => console.warn('Gagal memuat template dari CMS, menggunakan config lokal:', err.message || err))
      .finally(() => setIsLoadingTemplates(false));
  }, []);

  const [formData, setFormData] = useState({
    groomName: "",
    brideName: "",
    groomParents: "",
    brideParents: "",
    weddingDate: "",
    akadDate: "",
    resepsiDate: "",
    mainVenue: "",
    dressCode: "",
    akadTime: "",
    akadVenue: "",
    resepsiTime: "",
    resepsiVenue: "",
    mapLink: "",
    accentColor: "#b69d74",
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

  // Separate try/catch for each localStorage read
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('undanganBali_data');
      if (savedData) {
        setFormData(prev => ({ ...prev, ...JSON.parse(savedData) }));
      }
    } catch (e) {
      console.warn('Gagal memuat data form tersimpan:', e);
    }

    try {
      const savedPhoto = localStorage.getItem('undanganBali_photo');
      if (savedPhoto) {
        setPhoto(savedPhoto);
      }
    } catch (e) {
      console.warn('Gagal memuat foto tersimpan:', e);
    }

    try {
      const savedOverrides = localStorage.getItem('undanganBali_overrides');
      if (savedOverrides) {
        setDomOverrides(JSON.parse(savedOverrides));
      }
    } catch (e) {
      console.warn('Gagal memuat visual overrides tersimpan:', e);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    const dateStr = formData.akadDate || formData.weddingDate;
    if (!dateStr) return;

    const targetDate = new Date(dateStr + 'T00:00:00').getTime();
    let interval: NodeJS.Timeout;

    const tick = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0 || isNaN(diff)) {
        setTimeLeft({ days: '0', hours: '0', minutes: '0', seconds: '0' });
        if (interval) clearInterval(interval);
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
    interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [formData.weddingDate, formData.akadDate]);

  // Accent color CSS variable
  useEffect(() => {
    const originalColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-gold').trim();
    document.documentElement.style.setProperty('--accent-gold', formData.accentColor);
    return () => {
      document.documentElement.style.setProperty('--accent-gold', originalColor || '#b69d74');
    };
  }, [formData.accentColor]);

  // Forward accent color to iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_ACCENT_COLOR',
        color: formData.accentColor
      }, window.location.origin);
    }
  }, [formData.accentColor]);

  // UX-G — Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        // Modern browsers ignore custom message but still show default prompt
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Visual Builder Message Listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

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

    setDomOverrides(prev => ({
      ...prev,
      [selectedElement.selector]: content
    }));

    setSelectedElement(prev => prev ? { ...prev, content } : null);
    setIsDirty(true);

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_ELEMENT',
        selector: selectedElement.selector,
        content: content
      }, window.location.origin);
    }
  };

  const scrollToSection = (id: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SCROLL_TO_SECTION',
        id: id
      }, window.location.origin);
    }
  };

  const handleVisualImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        displayToast('Ukuran file terlalu besar! Maksimal 5MB.', 'error');
        return;
      }
      try {
        setIsUploading(true);
        displayToast('Sedang memproses & mengunggah gambar...', 'success');

        const compressedBase64 = await compressImage(file);

        // Upload to R2
        const publicUrl = await uploadToR2(compressedBase64, file.name.replace(/\.[^/.]+$/, "") + ".webp");

        if (!publicUrl) {
          throw new Error('Upload to R2 failed');
        }

        handleVisualEdit(publicUrl);
        displayToast('Foto berhasil diunggah! ✨', 'success');
      } catch (err) {
        console.error('Error uploading visual edit image:', err);
        displayToast('Gagal memproses & mengunggah foto.', 'error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  // UX-G — Mark dirty on any input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    // UX-F — Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Utility for client-side image compression to prevent LocalStorage QuotaExceededError
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Max width to ensure small base64 size
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to webp (or jpeg fallback on older browsers), 70% quality
          const dataUrl = canvas.toDataURL('image/webp', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Toast with auto-cancel previous
  const displayToast = useCallback((message: string, type = "success") => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setShowToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => setShowToast({ show: false, message: "", type: "success" }), 3000);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // Increased to 5MB since we compress it anyway, giving users more leeway
      displayToast('Ukuran file terlalu besar! Maksimal 5MB.', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      displayToast('Format file tidak didukung! Gunakan JPG, PNG, atau WebP.', 'error');
      return;
    }

    try {
      setIsUploading(true);
      displayToast('Sedang memproses & mengunggah gambar...', 'success');

      const compressedBase64 = await compressImage(file);

      // Upload to R2 directly via Presigned URL
      const publicUrl = await uploadToR2(compressedBase64, file.name.replace(/\.[^/.]+$/, "") + ".webp");

      if (!publicUrl) {
        throw new Error('Upload to R2 failed');
      }

      setPhoto(publicUrl);
      setIsDirty(true);
      displayToast('Foto berhasil diunggah! ✨', 'success');
    } catch (err) {
      console.error('Error uploading image:', err);
      displayToast('Gagal memproses & mengunggah foto.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      displayToast('Ukuran file terlalu besar! Maksimal 5MB.', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      displayToast('Format file tidak didukung! Gunakan JPG, PNG, atau WebP.', 'error');
      return;
    }

    try {
      const compressedBase64 = await compressImage(file);
      setPhoto(compressedBase64);
      setIsDirty(true);
      displayToast('Foto berhasil diupload & dikompresi! 📸', 'success');
    } catch (err) {
      console.error('Error compressing image on drop:', err);
      displayToast('Gagal memproses foto.', 'error');
    }
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhoto(null);
    setIsDirty(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
    displayToast('Foto berhasil dihapus', 'success');
  };

  const saveToLocalStorage = useCallback((): boolean => {
    try {
      localStorage.setItem('undanganBali_data', JSON.stringify(formData));
      localStorage.setItem('undanganBali_overrides', JSON.stringify(domOverrides));
      localStorage.setItem('undanganBali_template', template);
      if (photo) {
        localStorage.setItem('undanganBali_photo', photo);
      } else {
        localStorage.removeItem('undanganBali_photo');
      }
      setIsDirty(false); // UX-G — Reset dirty state after save
      return true;
    } catch (e) {
      console.error('LocalStorage save error:', e);
      displayToast('Gagal menyimpan data. Penyimpanan browser penuh. Coba hapus/ganti foto.', 'error');
      return false;
    }
  }, [formData, domOverrides, template, photo, displayToast]);

  // UX-F — Validate with per-field errors
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.groomName.trim()) {
      errors.groomName = 'Nama mempelai pria wajib diisi';
    }
    if (!formData.brideName.trim()) {
      errors.brideName = 'Nama mempelai wanita wajib diisi';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Switch to info tab if errors are there
      setActiveTab('info');
      displayToast('Harap lengkapi data yang ditandai merah ⚠️', 'error');
      return false;
    }
    return true;
  }, [formData.groomName, formData.brideName, displayToast]);

  // UX-D — Save with loading state; UX-K — Consistent microcopy
  const handleSave = useCallback(() => {
    if (!validateForm()) return;
    if (isSaving) return;

    setIsSaving(true);
    if (saveToLocalStorage()) {
      displayToast('Data tersimpan! Menuju halaman preview...', 'success');
      setTimeout(() => {
        router.push('/preview');
      }, 1500);
    } else {
      setIsSaving(false);
    }
  }, [validateForm, isSaving, saveToLocalStorage, displayToast, router]);

  // UX-L — Preview with same validation
  const handlePreview = useCallback(() => {
    if (!validateForm()) return;
    if (isSaving) return;

    setIsSaving(true);
    if (saveToLocalStorage()) {
      router.push(`/preview?template=${template}`);
    } else {
      setIsSaving(false);
    }
  }, [validateForm, isSaving, saveToLocalStorage, router, template]);

  // UX-B — Toast for accent color change
  const handleAccentColorChange = useCallback((color: { value: string; label: string }) => {
    setFormData(prev => ({ ...prev, accentColor: color.value }));
    setIsDirty(true);
    displayToast(`Warna diubah: ${color.label} ✓`, 'success');
  }, [displayToast]);

  // UX-B — Toast for font change
  const handleFontChange = useCallback((fontValue: string, fontLabel: string) => {
    setFormData(prev => ({ ...prev, fontFamily: fontValue }));
    setIsDirty(true);
    displayToast(`Font diubah: ${fontLabel.split(' — ')[0]} ✓`, 'success');
  }, [displayToast]);

  const formattedDate = formData.weddingDate
    ? new Date(formData.weddingDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Tanggal Pernikahan';

  const currentTemplateConfig = templatesData.find(t => t.id === template || t.slug === template);
  const isVisualEditSupported = currentTemplateConfig?.type === 'html-js';

  // Loading / auth guard screens
  if (!isInitialized) {
    return (
      <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--text-muted)' }}>Memuat...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <div className="editor container bali-pattern-bg" id="editorLayout" style={{ paddingTop: '30px', paddingBottom: '150px' }}>

        <button
          className="editor__preview-toggle"
          onClick={() => setIsMobilePreviewOpen(prev => !prev)}
          style={{ order: isMobilePreviewOpen ? 0 : 1, marginTop: isMobilePreviewOpen ? 0 : 'var(--space-4)' }}>
          {isMobilePreviewOpen ? '✕ Tutup Preview' : '👁️ Lihat Preview Undangan'}
        </button>

        <div className={`editor__preview${!isMobilePreviewOpen ? ' editor__preview--collapsed' : ''}`}>
          <div className={`editor__preview-frame bali-frame${activeTab === 'visual' && isVisualEditSupported ? ' editor__preview-frame--visual-active' : ''}`} id="previewFrame">
            {/* UX-C — Show skeleton during CMS load */}
            {isLoadingTemplates ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '2rem auto' }}></div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Memuat template...</p>
              </div>
            ) : (() => {
              if (currentTemplateConfig?.type === 'html' || currentTemplateConfig?.type === 'html-js') {
                return <HtmlAdapter ref={iframeRef} templateId={template} data={formData} photo={photo} timeLeft={timeLeft} domOverrides={domOverrides} />;
              }

              // if (template === 'agung' || !template) {
              //   return <AgungTemplate data={formData} photo={photo} timeLeft={timeLeft} />;
              // }

              return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p>Template <strong>{template}</strong> belum tersedia.</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Template ini sedang dalam pengembangan. Silakan pilih template lain.</p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* RIGHT (desktop) / TOP (mobile): Edit Panel */}
        <div className="editor__panel">
          <div className="editor__panel-card">
            {/* UX-A — Back button */}
            <Link href="/templates" className="editor__back-link">
              ← Pilih Template Lain
            </Link>

            <h2 className="editor__panel-title">✏️ Edit Undangan</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: '-20px', marginBottom: 'var(--space-6)' }}>
              Template: <strong style={{ color: 'var(--accent-gold)', textTransform: 'capitalize' }}>{template}</strong>
              {isDirty && <span style={{ marginLeft: '8px', color: 'var(--error)', fontSize: 'var(--text-xs)' }}>● belum disimpan</span>}
            </p>

            {/* Tab navigation */}
            <div className="editor__tabs" role="tablist" aria-label="Panel editor" style={{ flexWrap: 'wrap', gap: '8px' }}>
              {[
                { id: 'info', label: '👤 Info' },
                { id: 'foto', label: '📸 Foto' },
                { id: 'acara', label: '📍 Acara' },
                { id: 'desain', label: '🎨 Desain' },
              ].map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`tabpanel-${tab.id}`}
                  className={`editor__tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
              <button
                role="tab"
                aria-selected={activeTab === 'visual'}
                aria-controls="tabpanel-visual"
                className={`editor__tab ${activeTab === 'visual' ? 'active' : ''}`}
                style={{
                  border: `1px dashed ${isVisualEditSupported ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                  color: activeTab === 'visual' ? 'white' : isVisualEditSupported ? 'var(--accent-gold)' : 'var(--text-muted)',
                  backgroundColor: activeTab === 'visual' ? 'var(--accent-gold)' : 'transparent',
                  opacity: isVisualEditSupported ? 1 : 0.6
                }}
                onClick={() => setActiveTab('visual')}
              >
                ✨ Visual Edit
              </button>
            </div>

            {/* TAB: INFO — UX-F per-field validation */}
            {activeTab === 'info' && (
              <div className="editor__tab-content" role="tabpanel" id="tabpanel-info" aria-labelledby="tab-info">
                <div className={`form-group${fieldErrors.groomName ? ' form-group--error' : ''}`}>
                  <label className="form-group__label">Nama Mempelai Pria *</label>
                  <input type="text" name="groomName" className="form-group__input" placeholder="Contoh: I Putu Agus Rama" value={formData.groomName} onChange={handleInputChange} />
                  {fieldErrors.groomName && <p className="form-group__error-msg">⚠ {fieldErrors.groomName}</p>}
                </div>
                <div className="form-group">
                  <label className="form-group__label">Nama Orangtua Pria</label>
                  <input type="text" name="groomParents" className="form-group__input" placeholder="Putra dari Bpk... & Ibu..." value={formData.groomParents} onChange={handleInputChange} />
                </div>
                <div className={`form-group${fieldErrors.brideName ? ' form-group--error' : ''}`}>
                  <label className="form-group__label">Nama Mempelai Wanita *</label>
                  <input type="text" name="brideName" className="form-group__input" placeholder="Contoh: Ni Kadek Dewi Sari" value={formData.brideName} onChange={handleInputChange} />
                  {fieldErrors.brideName && <p className="form-group__error-msg">⚠ {fieldErrors.brideName}</p>}
                </div>
                <div className="form-group">
                  <label className="form-group__label">Nama Orangtua Wanita</label>
                  <input type="text" name="brideParents" className="form-group__input" placeholder="Putri dari Bpk... & Ibu..." value={formData.brideParents} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Tanggal Pernikahan (Umum)</label>
                  <input type="date" name="weddingDate" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.weddingDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Lokasi Utama</label>
                  <input type="text" name="mainVenue" className="form-group__input" placeholder="Contoh: Puri Saren, Ubud, Bali" value={formData.mainVenue} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* TAB: FOTO */}
            {activeTab === 'foto' && (
              <div className="editor__tab-content" role="tabpanel" id="tabpanel-foto" aria-labelledby="tab-foto">
                <div className="form-group">
                  <label className="form-group__label">Foto Pasangan</label>
                  <div
                    className={`upload-area${isDragOver ? ' dragover' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    tabIndex={0}
                    role="button"
                    aria-label="Upload foto pasangan"
                  >
                    <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                    {!photo ? (
                      <div>
                        <p className="upload-area__icon">📸</p>
                        <p className="upload-area__text"><span>Klik atau seret foto ke sini</span></p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>Format: JPG, PNG, WebP · Maks. 5MB (Otomatis dikompres)</p>
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
              <div className="editor__tab-content" role="tabpanel" id="tabpanel-acara" aria-labelledby="tab-acara">
                <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)' }}>Akad / Pawiwahan</p>
                <div className="form-group">
                  <label className="form-group__label">Tanggal Akad</label>
                  <input type="date" name="akadDate" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.akadDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Waktu Akad</label>
                  <input type="time" name="akadTime" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.akadTime} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Tempat Akad</label>
                  <input type="text" name="akadVenue" className="form-group__input" placeholder="Contoh: Pura Keluarga, Br. Taman" value={formData.akadVenue} onChange={handleInputChange} />
                </div>
                <div className="bali-divider bali-divider--sm" style={{ margin: 'var(--space-4) 0' }}><img src="/images/ornaments/divider.png" alt="" /></div>

                <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)' }}>Resepsi</p>
                <div className="form-group">
                  <label className="form-group__label">Tanggal Resepsi</label>
                  <input type="date" name="resepsiDate" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.resepsiDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Waktu Resepsi</label>
                  <input type="time" name="resepsiTime" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.resepsiTime} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Tempat Resepsi</label>
                  <input type="text" name="resepsiVenue" className="form-group__input" placeholder="Contoh: The Royal Pita Maha, Ubud" value={formData.resepsiVenue} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* TAB: DESAIN — UX-H swatch labels, UX-B toast on change */}
            {activeTab === 'desain' && (
              <div className="editor__tab-content" role="tabpanel" id="tabpanel-desain" aria-labelledby="tab-desain">
                <div className="form-group">
                  <label className="form-group__label">Warna Aksen</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                    {ACCENT_COLORS.map(color => (
                      <button
                        key={color.value}
                        className={`color-swatch${formData.accentColor === color.value ? ' color-swatch--selected' : ''}`}
                        aria-label={`Warna aksen: ${color.label}`}
                        onClick={() => handleAccentColorChange(color)}
                      >
                        <div className="color-swatch__circle" style={{ background: color.value }} />
                        <span className="color-swatch__label">{color.label}</span>
                      </button>
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
                        onClick={() => handleFontChange(font.value, font.label)}
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
              <div className="editor__tab-content" role="tabpanel" id="tabpanel-visual" aria-labelledby="tab-visual">
                {!isVisualEditSupported ? (
                  <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--accent-gold-pale)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-gold)', textAlign: 'center' }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>🎨</span>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Visual Edit Belum Tersedia</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Fitur Visual Edit saat ini hanya tersedia untuk template bertipe HTML-JS.
                      Gunakan tab <strong>Info</strong>, <strong>Foto</strong>, <strong>Acara</strong>, dan <strong>Desain</strong> untuk mengedit undangan Anda.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* UX-E — Visual builder active message */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--accent-gold-pale)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-gold)' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--accent-gold-dark)' }}>✨ Mode Visual Builder Aktif</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Preview di sebelah kiri sekarang <strong>interaktif</strong> — klik langsung pada teks atau gambar apa saja untuk mengeditnya di sini.
                      </p>
                    </div>

                    {selectedElement ? (
                      <div className="form-group" style={{ animation: 'fadeIn 0.3s ease forwards' }}>
                        <label className="form-group__label">
                          Edit Elemen: <code style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px' }}>{selectedElement.tagName}</code>
                        </label>

                        {selectedElement.tagName === 'IMG' ? (
                          <div className="upload-area">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleVisualImageUpload}
                              disabled={isUploading}
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
                        <p style={{ fontSize: '0.8rem' }}>Klik elemen di preview untuk mulai mengedit.</p>
                      </div>
                    )}

                    {detectedSections.length > 0 && (
                      <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>Struktur Halaman</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Klik untuk melompat ke bagian:</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {detectedSections.map(sec => (
                            <button
                              key={sec.id}
                              onClick={() => scrollToSection(sec.id)}
                              style={{
                                padding: '8px 12px',
                                textAlign: 'left',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-color)',
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
                  </>
                )}
              </div>
            )}

            {/* UX-D — Disable buttons during save; UX-K+L — Consistent labels */}
            <div className="editor__actions" style={{ marginTop: 'var(--space-8)' }}>
              <button
                className={`btn btn--secondary btn--lg${isSaving || isUploading ? ' btn--saving' : ''}`}
                onClick={handlePreview}
                disabled={isSaving || isUploading}
                title="Simpan data sementara dan lihat tampilan undangan sebelum membagikan"
              >
                {isSaving ? 'Menyimpan...' : '👁️ LIHAT PREVIEW'}
              </button>
              <button
                className={`btn btn-primary ${isSaving || isUploading ? 'loading' : ''}`}
                onClick={handleSave}
                disabled={isSaving || isUploading}
                title="Simpan data dan lanjutkan ke halaman preview untuk membagikan"
              >
                {isSaving ? 'Menyimpan...' : (isUploading ? 'Mengunggah Foto...' : '💾 SIMPAN & LANJUTKAN')}
              </button>
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
    <Suspense fallback={<div className="container" style={{ paddingTop: '150px' }}>Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
