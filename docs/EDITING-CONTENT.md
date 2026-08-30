# Panduan Mengedit Konten Website

Panduan ini untuk siapa saja yang perlu mengubah teks, gambar, atau daftar isi
di website ini, tanpa perlu tahu cara kerja kodenya.

Semua contoh di panduan ini bisa disalin apa adanya. Tidak ada satu pun contoh
yang mengandung catatan tambahan di dalamnya, karena catatan seperti itu akan
membuat file JSON rusak.

---

## 1. Aturan dasar

Semua teks dan alamat gambar yang tampil di website disimpan dalam delapan file
di folder `public/data/`:

| File             | Mengatur bagian                                     |
| ---------------- | --------------------------------------------------- |
| `site.json`      | Judul di tab browser, nama perusahaan, menu, tombol |
| `hero.json`      | Layar pembuka paling atas                           |
| `about.json`     | Bagian "About"                                      |
| `purpose.json`   | Bagian "Purpose"                                    |
| `services.json`  | Bagian "Services"                                   |
| `portfolio.json` | Bagian "Portfolio"                                  |
| `team.json`      | Bagian "Team"                                       |
| `contact.json`   | Bagian "Contact"                                    |

Setiap baris di dalamnya berbentuk `"kunci": "nilai"`.

**Kunci** adalah tulisan di sebelah kiri tanda titik dua, contohnya
`"headline"`. Itu nama teknis yang dibaca website. **Jangan pernah diubah.**

**Nilai** adalah tulisan di sebelah kanan, di dalam tanda kutip. Itu yang tampil
di layar. **Inilah yang boleh dan memang untuk diubah.**

```json
"headline": "Lorem ipsum dolor sit amet consectetur"
```

Di contoh itu `headline` adalah kunci, dan `"Lorem ipsum dolor sit amet
consectetur"` adalah nilai yang Anda ganti.

### Satu kunci yang ada di hampir semua file: `label`

Enam file bagian (`about`, `purpose`, `services`, `portfolio`, `team`,
`contact`) punya kunci `"label"` di paling atas. Itu tulisan kecil bergaya
mesin ketik yang tampil di sisi kiri tiap bagian, misalnya `ABOUT`. Huruf
besar-kecilnya diatur otomatis oleh website, jadi Anda bisa menulisnya biasa
saja. Isi yang pendek, satu atau dua kata.

---

## 2. Peta lengkap: apa saja yang bisa diubah

Tabel ini memuat **setiap** kunci yang isinya tampil ke pengunjung. Kalau ada
sesuatu di halaman yang ingin Anda ubah, tempatnya pasti ada di sini.

### `site.json`

| Kunci                | Mengatur apa                                                     |
| -------------------- | ---------------------------------------------------------------- |
| `meta.title`         | Judul di tab browser dan di hasil pencarian Google               |
| `meta.description`   | Kalimat ringkas di bawah judul pada hasil pencarian Google       |
| `meta.ogImage.src`   | Gambar yang muncul saat link dibagikan di WhatsApp atau LinkedIn |
| `meta.ogImage.alt`   | Penjelasan singkat gambar tersebut                               |
| `logo.wordmark`      | Nama perusahaan di kiri atas dan di footer                       |
| `nav[].label`        | Tulisan tiap menu di kanan atas                                  |
| `nav[].href`         | Tujuan menu. **Jangan diubah**, lihat Bagian 5                   |
| `cta.label`          | Tulisan pada tombol utama di kanan atas                          |
| `cta.href`           | Tujuan tombol itu. **Jangan diubah**, lihat Bagian 5             |
| `footer.nav[].label` | Tulisan tiap tautan di footer                                    |
| `footer.nav[].href`  | Tujuan tautan footer. **Jangan diubah**, lihat Bagian 5          |
| `footer.copyright`   | Baris hak cipta paling bawah                                     |
| `ui.*`               | Label tombol-tombol kecil, lihat tabel di bawah                  |

Kunci `ui` mengatur tulisan pada tombol kecil di seluruh halaman:

| Kunci             | Tampil di mana                                       |
| ----------------- | ---------------------------------------------------- |
| `menu`            | Tombol buka menu di layar sempit (HP)                |
| `closeMenu`       | Tombol tutup menu di layar sempit                    |
| `copy`            | Tombol salin di sebelah email, telepon, dan WhatsApp |
| `copied`          | Teks yang muncul sesaat setelah tombol salin ditekan |
| `expandBio`       | Tombol buka riwayat anggota tim                      |
| `collapseBio`     | Tombol tutup riwayat anggota tim                     |
| `expandProject`   | Tombol buka detail proyek di Portfolio               |
| `collapseProject` | Tombol tutup detail proyek di Portfolio              |

