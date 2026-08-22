# PRD — Undangan Bali Editor: Kesiapan Produksi & Komersial

**Versi:** 1.0
**Status:** Draft
**Tanggal:** 6 Agustus 2026
**Pemilik Produk:** —

---

## 1. Latar Belakang

Undangan Bali adalah platform self-service yang memungkinkan calon pengantin (client) mendesain undangan pernikahan digital mereka sendiri melalui editor berbasis web (split-screen preview + form, Visual Builder untuk edit elemen langsung).

Review teknis terhadap kode editor saat ini (`EditorPage`, CSS design system) menemukan bahwa **arsitektur dan UX dasar sudah solid**, terutama untuk desktop. Namun terdapat beberapa gap kritis — terutama persistensi data yang hanya mengandalkan `localStorage` — yang membuat produk **belum layak dirilis ke client berbayar secara luas**.

PRD ini mendefinisikan apa yang harus diperbaiki, prioritasnya, dan kriteria "selesai" (Definition of Done) sebelum produk dinyatakan *production-ready*.

## 2. Tujuan

- Menjadikan editor undangan aman dipakai oleh client non-teknis di **desktop maupun mobile**, tanpa risiko kehilangan data.
- Menghilangkan blocker teknis yang mencegah produk dijual sebagai layanan berbayar.
- Menstandarkan pengalaman mobile sebagai prioritas utama (mayoritas client diperkirakan mengedit dari HP).

## 3. Target Pengguna

Calon pengantin (client) usia 20–35 tahun, awam teknis, mayoritas mengakses dari smartphone, ingin membuat undangan digital tanpa bantuan developer.

## 4. Non-Goals (di luar cakupan PRD ini)

- Redesign visual/branding template undangan.
- Fitur kolaborasi multi-user (co-editing dua mempelai bersamaan).
- Integrasi pembayaran/paket berlangganan (diasumsikan sudah ada di luar scope editor).

---

## 5. Temuan & Requirement Perbaikan

Diurutkan berdasarkan prioritas rilis.

### 🔴 P0 — Blocker Rilis (wajib selesai sebelum jual ke client)

#### 5.1 Persistensi data ke backend
**Masalah saat ini:** Seluruh data form, foto, dan override Visual Builder hanya disimpan di `localStorage` (`handleSave`, tidak ada pemanggilan API). Ganti device/browser, clear cache, atau mode private browsing → seluruh progress client hilang permanen.

**Requirement:**
- Setiap perubahan (atau minimal saat klik "Simpan") harus tersimpan ke database melalui API, terikat ke akun user yang sudah login (`useAuth`).
- Foto diupload ke object storage (bukan disimpan sebagai base64 di localStorage), dengan URL yang direferensikan di data undangan.
- Client harus bisa login dari device berbeda dan melanjutkan draft yang sama persis.
- Auto-save berkala (debounced) sebagai pelengkap, agar tidak ada progress hilang jika lupa klik simpan.
- `localStorage` boleh dipertahankan sebagai cache lokal/offline fallback, **bukan** sebagai satu-satunya sumber data.

**Acceptance Criteria:**
- Data yang disimpan dari browser A dapat dibuka utuh (termasuk foto & Visual Builder override) dari browser/device B setelah login.
- Uji: clear localStorage browser tidak menghilangkan data tersimpan di akun.

#### 5.2 Preview mobile menutupi form
**Masalah saat ini:** `.editor__preview-frame` punya `min-height: 600px` tanpa override responsif di breakpoint 768px/480px. Karena `order: -1`, preview raksasa muncul duluan di HP dan form edit terdorong jauh ke bawah.

**Requirement:**
- Di layar ≤768px, preview frame harus diperkecil signifikan (mis. tinggi berbasis `aspect-ratio` atau max ~400px) **atau**
- Sediakan mode collapsible: default menampilkan form, dengan tombol/tab "Lihat Preview" yang membuka preview (full-screen sheet/modal) saat ditekan.

**Acceptance Criteria:**
- Di viewport 375×667 (iPhone SE) dan 390×844 (iPhone 12), form dapat diakses tanpa scroll berlebihan sebelum sampai ke input pertama.

### 🟠 P1 — Wajib sebelum rilis ke client luas (mobile-first)

#### 5.3 Tab bar berantakan di layar sempit
**Masalah saat ini:** 5 tab dengan `flex:1` dipaksa `flex-wrap: wrap` (inline style), menghasilkan baris tab dengan jumlah tombol tidak rata → terlihat tidak rapi bagi client non-teknis.

**Requirement:** Ganti pola wrap dengan scrollable horizontal tabs (`overflow-x: auto`, `white-space: nowrap`) di breakpoint mobile, mengikuti pola umum tab bar aplikasi.

