# Riset arah desain: company profile IT consultant, monokrom, high-tech

Status: bahan eksplorasi, bukan rekomendasi final.
Disusun untuk diskusi sebelum keputusan redesign.

## 0. Batas metodologi, baca dulu

Riset ini dikumpulkan lewat pencarian dan pembacaan teks. **Situs-situs referensi tidak
dilihat secara visual.** Karakterisasi tampilan di bawah berasal dari analisis pihak ketiga
dan dokumentasi, bukan dari pengamatan langsung.

Konsekuensinya: gunakan bagian benchmark sebagai daftar kandidat untuk kamu buka sendiri,
bukan sebagai penilaian visual yang sudah selesai. Setiap klaim yang bersumber diberi tautan;
setiap klaim yang merupakan penalaran saya ditandai sebagai penalaran.

Permintaan awal menyebut 10 sampai 15 contoh konkret dengan analisis visual. Saya tidak bisa
memenuhi itu secara jujur. Yang bisa saya berikan: delapan referensi yang karakternya
terverifikasi dari sumber sekunder, plus dua koleksi kurasi yang bisa kamu telusuri langsung.

---

## 1. Ringkasan temuan utama

**1.1 Desain visual adalah faktor kredibilitas nomor satu, di atas konten dan testimoni.**
Stanford Web Credibility Research menempatkan kualitas desain visual di atas semua faktor lain
dalam penilaian pengguna terhadap kelayakpercayaan sebuah situs, dan penilaian itu terbentuk
dalam waktu di bawah 50 milidetik. Ini secara langsung membenarkan kekhawatiranmu: klien
memang menilai kapabilitas teknis dari tampilan, sebelum membaca satu kalimat pun.

**1.2 Tapi yang dinilai bukan "kecanggihan", melainkan konsistensi.**
Forrester Business Trust Survey, dengan analisis MaxDiff atas 1.420 pengambil keputusan
pembelian global, menempatkan tiga pendorong teratas kepercayaan B2B: **kompetensi,
konsistensi, dan keandalan**. Tidak ada "inovasi visual" di tiga besar. Ini penting karena
mengubah target: yang perlu dikejar bukan efek futuristik, melainkan sistem yang terlihat
dijalankan dengan disiplin.

**1.3 Estetika "high-tech monokrom" sudah punya nama dan sudah jadi tren yang dikenali.**
Yang kamu bayangkan sebagai futuristik kemungkinan besar adalah keluarga Vercel/Linear/Raycast:
nyaris greyscale, tipografi memikul semua beban, grid halus di latar. Itu bukan penemuan;
itu pola yang sudah didokumentasikan lengkap dengan angka opasitasnya. Konsekuensi:
mengejarnya dengan benar memberi kesan kompeten, mengejarnya tanpa disiplin memberi kesan
mengikuti tren.

**1.4 Slop AI 2026 punya sidik jari yang spesifik dan sudah diinventarisasi.**
Kritik tahun ini menyebut polanya berulang: gradient ungu, font Inter, empat kartu dalam grid.
Yang lebih tajam: AI menghasilkan "situs median untuk kategorimu" — homogenisasi terjadi di
tingkat konsep, bukan cuma visual. Struktur section, urutan narasi, dan pilihan strategisnya
ikut seragam. Ini berarti menghindari slop bukan soal mengganti warna aksen, melainkan soal
struktur halaman yang tidak median.

**1.5 Case study adalah alat kredibilitas terkuat yang kamu punya, dan itu konten, bukan gaya.**
42% pembeli B2B menyebut case study sebagai jenis konten paling berpengaruh dalam keputusan
mereka. Tidak ada perlakuan visual yang menandingi bukti pekerjaan nyata. Ini relevan langsung
dengan situasi kita: konten sekarang seluruhnya placeholder, jadi sebagian rasa "kurang
meyakinkan" berasal dari ketiadaan bukti, bukan dari desainnya.

---

## 2. Benchmark dan referensi

Delapan referensi dengan karakter terverifikasi, ditambah dua koleksi untuk penelusuran sendiri.

### 2.1 Vercel — "Blueprint Grid"

Pola yang paling terdokumentasi di seluruh riset ini, sampai ke angkanya.