### `hero.json`

| Kunci                 | Mengatur apa                                                     |
| --------------------- | ---------------------------------------------------------------- |
| `eyebrow`             | Tulisan kecil di atas judul besar                                |
| `headline`            | Judul besar pembuka                                              |
| `subheadline`         | Kalimat penjelas di bawah judul                                  |
| `backgroundImage.src` | Alamat gambar latar, lihat Bagian 4                              |
| `backgroundImage.alt` | Penjelasan singkat gambar latar                                  |
| `actions[].label`     | Tulisan pada tombol                                              |
| `actions[].href`      | Tujuan tombol. **Jangan diubah**, lihat Bagian 5                 |
| `actions[].variant`   | Tampilan tombol: `primary` (isi penuh) atau `ghost` (garis tepi) |

### `about.json`

| Kunci           | Mengatur apa                                             |
| --------------- | -------------------------------------------------------- |
| `label`         | Label kecil di sisi kiri bagian                          |
| `headline`      | Judul bagian                                             |
| `paragraphs[]`  | Daftar paragraf. Idealnya 2 sampai 3                     |
| `stats[].value` | Angka besar, contoh `120+` atau `98%`                    |
| `stats[].label` | Keterangan kecil di bawah angka. Dirancang untuk 3 angka |

### `purpose.json`

| Kunci           | Mengatur apa                            |
| --------------- | --------------------------------------- |
| `label`         | Label kecil di sisi kiri bagian         |
| `headline`      | Judul bagian                            |
| `items[].title` | Judul tiap poin. Dirancang untuk 4 poin |
| `items[].body`  | Penjelasan tiap poin                    |

### `services.json`

| Kunci                 | Mengatur apa                             |
| --------------------- | ---------------------------------------- |
| `label`               | Label kecil di sisi kiri bagian          |
| `headline`            | Judul bagian                             |
| `items[].icon`        | Nama ikon. Harus dari daftar di Bagian 6 |
| `items[].name`        | Nama layanan. Dirancang untuk 12 layanan |
| `items[].description` | Penjelasan singkat layanan               |

### `portfolio.json`

| Kunci                 | Mengatur apa                                        |
| --------------------- | --------------------------------------------------- |
| `label`               | Label kecil di sisi kiri bagian                     |
| `headline`            | Judul bagian                                        |
| `items[].logo.src`    | Alamat logo klien, lihat Bagian 4                   |
| `items[].logo.alt`    | Penjelasan singkat logo                             |
| `items[].title`       | Nama klien atau proyek. Dirancang untuk 6 baris     |
| `items[].category`    | Kategori singkat di sebelah nama                    |
| `items[].description` | Detail yang muncul saat baris dibuka. Boleh dihapus |

### `team.json`

| Kunci                 | Mengatur apa                                     |
| --------------------- | ------------------------------------------------ |
| `label`               | Label kecil di sisi kiri bagian                  |
| `headline`            | Judul bagian                                     |
| `members[].photo.src` | Alamat foto, lihat Bagian 4                      |
| `members[].photo.alt` | Penjelasan singkat foto                          |
| `members[].name`      | Nama orang. Dirancang untuk 2 orang              |
| `members[].role`      | Jabatan                                          |
| `members[].bio`       | Riwayat singkat, muncul saat tombol buka ditekan |

### `contact.json`

| Kunci              | Mengatur apa                                   |
| ------------------ | ---------------------------------------------- |
| `label`            | Label kecil di sisi kiri bagian                |
| `headline`         | Judul bagian                                   |
| `channels[].type`  | Jenis kontak. Harus dari enam kata di Bagian 7 |
| `channels[].label` | Tulisan di sisi kiri baris, contoh `Email`     |
| `channels[].value` | Isi yang tampil dan yang dijadikan tautan      |
| `channels[].href`  | Hanya untuk `address`, lihat Bagian 7          |

---

## 3. Mengubah teks

Cara mengubahnya sama untuk semua file: cari kunci yang Anda tuju di peta
Bagian 2, lalu ganti tulisan di dalam tanda kutip sebelah kanan.

Contoh pada `site.json`.

Sebelum:

```json
"logo": { "wordmark": "PLACEHOLDER" }
```

Sesudah:

```json
"logo": { "wordmark": "PT Nama Perusahaan" }
```

Contoh pada `hero.json`, mengganti tiga baris sekaligus:

Sebelum:

```json
"eyebrow": "Lorem ipsum dolor",
"headline": "Lorem ipsum dolor sit amet consectetur adipiscing elit",
"subheadline": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
```

