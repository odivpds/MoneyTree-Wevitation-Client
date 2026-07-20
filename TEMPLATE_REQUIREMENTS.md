# Panduan Pembuatan Template HTML Wevitation (Untuk Tim Developer)

Sistem Wevitation telah dilengkapi dengan **Visual Builder** yang canggih. Sistem ini dapat mengubah template HTML statis apa pun menjadi undangan yang bisa di-*edit* secara visual (drag & drop / click-to-edit) oleh klien (pengguna awam).

Sistem ini sangat dinamis dan **sudah dirancang untuk bekerja dengan template HTML/CSS/JS yang berbeda-beda**, apa pun desainnya. Sistem secara otomatis mendeteksi tag teks (`h1`-`h6`, `p`, `span`, `li`), gambar (`img`), dan latar belakang (`background-image`).

Meski begitu, agar template yang Anda buat bekerja dengan **sempurna** di dalam editor Wevitation, ikuti panduan dan syarat berikut:

## 1. Gunakan ID yang Unik (Sangat Direkomendasikan)
Sistem menyimpan editan pengguna (teks/foto) berdasarkan letak elemen di HTML (*CSS Selector*). Jika Anda memberikan atribut `id` pada elemen teks atau foto, sistem akan mengunci perubahan pada `id` tersebut. Ini sangat aman!
✅ **Bagus:** `<h1 id="nama-mempelai-utama">Rama & Sinta</h1>`
❌ **Biasa:** `<h1>Rama & Sinta</h1>` (Sistem akan membuat selector panjang seperti `body > div > section > h1`, yang rentan rusak jika struktur HTML nanti diubah).

## 2. Struktur Pembagian "Sections"
Editor klien memiliki tombol navigasi instan bernama **"Struktur Halaman"** agar klien bisa melompat ke bagian tertentu (Hero, Pasangan, Galeri, dsb) dengan mudah.
Agar sistem mendeteksi *section* buatan Anda, patuhi salah satu dari ini:
- Gunakan tag `<section>`
- ATAU gunakan class `.section` (contoh: `<div class="section couple-area">`)
- ATAU berikan ID yang mengandung kata `hero` atau `gallery` (contoh: `<div id="main-hero">`)

**Tip Pro:** Tambahkan atribut `data-name` agar nama *section*-nya terlihat cantik di menu klien!
✅ `<section id="acara" data-name="Jadwal Acara"> ... </section>`

## 3. Data Binding (Variabel Form)
Untuk teks bawaan seperti Nama Mempelai, Tanggal, atau Jam yang diisi klien melalui tab "Info" (Formulir Standar), Anda cukup menaruh variabel dengan format `{{namaVariabel}}` di dalam HTML Anda. 
Sistem akan **otomatis me-replace** variabel tersebut dengan ketikan klien secara *real-time*.

Daftar variabel yang saat ini didukung:
- `{{groomName}}` (Nama Mempelai Pria)
- `{{brideName}}` (Nama Mempelai Wanita)
- `{{weddingDate}}` (Tanggal Pernikahan)
- `{{resepsiTime}}` (Waktu Resepsi)
- `{{resepsiVenue}}` (Lokasi Resepsi)

## 4. Background Image (Latar Belakang)
Jika Anda menggunakan gambar sebagai latar belakang dan ingin klien bisa menggantinya, gunakan atribut HTML `style` *inline*:
✅ **Benar:** `<div class="hero-banner" style="background-image: url('assets/hero.jpg');"></div>`
Sistem akan mendeteksi *inline style* ini dan memunculkan tombol "📸 Edit Gambar" di atasnya.
❌ **Salah:** Menetapkan URL *background-image* sepenuhnya dari dalam file `.css` terpisah. Sistem Visual Editor tidak akan mendeteksinya sebagai elemen yang bisa diunggah fotonya (meski secara tampilan web akan tetap normal).

## 5. Hati-hati dengan "Overlay Transparan" (Z-Index)
Jika Anda menaruh elemen transparan yang melayang (seperti hiasan daun atau efek *overlay* gelap) menutupi teks, pastikan Anda menambahkan CSS `pointer-events: none;` pada *overlay* tersebut. 
Jika tidak, *overlay* itu akan menghalangi klik dari *mouse* klien, sehingga teks di bawahnya tidak bisa diklik dan diedit di Visual Editor.