Karakteristik terverifikasi: grid garis atau titik berulang di belakang konten, opasitas
**10 sampai 20 persen**, jarak berbasis kelipatan **8 atau 16 piksel**, warna sekitar `#E5E7EB`
di atas latar putih, garis tipis dengan jarak seragam. Didukung sistem desain Geist: tipografi
bersih, whitespace longgar, animasi fungsional yang tidak mencolok.

Mekanisme psikologisnya dinyatakan eksplisit di sumber: otak memproses grid sebagai terorganisir
dan disengaja, sehingga membentuk kepercayaan lewat pengenalan pola.

Peringatan dari sumber yang sama, dan ini yang paling berguna buat kita:

- Di atas 15 sampai 20 persen opasitas, grid terlalu kuat.
- Mencampur jarak grid yang berbeda merusak ilusi presisinya.
- Grid gagal total kalau tidak didukung sistem yang konsisten. Sebagai dekorasi berdiri sendiri
  dia tidak bekerja.
- Ada risiko kontras aksesibilitas pada grid terang di latar putih.

Relevansi: ini kandidat terkuat untuk "high-tech tanpa slop", karena efeknya datang dari
struktur, bukan dari efek. Risikonya: namanya sudah "Vercel aesthetic", jadi eksekusi yang
malas akan terbaca sebagai meniru.