Sesudah:

```json
"eyebrow": "Konsultan Teknologi",
"headline": "Solusi Teknologi untuk Bisnis Anda",
"subheadline": "Kami membantu perusahaan merancang dan membangun sistem yang andal."
```

Contoh pada `services.json`, satu layanan:

Sebelum:

```json
{
  "icon": "code",
  "name": "Service Name Placeholder 01",
  "description": "Lorem ipsum dolor sit amet."
}
```

Sesudah:

```json
{
  "icon": "code",
  "name": "Pengembangan Aplikasi",
  "description": "Kami membangun aplikasi web dan mobile sesuai kebutuhan."
}
```

Contoh pada `team.json`, satu orang:

Sebelum:

```json
{
  "name": "Team Member Placeholder 01",
  "role": "Role Placeholder",
  "bio": "Lorem ipsum dolor sit amet."
}
```

Sesudah:

```json
{
  "name": "Budi Santoso",
  "role": "Direktur Teknologi",
  "bio": "Budi memimpin tim rekayasa sejak 2018."
}
```

### Tanda kutip di dalam teks

Kalau teks Anda sendiri mengandung tanda kutip, tambahkan garis miring
terbalik di depannya, supaya website tidak salah membaca di mana teksnya
berakhir:

```json
"headline": "Kami menyebutnya \"satu atap\""
```

---

## 4. Mengubah gambar

Ada empat tempat gambar di website ini. Semua file gambar disimpan di folder
`public/assets/images/`.

| Tempat gambar         | Nama file sekarang                           | Ukuran      | Cara gambar menyesuaikan kotaknya         |
| --------------------- | -------------------------------------------- | ----------- | ----------------------------------------- |
| Latar belakang Hero   | `hero-bg.jpg`                                | 1920 × 1080 | Dipotong agar memenuhi kotak              |
| Logo klien Portfolio  | `portfolio-01.png` sampai `portfolio-06.png` | 600 × 200   | Dikecilkan utuh, tidak pernah dipotong    |
| Foto anggota Tim      | `team-01.jpg`, `team-02.jpg`                 | 800 × 800   | Dipotong agar memenuhi kotak persegi      |
| Gambar saat dibagikan | `hero-bg.jpg` (dipakai ulang)                | 1920 × 1080 | Ditentukan oleh WhatsApp/LinkedIn sendiri |

### Cara paling mudah: pakai nama file yang sama

Siapkan gambar baru, beri **nama file yang sama persis** dengan yang lama,
lalu timpa file lama di folder `public/assets/images/`. Selesai — tidak ada
yang perlu diubah di file JSON mana pun.

### Kalau Anda ingin memakai nama file baru

Simpan gambar baru ke folder yang sama, lalu ubah nilai `src` yang menunjuk ke
gambar itu. Tempat `src` untuk tiap gambar:

| Tempat gambar         | File JSON        | Kunci                  |
| --------------------- | ---------------- | ---------------------- |
| Latar belakang Hero   | `hero.json`      | `backgroundImage.src`  |
| Logo klien ke-1       | `portfolio.json` | `items[0].logo.src`    |
| Foto anggota tim ke-1 | `team.json`      | `members[0].photo.src` |
| Gambar saat dibagikan | `site.json`      | `meta.ogImage.src`     |

Nilai `src` selalu ditulis dengan pola yang sama: diawali garis miring, lalu
`assets/images/`, lalu nama filenya.

```json
"backgroundImage": { "src": "/assets/images/hero-bg.jpg", "alt": "Kantor kami dari luar" }
```

Yang sering salah: menulis alamat lengkap dari komputer Anda seperti
`C:\Users\...`, atau lupa garis miring paling depan. Keduanya membuat gambar
tidak muncul.

### Format dan ukuran file

Gunakan `.jpg` untuk foto dan `.png` untuk logo yang punya latar transparan.
Website akan mengubahnya sendiri ke format modern yang lebih ringan, jadi Anda
tidak perlu memikirkan itu.

Ukuran piksel di tabel di atas adalah ukuran yang dirancang. Ukuran lain tetap
tampil, tapi perhatikan kolom terakhir tabel: gambar Hero dan foto tim akan
**dipotong** kalau perbandingan sisinya berbeda, jadi jangan letakkan wajah
atau tulisan penting terlalu dekat ke tepi. Logo Portfolio tidak pernah
dipotong, hanya dikecilkan sampai muat.

### Kunci `alt` wajib ikut diubah

