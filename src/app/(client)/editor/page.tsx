"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
import HtmlAdapter from "@/components/templates/HtmlAdapter";
import { TEMPLATES, TemplateConfig } from "@/config/templates";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faCalendarAlt, faClock } from "@fortawesome/free-solid-svg-icons";

// UX-H — Color palette with descriptive visible labels
const ACCENT_COLORS = [
  { value: '#b69d74', label: 'Emas Klasik' },
  { value: '#c9a96e', label: 'Bronze Hangat' },
  { value: '#7d3c4a', label: 'Burgundy Elegan' },
  { value: '#b08d8d', label: 'Dusty Rose' },
  { value: '#5c4033', label: 'Cokelat Tua' },
];

// UX Improvement — Map HTML tags to readable labels for non-technical users
const getReadableTagName = (tagName: string) => {
  const map: Record<string, string> = {
    'P': 'Teks Paragraf',
    'H1': 'Judul Utama',
    'H2': 'Sub Judul',
    'H3': 'Sub Judul Kecil',
    'H4': 'Sub Judul Kecil',
    'H5': 'Sub Judul Kecil',
    'H6': 'Sub Judul Kecil',
    'SPAN': 'Teks Pendek',
    'DIV': 'Blok Konten',
    'A': 'Tautan / Tombol',
    'IMG': 'Gambar / Foto'
  };
  return map[tagName.toUpperCase()] || 'Teks Terpilih';
};

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = searchParams.get('template') || 'agung';
  const { isLoggedIn, isInitialized, user } = useAuth();
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
  const [isMobileEditPanelOpen, setIsMobileEditPanelOpen] = useState(false);

  // Auth guard redirect
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent('/editor?template=' + template)}`);
    }
  }, [isLoggedIn, isInitialized, router, template]);

  const [activeTab, setActiveTab] = useState("info");
  const [showToast, setShowToast] = useState({ show: false, message: "", type: "success" });
  const [showSavedMsg, setShowSavedMsg] = useState(false);
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
  const [domOverrides, setDomOverrides] = useState<Record<string, any>>({});
  const [selectedElement, setSelectedElement] = useState<{ selector: string; content: string; htmlTemplate?: string; tagName: string; fontFamily?: string; fontSize?: string; linkHref?: string } | null>(null);
  const [detectedSections, setDetectedSections] = useState<{ id: string; name: string }[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Separate try/catch for each localStorage read
  useEffect(() => {
    const userKey = user?.email ? `${user.email}_` : '';
    const dataKey = template ? `undanganBali_data_${userKey}${template}` : `undanganBali_data_${userKey}default`;
    const photoKey = template ? `undanganBali_photo_${userKey}${template}` : `undanganBali_photo_${userKey}default`;
    const overrideKey = template ? `undanganBali_overrides_${userKey}${template}` : `undanganBali_overrides_${userKey}default`;

    try {
      const savedData = localStorage.getItem(dataKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed) {
          for (const key in parsed) {
            if (typeof parsed[key] === 'string' && (parsed[key].includes('<img') || parsed[key].includes('c.tagName'))) {
              if (key === 'groomName') parsed[key] = 'Gus Arya';
              else if (key === 'brideName') parsed[key] = 'Gus Yura';
              else parsed[key] = '';
            }
          }
        }
        setFormData(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Gagal memuat data form tersimpan:', e);
    }

    try {
      const savedPhoto = localStorage.getItem(photoKey);
      if (savedPhoto) {
        setPhoto(savedPhoto);
      }
    } catch (e) {
      console.warn('Gagal memuat foto tersimpan:', e);
    }

    try {
      const savedOverrides = localStorage.getItem(overrideKey);
      if (savedOverrides) {
        setDomOverrides(JSON.parse(savedOverrides));
      }
    } catch (e) {
      console.warn('Gagal memuat visual overrides tersimpan:', e);
    }
  }, [template, user?.email]);

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
      // Allow any origin since srcDoc iframes can have varying origin implementations (null, empty, or parent origin)
      const msg = event.data;
      if (msg.type === 'ELEMENT_CLICKED') {
        setSelectedElement({ selector: msg.selector, content: msg.content, htmlTemplate: msg.htmlTemplate, tagName: msg.tagName, fontFamily: msg.fontFamily || '', fontSize: msg.fontSize || '', linkHref: msg.linkHref || '' });
        setActiveTab('visual');
      }
      if (msg.type === 'SECTIONS_DETECTED') {
        setDetectedSections(msg.sections);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleVisualElementChange = (updates: { content?: string; fontFamily?: string; fontSize?: string; linkHref?: string }) => {
    if (!selectedElement) return;

    // Apply HTML template if present
    let finalContent = updates.content !== undefined ? updates.content : selectedElement.content;
    if (updates.content !== undefined && selectedElement.htmlTemplate && selectedElement.htmlTemplate !== '{TEXT}') {
      finalContent = selectedElement.htmlTemplate.replace('{TEXT}', updates.content);
    }

    setDomOverrides(prev => {
      const existing = prev[selectedElement.selector];
      let newOverride = typeof existing === 'string' ? { content: existing } : { ...existing };

      if (updates.content !== undefined) newOverride.content = finalContent;
      if (updates.fontFamily !== undefined) newOverride.fontFamily = updates.fontFamily;
      if (updates.fontSize !== undefined) newOverride.fontSize = updates.fontSize;
      if (updates.linkHref !== undefined) newOverride.linkHref = updates.linkHref;

      return {
        ...prev,
        [selectedElement.selector]: newOverride
      };
    });

    setSelectedElement(prev => prev ? {
      ...prev,
      content: updates.content !== undefined ? updates.content : prev.content,
      fontFamily: updates.fontFamily !== undefined ? updates.fontFamily : prev.fontFamily,
      fontSize: updates.fontSize !== undefined ? updates.fontSize : prev.fontSize,
      linkHref: updates.linkHref !== undefined ? updates.linkHref : prev.linkHref
    } : null);
    setIsDirty(true);

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_ELEMENT',
        selector: selectedElement.selector,
        ...updates,
        content: finalContent
      }, '*');
    }
  };

  const scrollToSection = (id: string, index?: number) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SCROLL_TO_SECTION',
        id: id
      }, '*');
    }
    if (typeof index === 'number') {
      setCurrentSectionIndex(index);
    } else {
      const idx = detectedSections.findIndex(s => s.id === id);
      if (idx !== -1) setCurrentSectionIndex(idx);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      const newIndex = currentSectionIndex - 1;
      scrollToSection(detectedSections[newIndex].id, newIndex);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < detectedSections.length - 1) {
      const newIndex = currentSectionIndex + 1;
      scrollToSection(detectedSections[newIndex].id, newIndex);
    }
  };

  const forceOpenInvitation = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'FORCE_OPEN' }, '*');
      if (detectedSections.length > 1) setCurrentSectionIndex(1);
    }
  };

  const forceCloseInvitation = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'FORCE_CLOSE' }, '*');
      if (detectedSections.length > 0) setCurrentSectionIndex(0);
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

        const base64Data = await fileToBase64(file);

        handleVisualElementChange({ content: base64Data });
        displayToast('Foto berhasil ditambahkan! ✨', 'success');
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

  // Convert file to Base64 with compression to prevent QuotaExceededError
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

      const base64Data = await fileToBase64(file);

      setPhoto(base64Data);
      setIsDirty(true);
      displayToast('Foto berhasil ditambahkan! ✨', 'success');
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
      setIsUploading(true);
      displayToast('Sedang memproses & mengunggah gambar...', 'success');
      const base64Data = await fileToBase64(file);
      setPhoto(base64Data);
      setIsDirty(true);
      displayToast('Foto berhasil ditambahkan! 📸', 'success');
    } catch (err) {
      console.error('Error uploading image on drop:', err);
      displayToast('Gagal memproses foto.', 'error');
    } finally {
      setIsUploading(false);
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
      const userKey = user?.email ? `${user.email}_` : '';
      const dataKey = template ? `undanganBali_data_${userKey}${template}` : `undanganBali_data_${userKey}default`;
      const photoKey = template ? `undanganBali_photo_${userKey}${template}` : `undanganBali_photo_${userKey}default`;
      const overrideKey = template ? `undanganBali_overrides_${userKey}${template}` : `undanganBali_overrides_${userKey}default`;

      localStorage.setItem(dataKey, JSON.stringify(formData));
      localStorage.setItem(overrideKey, JSON.stringify(domOverrides));
      localStorage.setItem('undanganBali_template', template);
      if (photo) {
        localStorage.setItem(photoKey, photo);
      } else {
        localStorage.removeItem(photoKey);
      }
      setIsDirty(false); // UX-G — Reset dirty state after save
      return true;
    } catch (e) {
      console.error('LocalStorage save error:', e);
      displayToast('Gagal menyimpan data. Penyimpanan browser penuh. Coba hapus/ganti foto.', 'error');
      return false;
    }
  }, [formData, domOverrides, template, photo, displayToast, user?.email]);

  // Fitur Auto-Save (Debounce 1.5 detik)
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      const success = saveToLocalStorage();
      if (success) {
        setShowSavedMsg(true);
        setTimeout(() => setShowSavedMsg(false), 3000); // Hilang otomatis setelah 3 detik
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isDirty, saveToLocalStorage]);

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

  // UX-O — Calculate progress
  const requiredFields = ['groomName', 'brideName', 'weddingDate', 'mainVenue', 'akadDate', 'akadTime', 'akadVenue'];
  const filledCount = requiredFields.filter(f => formData[f as keyof typeof formData]?.trim() !== '').length;
  const progressPercent = Math.round((filledCount / requiredFields.length) * 100);

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
    <div className="bali-pattern-bg" style={{ height: "100vh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* UX-N — Minimalist Header for Editor Mode */}
      <header className="editor__header" style={{ flexShrink: 0 }}>
        <div className="editor__header-left">
          <span className="editor__logo">Undangan Bali</span>
          <span className="editor__template-name">
            <span className="hide-text-mobile">Mengedit: </span>
            <span className="template-label">{template}</span>
          </span>
        </div>

        <div className="editor__header-right">
          <div className="editor__status-container">
            {isDirty ? (
              <span className="editor__status editor__status--dirty" title="Perubahan belum disimpan">
                <span className="status-dot"></span>
                <span className="hide-text-mobile">Belum disimpan</span>
              </span>
            ) : (
              <span className="editor__status editor__status--saved" title="Tersimpan otomatis">
                <span className="status-dot"></span>
                <span className="hide-text-mobile">Tersimpan otomatis</span>
              </span>
            )}
          </div>
          <button
            className="editor__btn-keluar"
            onClick={() => {
              if (isDirty) {
                if (window.confirm('Ada perubahan yang belum disimpan. Yakin ingin keluar?')) {
                  router.push('/');
                }
              } else {
                router.push('/');
              }
            }}
          >
            Keluar
          </button>
        </div>
      </header>

      <div className="editor container" id="editorLayout" style={{ paddingTop: "32px", paddingBottom: "32px", flex: 1, minHeight: 0, overflow: "hidden" }}>

        <div className="editor__preview" style={{ height: '100%', alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={`editor__preview-frame bali-frame${activeTab === 'visual' && isVisualEditSupported ? ' editor__preview-frame--visual-active' : ''}`} id="previewFrame" style={{ flex: 1, minHeight: 0, width: '100%', maxWidth: '430px', maxHeight: 'min(750px, 100%)' }}>
            {/* UX-C — Show skeleton during CMS load */}
            {isLoadingTemplates ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '2rem auto' }}></div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Memuat template...</p>
              </div>
            ) : (() => {
              if (currentTemplateConfig?.type === 'html' || currentTemplateConfig?.type === 'html-js') {
                return <HtmlAdapter ref={iframeRef} templateId={template} data={formData} photo={photo} timeLeft={timeLeft} domOverrides={domOverrides} isEditable={true} />;
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
          {activeTab === 'visual' && detectedSections.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px',
              padding: '16px 0'
            }}>
              <button
                onClick={handlePrevSection}
                disabled={currentSectionIndex === 0}
                aria-label="Elemen sebelumnya"
                style={{
                  border: 'none',
                  background: 'var(--bg-elevated)',
                  cursor: currentSectionIndex === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  color: currentSectionIndex === 0 ? '#ccc' : 'var(--accent-gold, #cda75f)',
                  lineHeight: 1
                }}
                title="Elemen Sebelumnya"
              >
                ‹
              </button>

              {currentSectionIndex === 0 ? (
                <button
                  onClick={forceOpenInvitation}
                  style={{
                    border: 'none',
                    background: 'var(--accent-gold, #cda75f)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '10px 20px',
                    borderRadius: '24px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(205, 167, 95, 0.4)'
                  }}
                  title="Buka Undangan"
                >
                  <i className="fa-solid fa-envelope-open-text"></i>
                  Buka
                </button>
              ) : (
                <button
                  onClick={forceCloseInvitation}
                  style={{
                    border: 'none',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '10px 20px',
                    borderRadius: '24px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  title="Kembali ke Halaman Depan"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  Kembali
                </button>
              )}

              <button
                onClick={handleNextSection}
                disabled={currentSectionIndex === detectedSections.length - 1}
                aria-label="Elemen berikutnya"
                style={{
                  border: 'none',
                  background: 'var(--bg-elevated)',
                  cursor: currentSectionIndex === detectedSections.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  color: currentSectionIndex === detectedSections.length - 1 ? '#ccc' : 'var(--accent-gold, #cda75f)',
                  lineHeight: 1
                }}
                title="Elemen Berikutnya"
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* Mobile Floating Edit Button */}
        <button
          className="mobile-edit-fab"
          onClick={() => setIsMobileEditPanelOpen(true)}
          title="Buka Panel Edit"
        >
          <i className="fa-solid fa-pencil"></i> Edit
        </button>

        {/* RIGHT (desktop) / TOP (mobile): Edit Panel */}
        <div className={`editor__panel ${isMobileEditPanelOpen ? 'editor__panel--mobile-open' : ''}`} id="editPanel" style={{ height: '100%', alignSelf: 'stretch' }}>
          <div className="editor__panel-card" style={{ height: '100%', maxHeight: 'min(750px, 100%)', display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* UX-A — Back button and Mobile Close Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <Link href="/templates" className="editor__back-link" style={{ marginBottom: 0 }}>
                ← Pilih Template Lain
              </Link>
              <button
                className="mobile-close-panel-btn"
                onClick={() => setIsMobileEditPanelOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.2rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <h2 className="editor__panel-title" style={{ marginTop: 0 }}><FontAwesomeIcon icon={faPencil} /> Edit Undangan</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: '-20px', marginBottom: 'var(--space-6)' }}>
              Template: <strong style={{ color: 'var(--accent-gold)', textTransform: 'capitalize' }}>{template}</strong>
              {isDirty ? (
                <span style={{ marginLeft: '8px', color: 'var(--error)', fontSize: 'var(--text-xs)' }}>● belum disimpan</span>
              ) : showSavedMsg ? (
                <span style={{ marginLeft: '8px', color: '#10b981', fontSize: 'var(--text-xs)' }}>✓ tersimpan otomatis</span>
              ) : null}
            </p>

            {/* UX-O — Progress Indicator */}
            <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Kelengkapan Data</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filledCount} dari {requiredFields.length} selesai ({progressPercent}%)</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: progressPercent === 100 ? '#10b981' : 'var(--accent-gold)', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="editor__tabs" role="tablist" aria-label="Panel editor" style={{ flexWrap: 'wrap', gap: '8px' }}>
              {[
                { id: 'info', label: 'Info' },
                { id: 'acara', label: 'Acara' },
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
                Visual Edit
              </button>
            </div>

            {/* TAB: INFO — UX-F per-field validation */}
            {activeTab === 'info' && (
              <div className="editor__tab-content scroll-fade-container" role="tabpanel" id="tabpanel-info" aria-labelledby="tab-info" style={{ position: 'relative', overflowY: 'auto', paddingBottom: '2rem' }}>
                <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)' }}>Data Mempelai Pria</p>
                <div className={`form-group${fieldErrors.groomName ? ' form-group--error' : ''}`}>
                  <label className="form-group__label">Nama Mempelai Pria *</label>
                  <input type="text" name="groomName" className="form-group__input" placeholder="Contoh: I Putu Agus Rama" value={formData.groomName} onChange={handleInputChange} />
                  {fieldErrors.groomName && <p className="form-group__error-msg">⚠ {fieldErrors.groomName}</p>}
                </div>
                <div className="form-group">
                  <label className="form-group__label">Nama Orangtua Pria</label>
                  <input type="text" name="groomParents" className="form-group__input" placeholder="Putra dari Bpk... & Ibu..." value={formData.groomParents} onChange={handleInputChange} />
                </div>

                <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', margin: 'var(--space-6) 0 var(--space-4)' }}>Data Mempelai Wanita</p>
                <div className={`form-group${fieldErrors.brideName ? ' form-group--error' : ''}`}>
                  <label className="form-group__label">Nama Mempelai Wanita *</label>
                  <input type="text" name="brideName" className="form-group__input" placeholder="Contoh: Ni Kadek Dewi Sari" value={formData.brideName} onChange={handleInputChange} />
                  {fieldErrors.brideName && <p className="form-group__error-msg">⚠ {fieldErrors.brideName}</p>}
                </div>
                <div className="form-group">
                  <label className="form-group__label">Nama Orangtua Wanita</label>
                  <input type="text" name="brideParents" className="form-group__input" placeholder="Putri dari Bpk... & Ibu..." value={formData.brideParents} onChange={handleInputChange} />
                </div>

                <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', margin: 'var(--space-6) 0 var(--space-4)' }}>Waktu & Lokasi Utama</p>
                <div className="form-group">
                  <label className="form-group__label">Tanggal Pernikahan (Umum)</label>
                  <div style={{ position: 'relative' }}>
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                    <input type="date" name="weddingDate" className="form-group__input" style={{ cursor: 'pointer', paddingLeft: '44px' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.weddingDate} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-group__label">Lokasi Utama</label>
                  <input type="text" name="mainVenue" className="form-group__input" placeholder="Contoh: Puri Saren, Ubud, Bali" value={formData.mainVenue} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* TAB: ACARA */}
            {activeTab === 'acara' && (
              <div className="editor__tab-content" role="tabpanel" id="tabpanel-acara" aria-labelledby="tab-acara">
                <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)' }}>Akad / Pawiwahan</p>
                <div className="form-group">
                  <label className="form-group__label">Tanggal Akad</label>
                  <div style={{ position: 'relative' }}>
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                    <input type="date" name="akadDate" className="form-group__input" style={{ cursor: 'pointer', paddingLeft: '44px' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.akadDate} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-group__label">Waktu Akad</label>
                  <div style={{ position: 'relative' }}>
                    <FontAwesomeIcon icon={faClock} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                    <input type="time" name="akadTime" className="form-group__input" style={{ cursor: 'pointer', paddingLeft: '44px' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.akadTime} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-group__label">Tempat Akad</label>
                  <input type="text" name="akadVenue" className="form-group__input" placeholder="Contoh: Pura Keluarga, Br. Taman" value={formData.akadVenue} onChange={handleInputChange} />
                </div>
                {/* <div className="bali-divider bali-divider--sm" style={{ margin: 'var(--space-4) 0' }}><img src="/images/ornaments/divider.png" alt="" /></div> */}
                <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)' }}>Resepsi</p>
                <div className="form-group">
                  <label className="form-group__label">Tanggal Resepsi</label>
                  <div style={{ position: 'relative' }}>
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                    <input type="date" name="resepsiDate" className="form-group__input" style={{ cursor: 'pointer', paddingLeft: '44px' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.resepsiDate} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-group__label">Waktu Resepsi</label>
                  <div style={{ position: 'relative' }}>
                    <FontAwesomeIcon icon={faClock} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                    <input type="time" name="resepsiTime" className="form-group__input" style={{ cursor: 'pointer', paddingLeft: '44px' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.resepsiTime} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-group__label">Tempat Resepsi</label>
                  <input type="text" name="resepsiVenue" className="form-group__input" placeholder="Contoh: The Royal Pita Maha, Ubud" value={formData.resepsiVenue} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* TAB: DESAIN DIHAPUS (Font dipindah ke Visual Edit) */}

            {/* TAB: VISUAL EDIT */}
            {activeTab === 'visual' && (
              <div className="editor__tab-content" role="tabpanel" id="tabpanel-visual" aria-labelledby="tab-visual">
                {!isVisualEditSupported ? (
                  <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--accent-gold-pale)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-gold)', textAlign: 'center' }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>🎨</span>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Visual Edit Belum Tersedia</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Fitur Visual Edit saat ini hanya tersedia untuk template bertipe HTML-JS.
                      Gunakan tab <strong>Info</strong>, <strong>Acara</strong>, dan <strong>Font</strong> untuk mengedit undangan Anda.
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
                          Edit Elemen: <code style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px' }}>{getReadableTagName(selectedElement.tagName)}</code>
                        </label>

                        {selectedElement.tagName === 'IMG' ? (
                          <div className="visual-upload-area">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleVisualImageUpload}
                              disabled={isUploading}
                            />

                            {selectedElement.content ? (
                              <div className="visual-upload-image-preview">
                                <img
                                  src={selectedElement.content.startsWith('url')
                                    ? selectedElement.content.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '')
                                    : selectedElement.content}
                                  alt="Selected"
                                />
                                <div className="visual-upload-overlay">
                                  <span className="visual-upload-badge">Ganti Foto</span>
                                </div>
                              </div>
                            ) : (
                              <div style={{ padding: '1.5rem', background: 'var(--bg-elevated)', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                                <span style={{ fontSize: '1.5rem' }}>📸</span>
                              </div>
                            )}

                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Upload Gambar Baru</h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Klik atau seret gambar ke area ini.</p>
                          </div>
                        ) : (
                          <>
                            <textarea
                              className="form-group__input"
                              style={{ minHeight: '100px', resize: 'vertical' }}
                              value={selectedElement.content}
                              onChange={(e) => handleVisualElementChange({ content: e.target.value })}
                              placeholder="Contoh: Atas asung kertha wara nugraha Ida Sang Hyang Widhi Wasa..."
                            />
                            {selectedElement.tagName === 'A' && (
                              <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                                <label className="form-group__label">Link URL (Tujuan)</label>
                                <input
                                  type="text"
                                  className="form-group__input"
                                  value={selectedElement.linkHref || ''}
                                  onChange={(e) => handleVisualElementChange({ linkHref: e.target.value })}
                                  placeholder="Contoh: https://wa.me/6281234..."
                                />
                              </div>
                            )}

                            <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                              <label className="form-group__label">Ganti Font</label>
                              <select
                                className="form-group__input"
                                value={selectedElement.fontFamily || ''}
                                onChange={(e) => handleVisualElementChange({ fontFamily: e.target.value })}
                                style={{ cursor: 'pointer', fontFamily: selectedElement.fontFamily }}
                              >
                                <option value="">Gaya Font Default</option>
                                <option value="'Great Vibes', cursive" style={{ fontFamily: "'Great Vibes', cursive" }}>Great Vibes</option>
                                <option value="'Playfair Display', serif" style={{ fontFamily: "'Playfair Display', serif" }}>Playfair Display</option>
                                <option value="'Inter', sans-serif" style={{ fontFamily: "'Inter', sans-serif" }}>Inter</option>
                                <option value="'Montserrat', sans-serif" style={{ fontFamily: "'Montserrat', sans-serif" }}>Montserrat</option>
                                <option value="'Cinzel', serif">Cinzel (Elegan)</option>
                                <option value="'Outfit', sans-serif">Outfit (Modern)</option>
                              </select>
                            </div>

                            <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                              <label className="form-group__label">Ukuran Font</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
                                <button
                                  className="btn"
                                  style={{ padding: '4px 12px', minWidth: '36px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: 'none', borderRadius: '4px' }}
                                  onClick={() => {
                                    const currentSize = parseFloat(selectedElement.fontSize || '16');
                                    handleVisualElementChange({ fontSize: `${Math.max(8, currentSize - 1)}px` });
                                  }}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={parseFloat(selectedElement.fontSize || '16')}
                                  onChange={(e) => handleVisualElementChange({ fontSize: `${e.target.value}px` })}
                                  style={{ width: '50px', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 600, outline: 'none' }}
                                />
                                <button
                                  className="btn"
                                  style={{ padding: '4px 12px', minWidth: '36px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: 'none', borderRadius: '4px' }}
                                  onClick={() => {
                                    const currentSize = parseFloat(selectedElement.fontSize || '16');
                                    handleVisualElementChange({ fontSize: `${currentSize + 1}px` });
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </>
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
                          {detectedSections.map((sec, idx) => (
                            <button
                              key={sec.id}
                              onClick={() => scrollToSection(sec.id, idx)}
                              style={{
                                padding: '8px 12px',
                                textAlign: 'left',
                                background: currentSectionIndex === idx ? 'var(--accent-gold, #cda75f)' : 'var(--bg-elevated)',
                                color: currentSectionIndex === idx ? 'white' : 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s'
                              }}
                            >
                              {sec.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Premium Sticky Action Footer */}
            <div className="editor__actions">
              <button
                className={`btn btn--secondary btn--lg ${isSaving || isUploading ? 'disabled' : ''}`}
                onClick={handlePreview}
                disabled={isSaving || isUploading}
                title="Lihat Tampilan Penuh"
                style={{
                  borderRadius: '12px',
                  borderWidth: '2px',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                Preview
              </button>

              <button
                className={`btn btn--primary btn--lg ${isSaving || isUploading ? 'loading' : ''}`}
                onClick={handleSave}
                disabled={isSaving || isUploading}
                title="Simpan & Bagikan Undangan"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-gold-light) 0%, var(--accent-gold-dark) 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textShadow: '0 1px 2px rgba(0,0,0,0.15)',
                  boxShadow: '0 8px 20px rgba(182, 157, 116, 0.4)'
                }}
              >
                {isSaving ? 'Menyimpan...' : (isUploading ? 'Upload Foto...' : ' SIMPAN & BAGIKAN')}
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
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: '150px' }}>Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}