Sumber: [Setproduct, Complete Guide to Blueprint Grid Design](https://www.setproduct.com/blog/complete-guide-to-blueprint-grid-design)

### 2.2 Linear

Punya artikel analisis tersendiri berjudul "The Linear Look", yang menandakan gayanya cukup
khas untuk dibedah orang lain. Dikelompokkan bersama Vercel dan Raycast sebagai satu keluarga
estetika.

Sumber: [Frontend Horse, The Linear Look](https://frontend.horse/articles/the-linear-look/) ·
[Studio Maydit, The Linear, Vercel, and Raycast Aesthetic](https://studiomaydit.com/blog/linear-vercel-raycast-aesthetic)

### 2.3 Raycast, Stripe, Tailwind

Disebut sebagai pengadopsi pola yang sama. Stripe dan Tailwind bukan monokrom, jadi nilainya
di sini adalah sebagai pembanding: mereka menunjukkan bagaimana disiplin sistem yang sama
bekerja meski paletnya berbeda.

### 2.4 Prinsip yang diekstrak dari keluarga ini

Sumber sekunder merangkum lima prinsip yang lebih berguna daripada meniru tampilannya:
investasi pada tipografi lebih dulu; memotong tanpa ampun sampai setiap section punya alasan
untuk ada; palet tertahan dengan paling banyak satu aksen; **menampilkan produk sungguhan
dengan perhatian sungguhan**; dan menambahkan gerak hanya di tempat yang memandu.

Catatan penting soal aksen: sumber menyebut palet keluarga ini umumnya "nyaris greyscale
dengan satu warna aksen yang disengaja, dipakai hemat", dan bahwa **justru penahanan diri
itulah yang membuat aksennya bekerja**. Vercel sendiri disebut memakai hitam dan putih murni
tanpa aksen sama sekali. Jadi keduanya valid; yang tidak valid adalah aksen tanpa penahanan.

### 2.5 Anduril

Relevan sebagai kasus batas, bukan sebagai model untuk ditiru.

Terverifikasi: pabrik Arsenal-1 mereka bergaya brutalis, dan perusahaan ini berperilaku seperti
perusahaan produk, bukan kontraktor pertahanan tradisional. Fast Company memuat liputan
eksklusif tentang design lab mereka.

Yang perlu kamu tahu sebelum mengambil apa pun dari sini: estetika Palantir dan Anduril sudah
jadi objek kritik budaya, dengan pembacaan politis yang eksplisit. Meminjam bahasa visualnya
membawa asosiasi itu.

Sumber: [Fast Company, inside Anduril's design lab](https://www.fastcompany.com/91527326/anduril-redesigning-future-of-warfare) ·
[Artforum, Palantir, Anduril and the aesthetics of avant-garde fascism](https://www.artforum.com/features/simon-denny-art-defense-tech-1234747490/)

### 2.6 Gaya Swiss / International Typographic Style

Bukan perusahaan, melainkan sistem yang mendasari sebagian besar referensi di atas.

Terverifikasi sebagai penerapan modern: grid 12 kolom ketat, sans-serif kelas Helvetica,
rata kiri, dan **hierarki hanya lewat ukuran dan bobot**. CSS Grid dan Flexbox membuat presisi
matematisnya bisa diterapkan langsung.

Nilai strategisnya: sumber menekankan ini "bukan gaya atau tren, melainkan filosofi desain".
Artinya rendah risiko cepat basi, tinggi risiko terlihat biasa kalau tipografinya tidak kuat.

Sumber: [Pixeldarts, Swiss Web Design Guide](https://www.pixeldarts.com/en/post/swiss-style-web-design-a-comprehensive-guide) ·
[Digital Heroes, Swiss Grid Web Design 2026](https://digitalheroes.co.in/styles/swiss-grid/)

### 2.7 Brutalisme web

Terverifikasi: skema monokrom, latar warna solid, tipografi minimalis, asimetri disengaja,
antarmuka yang terasa mentah namun sangat disengaja. Menolak ornamen demi visual yang tegas.

Relevansi: satu-satunya arah di riset ini yang secara struktural mustahil dikira keluaran AI
median. Risikonya bertabrakan langsung dengan syarat "profesional" untuk pembeli B2B enterprise.

Sumber: [TodayMade, Brutalism in Web Design](https://www.todaymade.com/blog/brutalist-web-design) ·
[DesignMantic, The Rise of Brutalism in Web Design](https://www.designmantic.com/blog/brutalism-in-web-design/)

### 2.8 Konvensi situs developer tool

Terverifikasi sebagai pola sektor: latar gelap, typeface monospace, estetika terminal, dengan
**light mode sebagai toggle, bukan default**. Ini menandakan kompetensi kepada audiens teknis.

Catatan penting untuk kasus kita: audiens company profile IT consultant bukan developer,
melainkan pembeli. Meminjam kode visual developer tool bisa berbicara kepada orang yang salah.

### 2.9 Dua koleksi untuk kamu telusuri sendiri

Karena saya tidak bisa melihat, dua ini adalah cara tercepat kamu mengumpulkan referensi visual
sungguhan:

- [Awwwards, Black and White Websites collection](https://www.awwwards.com/awwwards_collections/collections/black-and-white-websites/)
- [Awwwards, Design Agencies](https://www.awwwards.com/inspiration_search/Design%20Agencies/)

---

## 3. Peta arah desain potensial

Empat arah. Semuanya monokrom dan semuanya menghindari daftar larangan di bagian 5.

### Arah A — Technical Precision (blueprint)

**Konsep.** Halaman memperlihatkan sistem koordinatnya sendiri. Grid halus di latar, penanda
sudut, label mono untuk metadata, blok yang terbaca seperti lembar spesifikasi.

**Elemen kunci.** Grid 10 sampai 20 persen opasitas pada kelipatan 8 atau 16 piksel; satu jarak
grid untuk seluruh situs; mono hanya untuk label dan data, tidak untuk prosa; whitespace longgar
melawan blok informasi rapat.

**Referensi.** Vercel, Linear, Raycast.

**Kelebihan.** Kesan teknis datang dari struktur, bukan efek, jadi tidak mudah basi. Angkanya
terdokumentasi sehingga eksekusinya bisa diperiksa, bukan dikira-kira.

**Risiko.** Sudah bernama. Eksekusi setengah jadi terbaca sebagai meniru situs dev tool. Sumber
menyebut pola ini kurang efektif di luar dev tool dan SaaS teknis. Grid terang di latar putih
punya risiko kontras.

**Catatan adaptasi.** Untuk IT consultant, gridnya perlu membawa informasi, bukan cuma tekstur.
Grid yang menandai kolom layout sungguhan berbeda dari grid yang ditempel sebagai wallpaper.

### Arah B — Swiss Editorial Systems

**Konsep.** Grid 12 kolom ketat, rata kiri, hierarki hanya lewat ukuran dan bobot, nol dekorasi.
Kesan kompeten datang dari ketiadaan kesalahan.

**Elemen kunci.** Satu keluarga huruf dengan rentang bobot lebar; skala tipe yang jelas
bertingkat; margin dan gutter yang konsisten sampai piksel; garis hanya sebagai batas struktural.

**Kelebihan.** Timeless secara eksplisit, bukan tren. Paling sejalan dengan "profesional".
Paling murah dirawat karena aturannya sedikit dan tegas.

**Risiko.** Ini paling dekat dengan posisi desain sekarang, yang justru kamu nilai kurang
high-tech. Tanpa tipografi yang benar-benar kuat, hasilnya terbaca sebagai portofolio agensi
desain, bukan perusahaan teknologi.

**Catatan adaptasi.** Kalau arah ini dipilih, pembeda "teknologi" harus datang dari konten dan
kerapatan informasi, bukan dari perlakuan visual.

### Arah C — Structural / Brutalist terkendali

**Konsep.** Struktur halaman diekspos mentah. Asimetri disengaja, tipe besar, blok padat,
transisi keras antar bagian.

**Kelebihan.** Satu-satunya arah yang secara struktural tidak mungkin dikira output AI median.
Paling mudah diingat.

**Risiko.** Bertabrakan dengan syarat profesional untuk pembeli enterprise. Membawa asosiasi
politis lewat kedekatannya dengan estetika Palantir dan Anduril. Paling bergantung pada selera
eksekutor; sedikit meleset langsung terbaca amatir.

### Arah D — Product Surface (antarmuka sebagai bukti)

**Konsep.** Yang ditampilkan bukan ilustrasi tentang teknologi, melainkan artefak teknologi
sungguhan: diagram arsitektur, potongan dashboard, peta sistem, alur kerja nyata.

**Kelebihan.** Menyerang langsung ketakutan intimu, yaitu klien meragukan kapabilitas. Ini
satu-satunya arah yang didukung data keras: 42% pembeli B2B menyebut case study paling
berpengaruh, dan Forrester menempatkan kompetensi sebagai pendorong kepercayaan nomor satu.
Prinsip "tampilkan produk sungguhan dengan perhatian sungguhan" muncul di ekstraksi keluarga
Vercel juga.

**Risiko.** Membutuhkan konten nyata. Dengan placeholder, arah ini kosong. Ini juga arah yang
paling mahal dari sisi produksi konten, bukan dari sisi desain.

**Catatan adaptasi.** Bisa dikombinasikan dengan A atau B sebagai lapisan konten, bukan sebagai
gaya visual yang bersaing. Arah D menjawab "apakah mereka mampu", arah A dan B menjawab
"apakah mereka rapi".

---

## 4. Catatan khusus: monokrom dan masalah section selang-seling

### 4.1 Riset tidak mendukung penolakan mutlak terhadap selang-seling

Ini perlu dinyatakan jujur karena bertentangan dengan asumsi awal. Sumber layout justru
menyebut latar section berselang membantu memandu perhatian, memperkuat hierarki visual, dan
memisahkan blok konten besar dengan cepat.

Yang sumber peringatkan spesifik: **kontras yang keras terasa mengganggu**, dan pilihan harus
didasarkan pada pacing, bukan pada tren.

Penalaran saya, ditandai sebagai penalaran: masalah pada implementasi sekarang bukan
selang-selingnya, melainkan **amplitudonya**. Inversi penuh antara `#fafafa` dan `#1a1a1a` di
setiap section adalah ujung paling keras dari spektrum kontras yang sumber peringatkan, dan
diterapkan secara mekanis tanpa hubungan dengan isi section. Section yang berganti latar karena
gilirannya, bukan karena perannya berubah, adalah ritme tanpa alasan.

### 4.2 Tiga alternatif ritme yang tidak bergantung pada inversi

Ini penalaran saya berdasarkan pola di bagian 2, bukan kutipan langsung:

1. **Amplitudo dikurangi.** Ganti inversi penuh dengan pergeseran satu langkah grayscale
   (`paper` ke `mist`). Batas antar section tetap terbaca, tanpa hentakan.
2. **Ritme lewat kerapatan, bukan warna.** Satu latar sepanjang halaman, dan pergantian ditandai
   perubahan kerapatan informasi: blok padat, lalu blok lapang. Ini yang dilakukan keluarga
   Vercel.
3. **Inversi sebagai penekanan, bukan pola.** Satu atau dua blok gelap di seluruh halaman, di
   tempat yang memang layak ditekankan, bukan berselang otomatis.

### 4.3 Kedalaman dalam monokrom, tanpa bayangan

Sumber Swiss menegaskan hierarki lewat ukuran dan bobot saja. Sumber Vercel menambahkan bahwa
grid tipis dan whitespace memikul kerja pemisahan. Gabungannya: kedalaman monokrom datang dari
**nilai grayscale, ketebalan garis, dan jarak**, bukan dari efek.

Satu catatan angka yang bisa langsung dipakai: rentang opasitas 10 sampai 20 persen untuk
elemen struktural latar, dan sistem jarak yang berbasis satu kelipatan tunggal untuk seluruh
situs.

---

## 5. Daftar yang harus dihindari

### 5.1 Sidik jari slop AI 2026, terverifikasi dari sumber

- Gradient ungu, atau gradient warna apa pun sebagai latar hero
- Inter untuk segalanya
- Empat kartu dalam satu grid sebagai blok "layanan"
- **Struktur median**: urutan section, pola frasa, dan logika layout yang sama dengan setiap
  kompetitor yang mengetik prompt serupa. Ini yang paling berbahaya karena tidak terlihat
  sebagai masalah visual.

Sumber: [925 Studios, AI Slop Web Design Guide](https://www.925studios.co/blog/ai-slop-web-design-guide) ·
[DP1 Design, AI Website Builders 2026](https://dp1design.com/insights/ai-website-builders-pros-and-cons/)

### 5.2 Klise "teknologi" yang tidak membawa makna

Dari brief awal, dan konsisten dengan kritik di atas:

- Bentuk 3D abstrak melayang tanpa hubungan dengan layanan
- Partikel dan garis penghubung acak
- Ilustrasi otak neural network generik
- Ikon yang terlalu umum, dipakai sebagai pengisi
- Scanline, efek glitch, aksen hijau terminal
- Glassmorphism sebagai dekorasi

### 5.3 Kesalahan spesifik pada pola blueprint, dari sumbernya sendiri

- Opasitas grid di atas 20 persen
- Mencampur beberapa jarak grid berbeda dalam satu situs
- Grid tanpa sistem pendukung, sehingga jadi wallpaper
- Grid terang di latar putih yang gagal syarat kontras

---

## 6. Pertanyaan lanjutan sebelum masuk tahap desain

1. **Siapa pembacanya?** Konvensi visual developer tool berbicara kepada developer. Pembeli
   jasa konsultan IT sering bukan orang teknis. Kalau pembacanya CTO, arah A kuat. Kalau
   pembacanya direktur non-teknis, arah D lebih menentukan.

2. **Kapan ada konten nyata?** Arah D bergantung penuh pada case study, diagram, dan angka.
   Dengan placeholder, arah itu kosong. Kalau konten nyata baru ada beberapa bulan lagi,
   keputusannya berubah.

3. **Apakah nol aksen benar-benar syarat, atau hasil penyederhanaan?** Sumber menyebut keluarga
   ini umumnya memakai satu aksen yang sangat ditahan, dan penahanan itulah yang membuatnya
   bekerja. Monokrom murni tetap valid, tapi ini keputusan yang layak diambil sadar, bukan
   diwarisi.

4. **Seberapa besar toleransi terhadap risiko "terlihat seperti situs dev tool"?** Arah A punya
   nama yang dikenal. Kalau kompetitor di pasarmu juga memakainya, keunggulannya hilang.

5. **Berapa lama situs ini harus bertahan tanpa redesign?** Arah B paling tahan waktu, arah C
   paling cepat basi, arah A di tengah.

6. **Siapa yang akan merawatnya?** Arah B punya aturan paling sedikit dan paling mudah dijaga
   konsisten. Arah C paling bergantung pada selera orang yang mengeksekusi, dan paling cepat
   rusak di tangan berikutnya.
