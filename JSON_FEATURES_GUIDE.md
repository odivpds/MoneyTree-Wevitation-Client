# Panduan Fitur & Konfigurasi Template Wevitation

Sistem template Wevitation kini menggunakan antarmuka **Visual Builder** yang sangat mudah digunakan (User-Friendly). Anda tidak perlu lagi menulis kode pemrograman atau format JSON yang rumit untuk mengatur fitur-fitur sebuah template.

Dokumen ini berisi panduan bagi tim Admin/CMS dalam menambahkan atau mengedit konfigurasi template baru.

---

## 1. Pengaturan Fitur Standar (Checkboxes)
Di halaman **Tambah/Edit Template** CMS Anda, Anda akan menemukan daftar kotak centang (checkbox) untuk fitur-fitur standar undangan pernikahan. 

Jika template yang Anda masukkan adalah paket Basic (Paket Hemat), Anda cukup **menghilangkan centang (uncheck)** pada fitur-fitur mewah seperti:
- Galeri Foto
- Amplop Digital
- Musik Latar

**Bagaimana sistem kerjanya?**
Sistem Wevitation akan secara otomatis membaca fitur yang Anda matikan, dan:
1. Menyembunyikan form pengisian (seperti rekening bank atau tombol upload foto) dari halaman klien.
2. Menyembunyikan bagian tersebut dari undangan final klien secara otomatis!

*Catatan untuk Developer HTML:*
Sistem secara otomatis akan membuat variabel HTML baru dengan akhiran `Display`. Developer wajib menggunakannya pada `style="display: {{namaFiturDisplay}};"`.
Contoh: `<div id="galeri" style="display: {{galleryDisplay}};">`

---

## 2. Kebutuhan Foto Klien (Dynamic Photo Builder)
Setiap template desain undangan memiliki kebutuhan foto yang berbeda-beda. Ada yang butuh 1 foto sampul, ada yang butuh 5 foto galeri, dll.

Alih-alih menulis kode JSON, kini Anda cukup menggunakan tombol **"+ Tambah Foto"** di halaman CMS Admin.

**Cara Penggunaan:**
1. Klik tombol **"+ Tambah Foto"** di bawah bagian "Kebutuhan Foto Klien".
2. Isi **Variabel Kode (Key)**: Ini adalah kode unik yang akan ditanam oleh programmer HTML di dalam kodenya. (Contoh: `coverPhoto`, `groomPhoto`, `gallery1`). *Gunakan huruf kecil tanpa spasi.*
3. Isi **Label Form (Dilihat Klien)**: Ini adalah panduan teks yang akan dibaca oleh klien saat mereka mengisi data. (Contoh: `Foto Sampul Utama (Portrait)`, `Foto Mempelai Pria`).
4. Ulangi untuk setiap foto yang dibutuhkan oleh template tersebut.

**Penerapan oleh Developer HTML:**
Developer HTML cukup memasukkan Variabel Kode (`key`) tersebut ke dalam atribut `src` pada tag gambar atau `background-image` di CSS inline.
```html
<img src="{{coverPhoto}}" alt="Sampul">
<div style="background-image: url('{{gallery1}}');"></div>
```
Sistem Wevitation akan otomatis meminta klien mengunggah foto-foto tersebut dan memasukkannya ke dalam template.

---

## 3. Fitur Custom & Advanced Config
Di bagian paling bawah, Anda masih akan melihat kolom teks bernama **Advanced Config**.
Kolom ini murni digunakan **hanya jika** ada kebutuhan fitur kustom tingkat lanjut (berbentuk JSON) yang dikembangkan di luar sistem standar kami. Untuk penggunaan sehari-hari, **biarkan saja kolom ini kosong**.

Semudah itu! Sistem Wevitation akan menangani seluruh kerumitan kode di belakang layar. Selamat mengelola template Anda!
