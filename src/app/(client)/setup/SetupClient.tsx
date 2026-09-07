"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SetupPageClientProps {
  templateId: string | null;
  draftId: string | null;
  initialFeatures: any;
}

function SetupContent({ templateId, draftId, initialFeatures }: SetupPageClientProps) {
  const router = useRouter();
  const { isLoggedIn, isInitialized, user } = useAuth();

  const [formData, setFormData] = useState({
    groomName: "",
    brideName: "",
    groomParents: "",
    brideParents: "",
    groomInstagram: "",
    brideInstagram: "",
    akadDate: "",
    akadTime: "",
    akadVenue: "",
    akadMapUrl: "",
    akadMapKeyword: "",
    resepsiDate: "",
    resepsiTime: "",
    resepsiVenue: "",
    resepsiMapUrl: "",
    resepsiMapKeyword: "",
    countdownDate: "",
    countdownTime: "",
    bank1Name: "",
    bank1No: "",
    bank1Holder: "",
    bank2Name: "",
    bank2No: "",
    bank2Holder: "",
    qrisImage: "",
  });

  // features sekarang sudah tersedia dari server — tidak perlu fetch!
  const [features, setFeatures] = useState<any>(initialFeatures);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Load existing user data from localStorage on mount
  useEffect(() => {
    if (!templateId || !isInitialized || !user?.email) return;

    if (!draftId) {
      const newDraftId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      router.replace(`/setup?template=${templateId}&draftId=${newDraftId}`);
      return;
    }

    try {
      const storageKey = `undanganBali_data_${user.email}_${draftId}`;
      const existingData = localStorage.getItem(storageKey);
      if (existingData) {
        const parsed = JSON.parse(existingData);
        delete parsed.akadMapIframe;
        delete parsed.resepsiMapIframe;
        setFormData(prev => ({
          ...prev,
          ...parsed
        }));
      }
    } catch (e) {
      console.warn("Gagal membaca localStorage", e);
    }
  }, [templateId, draftId, isInitialized, user?.email, router]);

  // Auth guard redirect
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      const currentUrl = `/setup?template=${templateId}${draftId ? `&draftId=${draftId}` : ''}`;
      router.push(`/login?next=${encodeURIComponent(currentUrl)}`);
    }
  }, [isLoggedIn, isInitialized, router, templateId, draftId]);

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
            resolve(canvas.toDataURL('image/webp', 0.7)); // compress to 70% webp
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setFormData((prev) => ({
          ...prev,
          qrisImage: base64,
        }));
      } catch (err) {
        console.error("Gagal memproses gambar QRIS", err);
      }
    }
  };

  const handleDynamicImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setFormData((prev) => ({
          ...prev,
          [key]: base64,
        }));
      } catch (err) {
        console.error("Gagal memproses gambar", err);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!draftId) return;

    // Save to localStorage
    try {
      const userKey = user?.email ? `${user.email}_` : '';
      const storageKey = `undanganBali_data_${userKey}${draftId}`;
      const existingData = localStorage.getItem(storageKey);
      const parsedExisting = existingData ? JSON.parse(existingData) : {};
      const mergedData = { ...parsedExisting, ...formData };
      localStorage.setItem(storageKey, JSON.stringify(mergedData));

      // Update the master drafts list
      if (user?.email) {
        const masterKey = `undanganBali_user_drafts_${user.email}`;
        const masterData = localStorage.getItem(masterKey);
        let drafts = masterData ? JSON.parse(masterData) : [];
        const draftIndex = drafts.findIndex((d: any) => d.draftId === draftId);

        const draftMeta = {
          draftId,
          templateId: templateId || 'agung',
          groomName: formData.groomName,
          brideName: formData.brideName,
          weddingDate: (formData as any).akadDate || "Belum diatur",
          mainVenue: (formData as any).akadVenue || "Belum diatur",
          updatedAt: Date.now()
        };

        if (draftIndex >= 0) {
          drafts[draftIndex] = { ...drafts[draftIndex], ...draftMeta };
        } else {
          drafts.push(draftMeta);
        }
        localStorage.setItem(masterKey, JSON.stringify(drafts));
      }
    } catch (err) {
      console.warn("Gagal menyimpan data setup ke localStorage:", err);
    }

    // Redirect to result page instead of editor
    router.push(`/result?template=${templateId || 'agung'}&draftId=${draftId}`);
  };

  return (
    <div className="section bali-pattern-bg bali-corners" style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '60px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <span className="section-label">Langkah Pertama</span>
            <h1 className="section-title" style={{ fontSize: 'var(--text-4xl)' }}>Lengkapi Data Undangan</h1>
            <p className="section-subtitle">
              Silakan isi data mempelai dan acara di bawah ini. Data akan otomatis dimasukkan ke dalam template undangan Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)', fontSize: '1.5rem' }}>Mempelai Pria</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-group__label">Nama Panggilan Pria *</label>
                <input required type="text" name="groomName" className="form-group__input" placeholder="Contoh: Gus Arya" value={formData.groomName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-group__label">Nama Orangtua Pria *</label>
                <input required type="text" name="groomParents" className="form-group__input" placeholder="Putra dari Bpk... & Ibu..." value={formData.groomParents} onChange={handleChange} />
              </div>
              {(!features || (features.showInstagram !== false && features.showInstagram !== 'false')) && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-group__label">Username Instagram Pria</label>
                  <input type="text" name="groomInstagram" className="form-group__input" placeholder="Contoh: gusarya" value={formData.groomInstagram} onChange={handleChange} />
                </div>
              )}
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)', marginTop: 'var(--space-6)', fontSize: '1.5rem' }}>Mempelai Wanita</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-group__label">Nama Panggilan Wanita *</label>
                <input required type="text" name="brideName" className="form-group__input" placeholder="Contoh: Yura" value={formData.brideName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-group__label">Nama Orangtua Wanita *</label>
                <input required type="text" name="brideParents" className="form-group__input" placeholder="Putri dari Bpk... & Ibu..." value={formData.brideParents} onChange={handleChange} />
              </div>
              {(!features || (features.showInstagram !== false && features.showInstagram !== 'false')) && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-group__label">Username Instagram Wanita</label>
                  <input type="text" name="brideInstagram" className="form-group__input" placeholder="Contoh: yura" value={formData.brideInstagram} onChange={handleChange} />
                </div>
              )}
            </div>

            {(!features || (features.showAkad !== false && features.showAkad !== 'false')) && (
              <>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)', fontSize: '1.5rem' }}>Akad / Pawiwahan</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-group__label">Tanggal Akad *</label>
                    <input required type="date" name="akadDate" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.akadDate} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-group__label">Waktu Akad *</label>
                    <input required type="time" name="akadTime" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.akadTime} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-group__label">Tempat / Lokasi Akad *</label>
                    <input required type="text" name="akadVenue" className="form-group__input" placeholder="Contoh: Pura Dalem Puri" value={formData.akadVenue} onChange={handleChange} />
                  </div>
                  {(!features || (features.showAkadMap !== false && features.showAkadMap !== 'false')) && (
                    <>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-group__label">Kata Kunci / Kode Peta Akad (Opsional)</label>
                        <p className="text-xs text-gray-500 mb-1">Jika peta kurang tepat, Anda bisa mengetikkan alamat lengkap (contoh: "Jl. Tukad Pakerisan No. 97, Denpasar"). Anda juga bisa mem-paste kode <i>Embed (Iframe)</i> Google Maps di sini.</p>
                        <input type="text" name="akadMapKeyword" className="form-group__input" placeholder="Contoh: Jl. Tukad Pakerisan No. 97" value={formData.akadMapKeyword || ""} onChange={handleChange} />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-group__label">Link URL Google Maps Akad</label>
                        <p className="text-xs text-gray-500 mb-1">Untuk tombol "Buka Maps". Contoh: https://maps.app.goo.gl/...</p>
                        <input type="url" name="akadMapUrl" className="form-group__input" placeholder="https://maps.app.goo.gl/..." value={formData.akadMapUrl} onChange={handleChange} />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {(!features || (features.showResepsi !== false && features.showResepsi !== 'false')) && (
              <>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)', marginTop: 'var(--space-6)', fontSize: '1.5rem' }}>Resepsi</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-group__label">Tanggal Resepsi *</label>
                    <input required type="date" name="resepsiDate" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.resepsiDate} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-group__label">Waktu Resepsi *</label>
                    <input required type="time" name="resepsiTime" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.resepsiTime} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-group__label">Tempat / Lokasi Resepsi *</label>
                    <input required type="text" name="resepsiVenue" className="form-group__input" placeholder="Contoh: Gedung Serbaguna..." value={formData.resepsiVenue} onChange={handleChange} />
                  </div>
                  {(!features || (features.showResepsiMap !== false && features.showResepsiMap !== 'false')) && (
                    <>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-group__label">Kata Kunci / Kode Peta Resepsi (Opsional)</label>
                        <p className="text-xs text-gray-500 mb-1">Jika peta kurang tepat, Anda bisa mengetikkan alamat lengkap (contoh: "Jl. Tukad Pakerisan No. 97, Denpasar"). Anda juga bisa mem-paste kode <i>Embed (Iframe)</i> Google Maps di sini.</p>
                        <input type="text" name="resepsiMapKeyword" className="form-group__input" placeholder="Contoh: Jl. Tukad Pakerisan No. 97" value={formData.resepsiMapKeyword || ""} onChange={handleChange} />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-group__label">Link URL Google Maps Resepsi</label>
                        <p className="text-xs text-gray-500 mb-1">Untuk tombol "Buka Maps". Contoh: https://maps.app.goo.gl/...</p>
                        <input type="url" name="resepsiMapUrl" className="form-group__input" placeholder="https://maps.app.goo.gl/..." value={formData.resepsiMapUrl} onChange={handleChange} />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {(!features || (features.showCountdown !== false && features.showCountdown !== 'false')) && (
              <>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)', marginTop: 'var(--space-6)', fontSize: '1.5rem' }}>Hitung Mundur (Countdown)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-group__label">Tanggal Tujuan *</label>
                    <input required type="date" name="countdownDate" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.countdownDate} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-group__label">Waktu Tujuan *</label>
                    <input required type="time" name="countdownTime" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.countdownTime} onChange={handleChange} />
                  </div>
                </div>
              </>
            )}

            {(!features || (features.showGift !== false && features.showGift !== 'false')) && (
              <>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)', marginTop: 'var(--space-6)', fontSize: '1.5rem' }}>Hadiah / Amplop Digital</h3>

                {/* QRIS Upload */}
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-group__label">Upload QRIS (Gambar Barcode)</label>
                  <input type="file" accept="image/*" className="form-group__input" onChange={handleImageUpload} />
                  {formData.qrisImage && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={formData.qrisImage} alt="QRIS Preview" style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid var(--accent-gold)' }} />
                    </div>
                  )}
                </div>

                {/* Bank 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', padding: 'var(--space-4)', border: '1px dashed var(--accent-gold)', borderRadius: '8px' }}>
                  <div className="form-group">
                    <label className="form-group__label">Bank Utama (Pilihan 1)</label>
                    <select name="bank1Name" className="form-group__input" value={formData.bank1Name || ""} onChange={handleChange}>
                      <option value="">-- Tidak Ada / Pilih Bank --</option>
                      <option value="BCA">BCA</option>
                      <option value="Mandiri">Mandiri</option>
                      <option value="BNI">BNI</option>
                      <option value="BRI">BRI</option>
                      <option value="BSI">BSI</option>
                      <option value="CIMB">CIMB Niaga</option>
                      <option value="OVO">OVO (E-Wallet)</option>
                      <option value="Dana">Dana (E-Wallet)</option>
                      <option value="Gopay">GoPay (E-Wallet)</option>
                      <option value="ShopeePay">ShopeePay (E-Wallet)</option>
                    </select>
                  </div>

                  {formData.bank1Name && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                      <div className="form-group">
                        <label className="form-group__label">Nomor Rekening *</label>
                        <input required type="text" inputMode="numeric" pattern="[0-9]*" name="bank1No" className="form-group__input" placeholder="Contoh: 1234567890" value={formData.bank1No || ""} onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setFormData(prev => ({ ...prev, [e.target.name]: val }));
                        }} />
                      </div>
                      <div className="form-group">
                        <label className="form-group__label">Atas Nama *</label>
                        <input required type="text" name="bank1Holder" className="form-group__input" placeholder="Contoh: I Made Arya" value={formData.bank1Holder || ""} onChange={handleChange} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bank 2 */}
                {(!features || (features.showBank2 !== false && features.showBank2 !== 'false')) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)', padding: 'var(--space-4)', border: '1px dashed var(--accent-gold)', borderRadius: '8px', marginBottom: 'var(--space-6)' }}>
                    <div className="form-group">
                      <label className="form-group__label">Bank Alternatif (Pilihan 2)</label>
                      <select name="bank2Name" className="form-group__input" value={formData.bank2Name || ""} onChange={handleChange}>
                        <option value="">-- Tidak Ada / Pilih Bank --</option>
                        <option value="BCA">BCA</option>
                        <option value="Mandiri">Mandiri</option>
                        <option value="BNI">BNI</option>
                        <option value="BRI">BRI</option>
                        <option value="BSI">BSI</option>
                        <option value="CIMB">CIMB Niaga</option>
                        <option value="OVO">OVO (E-Wallet)</option>
                        <option value="Dana">Dana (E-Wallet)</option>
                        <option value="Gopay">GoPay (E-Wallet)</option>
                        <option value="ShopeePay">ShopeePay (E-Wallet)</option>
                      </select>
                    </div>

                    {formData.bank2Name && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                          <label className="form-group__label">Nomor Rekening *</label>
                          <input required type="text" inputMode="numeric" pattern="[0-9]*" name="bank2No" className="form-group__input" placeholder="Contoh: 0987654321" value={formData.bank2No || ""} onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setFormData(prev => ({ ...prev, [e.target.name]: val }));
                          }} />
                        </div>
                        <div className="form-group">
                          <label className="form-group__label">Atas Nama *</label>
                          <input required type="text" name="bank2Holder" className="form-group__input" placeholder="Contoh: Ni Luh Ayu" value={formData.bank2Holder || ""} onChange={handleChange} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Dynamic Images Upload */}
            {features?.requiredImages && Array.isArray(features.requiredImages) && features.requiredImages.length > 0 && (
              <>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)', marginTop: 'var(--space-6)', fontSize: '1.5rem' }}>Upload Foto Utama</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
                  {features.requiredImages.map((img: { key: string, label: string }, idx: number) => (
                    <div className="form-group" key={idx} style={{ marginBottom: 0 }}>
                      <label className="form-group__label">{img.label} *</label>
                      <input
                        required={!(formData as any)[img.key]}
                        type="file"
                        accept="image/*"
                        className="form-group__input"
                        onChange={(e) => handleDynamicImageUpload(e, img.key)}
                      />
                      {(formData as any)[img.key] && (
                        <div style={{ marginTop: '10px' }}>
                          <img
                            src={(formData as any)[img.key]}
                            alt={img.label}
                            style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--accent-gold)', cursor: 'pointer' }}
                            onClick={() => setPreviewImage((formData as any)[img.key])}
                            title="Klik untuk melihat foto penuh"
                          />
                          <p style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginTop: '4px', textAlign: 'center', opacity: 0.8, fontStyle: 'italic' }}>
                            🔍 Klik foto untuk melihat ukuran penuh
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ marginTop: 'var(--space-10)', textAlign: 'center' }}>
              <button type="submit" className="btn btn--primary" style={{ padding: 'var(--space-4) var(--space-8)', fontSize: '1.1rem' }}>
                Simpan &amp; Lihat Hasil
              </button>
            </div>
          </form>
        </div>
      </div>

      {previewImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              border: '2px solid var(--accent-gold)'
            }}
          />
          <button
            onClick={() => setPreviewImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '2rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default function SetupPageClient(props: SetupPageClientProps) {
  return (
    <Suspense fallback={<div className="section" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="loader"></div></div>}>
      <SetupContent {...props} />
    </Suspense>
  );
}
