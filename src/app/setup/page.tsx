"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from 'react';
import { useAuth } from "@/context/AuthContext";

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const { isLoggedIn, isInitialized } = useAuth();

  const [formData, setFormData] = useState({
    groomName: "",
    brideName: "",
    groomParents: "",
    brideParents: "",
    akadDate: "",
    akadTime: "",
    akadVenue: "",
    resepsiDate: "",
    resepsiTime: "",
    resepsiVenue: "",
  });

  // Load existing data on mount
  useEffect(() => {
    try {
      const existingData = localStorage.getItem('undanganBali_data');
      if (existingData) {
        const parsed = JSON.parse(existingData);
        setFormData(prev => ({
          ...prev,
          ...parsed
        }));
      }
    } catch (e) {
      console.warn("Gagal membaca localStorage", e);
    }
  }, []);

  // Auth guard redirect
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent('/setup?template=' + templateId)}`);
    }
  }, [isLoggedIn, isInitialized, router, templateId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save to localStorage
    try {
      const existingData = localStorage.getItem('undanganBali_data');
      const parsedExisting = existingData ? JSON.parse(existingData) : {};
      const mergedData = { ...parsedExisting, ...formData };
      localStorage.setItem('undanganBali_data', JSON.stringify(mergedData));
    } catch (err) {
      console.warn("Gagal menyimpan data setup ke localStorage:", err);
    }

    // Redirect to editor
    router.push(`/editor?template=${templateId || 'agung'}`);
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
                <label className="form-group__label">Nama Orangtua Pria</label>
                <input type="text" name="groomParents" className="form-group__input" placeholder="Putra dari Bpk... & Ibu..." value={formData.groomParents} onChange={handleChange} />
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)', marginTop: 'var(--space-6)', fontSize: '1.5rem' }}>Mempelai Wanita</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-group__label">Nama Panggilan Wanita *</label>
                <input required type="text" name="brideName" className="form-group__input" placeholder="Contoh: Dayu Intan" value={formData.brideName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-group__label">Nama Orangtua Wanita</label>
                <input type="text" name="brideParents" className="form-group__input" placeholder="Putri dari Bpk... & Ibu..." value={formData.brideParents} onChange={handleChange} />
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)', fontSize: '1.5rem' }}>Akad / Pawiwahan</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-group__label">Tanggal Akad *</label>
                <input required type="date" name="akadDate" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.akadDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-group__label">Waktu Akad</label>
                <input type="time" name="akadTime" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.akadTime} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-group__label">Tempat / Lokasi Akad</label>
                <input type="text" name="akadVenue" className="form-group__input" placeholder="Contoh: Pura Dalem Puri" value={formData.akadVenue} onChange={handleChange} />
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: 'var(--space-4)', marginTop: 'var(--space-6)', fontSize: '1.5rem' }}>Resepsi</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-group__label">Tanggal Resepsi</label>
                <input type="date" name="resepsiDate" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.resepsiDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-group__label">Waktu Resepsi</label>
                <input type="time" name="resepsiTime" className="form-group__input" style={{ cursor: 'pointer' }} onClick={(e) => e.currentTarget.showPicker?.()} value={formData.resepsiTime} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-group__label">Tempat / Lokasi Resepsi</label>
                <input type="text" name="resepsiVenue" className="form-group__input" placeholder="Contoh: Gedung Serbaguna..." value={formData.resepsiVenue} onChange={handleChange} />
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-10)', textAlign: 'center' }}>
              <button type="submit" className="btn btn--primary" style={{ padding: 'var(--space-4) var(--space-8)', fontSize: '1.1rem' }}>
                Simpan & Lanjut ke Editor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="section" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="loader"></div></div>}>
      <SetupContent />
    </Suspense>
  );
}