**Acceptance Criteria:** Di layar sempit (<400px), seluruh 5 tab dapat diakses via swipe horizontal tanpa ada tombol yang terpotong atau baris kedua yang tidak rata.

#### 5.4 Visual Builder belum aman untuk pengguna awam & belum teruji di touchscreen
**Masalah saat ini:** Elemen yang dipilih hanya ditampilkan sebagai `tagName` mentah (`P`, `DIV`) tanpa highlight visual di preview. Interaksi klik-pilih-elemen di dalam iframe berpotensi konflik dengan scroll di touchscreen.

**Requirement:**
- Tambahkan outline/highlight visual pada elemen yang dipilih di dalam iframe preview (bukan hanya info di panel form).
- Label elemen yang lebih deskriptif untuk user awam (mis. "Judul Nama Mempelai" bukan `H1`).
- Uji khusus interaksi tap-to-select vs scroll di iframe pada device touchscreen nyata; jika belum stabil, non-aktifkan/sembunyikan tab Visual Edit di mobile untuk rilis awal.

**Acceptance Criteria:** User dapat membedakan dengan jelas elemen mana yang sedang dipilih, dan tap-to-select tidak mengganggu scroll normal pada preview di device fisik.

#### 5.5 Tidak ada loading & error state yang terlihat
**Masalah saat ini:** Fetch `/api/templates` gagal fallback diam-diam ke config lokal; tidak ada indikator saat foto sedang diproses/upload atau saat template gagal dimuat.

**Requirement:**
- Tampilkan skeleton/spinner (sudah tersedia di CSS: `.skeleton`, `.spinner`) saat loading template dan saat upload foto berlangsung.
- Tampilkan toast/error state yang terlihat oleh user jika template API gagal dimuat total (bukan hanya console.error diam-diam), dengan opsi retry.
- Tampilkan progress/loading state saat `handleSave` sedang berjalan (mencegah double-submit).

**Acceptance Criteria:** Simulasikan network gagal/lambat (throttling) — user selalu tahu status sistem, tidak ada state "diam" yang membingungkan.

### 🟡 P2 — Peningkatan kualitas (bisa menyusul rilis awal, tapi direkomendasikan)

#### 5.6 Validasi & guardrail form
- Validasi tambahan selain nama wajib (mis. `weddingDate` tidak boleh tanggal lampau, `mapLink` format URL valid).
- Konfirmasi sebelum navigasi keluar editor jika ada perubahan belum tersimpan (`beforeunload` / dialog konfirmasi).

#### 5.7 Aksesibilitas & performa gambar
- Kompresi/resize foto di sisi client sebelum upload (foto pernikahan sering berukuran besar >5MB mentah).
- Pastikan kontras warna aksen custom (color picker bebas) tetap memenuhi kontras minimum agar teks tetap terbaca di semua tema.

---

## 6. Kriteria "Layak Rilis Komersial" (Definition of Done)

Produk dianggap siap dijual ke client luas jika **seluruh item P0 dan P1** di atas selesai dan lulus pengujian berikut:

1. ✅ Data client tidak pernah hilang akibat ganti device, clear cache, atau uninstall app.
2. ✅ Alur penuh (login → pilih template → isi form → upload foto → preview → simpan → share) dapat diselesaikan mulus di **HP sungguhan** (bukan hanya emulator desktop-narrow).
3. ✅ Tidak ada state "diam" — setiap aksi (save, upload, load template) punya feedback visual yang jelas.
4. ✅ Visual Builder aman digunakan atau disembunyikan sementara di mobile sampai teruji stabil.

## 7. Rencana Eksekusi (Disarankan)

| Fase | Cakupan | Estimasi Fokus |
|---|---|---|
| Fase 1 | 5.1 Persistensi backend + 5.2 Preview mobile | Kritis, blocker rilis |
| Fase 2 | 5.3 Tab bar responsif + 5.5 Loading/error state | UX polish wajib |
| Fase 3 | 5.4 Visual Builder mobile-safe | Bisa soft-launch tanpa fitur ini di mobile dulu |
| Fase 4 | 5.6 & 5.7 | Iterasi pasca-rilis |

## 8. Metrik Keberhasilan Pasca-Rilis

- Tingkat drop-off di editor (khususnya mobile) menurun dibanding baseline saat ini.
- Nol laporan "data hilang" dari client dalam 30 hari pertama pasca Fase 1.
- Waktu penyelesaian draft undangan (dari mulai edit sampai klik Simpan) tidak meningkat signifikan setelah perubahan UX mobile.