Setiap gambar punya kunci `alt` di sebelah `src`. Isinya kalimat pendek yang
menjelaskan isi gambar. Kalimat itu dibaca keras oleh pembaca layar untuk
pengunjung tunanetra, dan dibaca oleh mesin pencari. Setiap kali gambar
diganti, ganti juga `alt`-nya supaya tetap menggambarkan gambar yang baru.

Tulis apa yang terlihat, bukan kata umum:

```json
"alt": "Tim sedang berdiskusi di ruang rapat"
```

bukan

```json
"alt": "gambar"
```

---

## 5. Tautan

Ada dua jenis tautan di website ini, dan aturannya berbeda.

### Tautan ke bagian halaman ini sendiri — jangan diubah

Nilai yang diawali tanda pagar (`#about`, `#purpose`, `#services`,
`#portfolio`, `#team`, `#contact`) adalah alamat bagian di halaman ini
sendiri. Kalau diubah, tombol atau menu itu tidak akan membawa pengunjung ke
mana-mana.

Kunci yang berisi tautan jenis ini:

- `site.json` → `nav[].href`
- `site.json` → `cta.href`
- `site.json` → `footer.nav[].href`
- `hero.json` → `actions[].href`

Tulisan yang tampil (`label`) di sebelahnya **boleh** diganti sesuka Anda.
Yang tidak boleh diganti hanya `href`-nya.

Sebelum:

```json
{ "label": "About", "href": "#about" }
```

Sesudah:

```json
{ "label": "Tentang Kami", "href": "#about" }
```

### Tautan ke luar website — boleh diisi bebas

Tautan ke Instagram, LinkedIn, atau peta ditulis lengkap beserta `https://`
di depannya, dan letaknya di `contact.json`. Cara menulisnya dijelaskan di
Bagian 7.

---

## 6. Daftar nama ikon untuk `services.json`

Setiap item di `services.json` punya kunci `"icon"`. Nilainya harus **persis
sama** dengan salah satu dari 20 nama berikut. Semuanya huruf kecil, dan nama
dua kata memakai tanda hubung.

```
boxes, cloud, code, cpu, database, globe, headphones, layers, line-chart,
lock, monitor, network, search, server, settings, shield, smartphone,
terminal, workflow, wrench
```

Nama di luar daftar ini akan tampil sebagai lingkaran putus-putus. Lihat
Bagian 10.

---

## 7. Menambah dan menghapus item

`services.json`, `portfolio.json`, dan `team.json` masing-masing punya satu
daftar: `items` untuk dua yang pertama, `members` untuk tim. `contact.json`
punya daftar `channels`. Menambah atau menghapus baris berarti menambah atau
menghapus satu blok `{ ... }` di dalam daftar itu.

**Menambah**: salin satu blok `{ ... }` yang sudah ada beserta kurung kurawal
pembuka dan penutupnya, tempel di bawah blok terakhir, beri tanda koma `,` di
akhir blok sebelumnya, lalu ubah isinya.

**Menghapus**: hapus satu blok `{ ... }` secara utuh beserta satu tanda koma
di dekatnya, supaya tidak tersisa koma ganda atau koma menggantung di akhir
daftar.

Jumlah yang dirancang untuk tampilan halaman ini:

| File             | Kunci daftar | Jumlah yang dirancang |
| ---------------- | ------------ | --------------------- |
| `services.json`  | `items`      | 12 item               |
| `portfolio.json` | `items`      | 6 item                |
| `team.json`      | `members`    | 2 orang               |

Menambah atau mengurangi sedikit tidak merusak website, tapi jumlah yang jauh
berbeda akan membuat susunannya terasa janggal, misalnya baris terakhir yang
hanya terisi satu kolom.

Khusus `portfolio.json`: item yang punya isi `"description"` akan mendapat
tombol buka-tutup detail. Item yang kunci `"description"`-nya dihapus akan
tampil sebagai baris biasa tanpa tombol.

### Channel kontak

Setiap channel di `contact.json` punya kunci `"type"` yang nilainya harus
persis salah satu dari enam kata berikut. Kata itu menentukan apa yang terjadi
saat pengunjung menekannya:

| `type`     | Yang dihasilkan                                                            |
| ---------- | -------------------------------------------------------------------------- |
| `email`    | Tautan yang membuka aplikasi email, plus tombol salin                      |
| `phone`    | Tautan yang bisa langsung ditelepon dari HP, plus tombol salin             |
| `whatsapp` | Tautan yang membuka WhatsApp memakai angka di `"value"`, plus tombol salin |
| `social`   | Tautan biasa memakai `"value"` apa adanya — isi dengan alamat web lengkap  |
| `address`  | Teks biasa, bukan tautan, kecuali diberi kunci `"href"` tambahan           |
| `hours`    | Selalu teks biasa, tidak pernah menjadi tautan                             |

