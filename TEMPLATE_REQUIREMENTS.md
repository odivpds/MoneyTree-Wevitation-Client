# Panduan Pembuatan Template HTML Wevitation (Untuk Tim Developer)

Sistem Wevitation telah dilengkapi dengan **Visual Builder** yang canggih. Sistem ini dapat mengubah template HTML statis apa pun menjadi undangan yang bisa di-*edit* secara visual (drag & drop / click-to-edit) oleh klien (pengguna awam).

Sistem ini sangat dinamis dan **sudah dirancang untuk bekerja dengan template HTML/CSS/JS yang berbeda-beda**, apa pun desainnya. Sistem secara otomatis mendeteksi tag teks (`h1`-`h6`, `p`, `span`, `li`), gambar (`img`), dan latar belakang (`background-image`).

Meski begitu, agar template yang Anda buat bekerja dengan **sempurna** di dalam editor Wevitation tanpa ada *bug* layout, ikuti panduan dan syarat wajib berikut:

## 1. Gunakan ID yang Unik (Sangat Direkomendasikan)
Sistem menyimpan editan pengguna (teks/foto) berdasarkan letak elemen di HTML (*CSS Selector*). Jika Anda memberikan atribut `id` pada elemen teks atau foto, sistem akan mengunci perubahan pada `id` tersebut. Ini sangat aman!
✅ **Bagus:** `<h1 id="nama-mempelai-utama">Rama & Sinta</h1>`
❌ **Biasa:** `<h1>Rama & Sinta</h1>` (Sistem akan membuat selector panjang seperti `body > div > section > h1`, yang rentan rusak jika struktur HTML nanti diubah oleh tim developer).

## 2. Struktur Pembagian "Sections"
Editor klien memiliki tombol navigasi instan bernama **"Struktur Halaman"** agar klien bisa melompat ke bagian tertentu (Hero, Pasangan, Galeri, dsb) dengan mudah.
Agar sistem mendeteksi *section* buatan Anda, patuhi salah satu dari ini:
- Gunakan tag `<section>`
- ATAU gunakan class `.section` (contoh: `<div class="section couple-area">`)
- ATAU berikan ID yang mengandung kata `hero` atau `gallery` (contoh: `<div id="main-hero">`)

**Tip Pro:** Tambahkan atribut `data-name` agar nama *section*-nya terlihat cantik di menu navigasi klien!
✅ `<section id="acara" data-name="Jadwal Acara"> ... </section>`

## 3. Data Binding (Variabel Form)
Untuk data-data vital yang diisi klien melalui tab "Info" / "Acara" (Formulir Standar), Anda **wajib** menggunakan variabel dengan format `{{namaVariabel}}` di dalam kode HTML. Sistem akan me-*replace* tag tersebut secara otomatis.

**Daftar variabel Data Mempelai & Acara:**
- `{{groomName}}` (Nama Mempelai Pria)
- `{{brideName}}` (Nama Mempelai Wanita)
- `{{groomParents}}` (Nama Orang Tua Pria)
- `{{brideParents}}` (Nama Orang Tua Wanita)
- `{{greeting}}` (Salam Pembuka, misal: Om Swastyastu)
- `{{weddingDate}}` (Tanggal Pernikahan Utama)
- `{{akadTime}}`, `{{akadVenue}}` (Waktu & Tempat Akad/Pemberkatan)
- `{{resepsiTime}}`, `{{resepsiVenue}}` (Waktu & Tempat Resepsi)
- `{{mainVenue}}`, `{{dressCode}}` (Informasi tambahan)

**Daftar variabel Hitung Mundur (Countdown):**
Sistem akan otomatis menghitung mundur ke tanggal pernikahan dan mengisi tag ini.
- `{{days}}`, `{{hours}}`, `{{minutes}}`, `{{seconds}}`

**Daftar variabel Hadiah (Gift & Amplop Digital):**
- `{{qrisImage}}` (URL Gambar QRIS)
- `{{bank1Name}}`, `{{bank1No}}`, `{{bank1Holder}}` (Informasi Bank 1)
- `{{bank2Name}}`, `{{bank2No}}`, `{{bank2Holder}}` (Informasi Bank 2)

## 4. Logika Tampilan Kondisional (Display Toggles) - PENTING!
Sistem Wevitation memiliki variabel penyembunyi (`{{bank1Display}}`, `{{bank2Display}}`, dan `{{qrisDisplay}}`). Variabel ini akan diganti oleh sistem menjadi teks `block` (jika klien mengisi datanya) atau `none` (jika klien mengosongkannya).
✅ **Cara Pakai:** `<div style="display: {{bank1Display}};"> ... konten bank ... </div>`

⚠️ **Aturan Ketat CSS Layouting:**
Karena sistem menyuntikkan `display: block` atau `display: none` secara *inline*, **JANGAN** menjadikan div pembungkus tersebut sebagai Flex Container (`display: flex;`) melalui file `.css` Anda. 
Sifat CSS *inline* (`block`) akan membatalkan *style* `flex` yang Anda buat di file eksternal, sehingga elemen di dalamnya akan berubah menjadi tata letak *block* biasa dan mungkin merusak desain Anda.
✅ **Solusi:** Jika isi di dalam kartu bank memerlukan Flexbox, buatlah struktur *wrapper* (pembungkus ganda):
```html
<!-- Wrapper luar untuk logika sembunyi/tampil dari sistem -->
<div class="bank-card-wrapper" style="display: {{bank1Display}};">
    <!-- Wrapper dalam untuk styling Flexbox Anda -->
    <div class="card-inner" style="display: flex; flex-direction: column;">
       <p>Nomor Rekening: {{bank1No}}</p>
    </div>
</div>
```

## 5. Penanganan Text Overflow (Responsivitas Mobile)
Khusus untuk elemen yang menampung *string* panjang tanpa spasi (contoh: **Nomor Rekening** yang bisa lebih dari 15 angka, atau URL link), pastikan Anda menambahkan `word-break: break-all;` atau `overflow-wrap: break-word;` pada CSS-nya. 
Jika tidak, teks yang kepanjangan akan menabrak / tumpah keluar dari kotak pembungkusnya saat dibuka di layar HP yang sempit.
✅ **Benar:** `.bank-acc { word-break: break-all; }`

## 6. Background Image (Latar Belakang)
Jika Anda menggunakan gambar sebagai latar belakang dan ingin klien bisa menggantinya lewat editor, gunakan atribut HTML `style` *inline*. Anda bisa menggunakan variabel khusus `{{photoUrl}}` yang merepresentasikan foto *cover* yang diunggah klien.
✅ **Benar:** `<div class="hero-banner" style="background-image: url('{{photoUrl}}');"></div>`
Sistem akan mendeteksi *inline style* ini dan memunculkan kontrol "📸 Edit Gambar" di aplikasi.
❌ **Salah:** Menetapkan URL *background-image* sepenuhnya dari dalam file `.css` terpisah. Sistem Visual Editor tidak akan mendeteksinya.

## 7. Hati-hati dengan "Overlay Transparan" (Z-Index)
Jika Anda menaruh elemen transparan yang melayang (seperti hiasan bunga di pojok, bingkai absolut, atau efek *overlay* gelap) yang menutupi teks, pastikan Anda menambahkan CSS `pointer-events: none;` pada elemen *overlay* tersebut. 
Jika tidak, *overlay* itu akan menghalangi *mouse* klien, sehingga klien tidak bisa mengklik dan mengedit teks yang berada di baliknya lewat sistem Visual Editor.