Contoh menambah Instagram:

```json
{ "type": "social", "label": "Instagram", "value": "https://instagram.com/perusahaananda" }
```

Contoh membuat alamat kantor bisa diklik dan membuka peta:

```json
{
  "type": "address",
  "label": "Kantor",
  "value": "Jalan Merdeka No. 1, Jakarta",
  "href": "https://maps.google.com/?q=Jalan+Merdeka+No+1+Jakarta"
}
```

---

## 8. Yang tidak boleh diubah

- **Nama kunci**, yaitu tulisan sebelum tanda titik dua seperti `headline`,
  `items`, `type`, `href`. Itu nama teknis, bukan teks yang tampil.
  Mengubahnya, menghapusnya, atau menerjemahkannya akan membuat bagian itu
  berhenti tampil.
- **Struktur daftar**, yaitu tanda kurung siku `[ ]` yang membungkus deretan
  blok `{ ... }`. Jangan dihapus dan jangan diganti jenis tandanya.
- **Nilai `href` yang diawali tanda pagar**, seperti dijelaskan di Bagian 5.

---

## 9. Memeriksa file sebelum diunggah

Sebelum mengunggah file JSON yang sudah diubah, periksa dulu susunannya.
Kesalahan paling umum adalah kurang tanda kutip, kurang koma, atau koma
menggantung di akhir daftar.

1. Buka situs pemeriksa JSON, misalnya <https://jsonlint.com>.
2. Salin **seluruh** isi file yang sudah diubah, tempel ke kotak di situs itu.
3. Tekan tombol "Validate JSON".
4. Kalau muncul pesan "Valid JSON", file aman diunggah. Kalau muncul pesan
   merah, situs itu akan menunjukkan baris tempat kesalahannya.

Satu hal yang sering membingungkan: JSON tidak mengenal catatan atau komentar.
Kalau Anda menambahkan catatan untuk diri sendiri di dalam file, dengan tanda
`//` atau tanda apa pun, seluruh file menjadi tidak terbaca. Simpan catatan di
tempat lain.

---

## 10. Kalau ada yang tidak beres

**Satu bagian halaman terlihat kosong atau kehilangan sebagian besar isinya**

Penyebab paling umum: ada kesalahan susunan di file JSON bagian itu. Kalau
seluruh file tidak terbaca, bagian itu hanya menampilkan judulnya saja.
Perbaikan: buka file yang namanya sama dengan nama bagian, misalnya
`services.json` untuk bagian Services, periksa dengan cara di Bagian 9, lalu
perbaiki baris yang ditunjuk.

**Hanya satu baris yang hilang, sisanya normal**

Satu baris yang susunannya salah akan dibuang sendiri tanpa mengganggu yang
lain. Periksa blok `{ ... }` yang hilang itu: biasanya ada kunci yang wajib
tapi terhapus, atau nilai `"type"` yang salah ketik.

**Gambar tidak muncul, hanya ruang kosong**

Periksa nilai `src`-nya di file yang bersangkutan menurut tabel di Bagian 4.
Tiga penyebab tersering: nama file tidak sama persis dengan file yang ada di
folder termasuk huruf besar-kecilnya, garis miring paling depan hilang, atau
filenya belum benar-benar diunggah ke `public/assets/images/`.

**Sebuah ikon di bagian Services tampil sebagai lingkaran putus-putus**

Nilai `"icon"` pada item itu tidak sama persis dengan salah satu nama di
Bagian 6, biasanya karena salah ketik, memakai huruf besar, atau lupa tanda
hubung. Perbaikan: ganti dengan nama yang tertulis persis di Bagian 6.

**Tautan di bagian Contact tidak mengarah ke mana-mana**

Dua kemungkinan, keduanya di `contact.json`:

1. Nilai `"type"` salah ketik. Channel dengan `"type"` yang tidak dikenal
   dibuang seluruhnya dari halaman. Perbaiki ejaannya sampai sama persis
   dengan salah satu dari `email`, `phone`, `whatsapp`, `address`, `social`,
   `hours`.
2. Channel itu bertipe `address` atau `hours`. Keduanya memang sengaja tidak
   pernah menjadi tautan, kecuali `address` diberi kunci `"href"` tambahan
   seperti contoh di Bagian 7. Kalau ini yang terjadi, tidak ada yang rusak.

**Judul di tab browser masih tulisan lama**

Judul tab diatur oleh `meta.title` di `site.json`, bukan oleh `headline` di
`hero.json`. Keduanya memang berbeda dan boleh berbeda isinya.
