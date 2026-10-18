# Habit Tracker

Aplikasi web statis satu halaman untuk melacak kebiasaan harian. Implementasi yang tersedia berada di `index.html`, menggunakan HTML, CSS, dan JavaScript di dalam satu berkas.

## Menjalankan

Buka `index.html` langsung di browser. Tidak ada langkah instalasi atau skrip proyek yang tercantum.

Halaman memuat Tailwind CSS, ikon Lucide, pustaka `canvas-confetti`, dan font Inter dari CDN. Ketersediaan aset eksternal tersebut bergantung pada akses jaringan.

## Isi yang terlihat

Antarmuka menyediakan kolom untuk menambahkan kebiasaan, area daftar kebiasaan, indikator progres, serta tombol **Export**, **Import**, dan **Reset**. Tiap item dirancang untuk menampilkan status selesai dan jumlah hari streak, dengan kontrol edit dan hapus.

Kode yang terlihat menyimpan data melalui `localStorage` dengan kunci `habit-tracker-v2`. Logika pemuatan yang tersedia memeriksa tanggal dan mengatur ulang status harian serta streak berdasarkan tanggal penyelesaian terakhir.

## Struktur

- `index.html` - antarmuka, gaya, dan JavaScript aplikasi.
- `tests/security.test.cjs` - regresi browser untuk impor, penyimpanan, render, dan tanggal lokal.

## Batasan dan verifikasi

Nama kebiasaan dirender sebagai teks, termasuk nama yang berisi tag HTML. Impor memvalidasi seluruh berkas sebelum mengganti data: maksimal 1 MiB, 500 kebiasaan, 500 karakter JavaScript per nama yang tidak kosong, status `done` boolean, `streak` bilangan bulat 0–1.000.000, serta tanggal kalender `YYYY-MM-DD` atau `null` untuk penyelesaian terakhir. Ekspor lama dengan field lengkap tetap didukung. Data lama yang hanya memiliki nama memakai nilai awal `done: false`, `streak: 0`, dan `lastDoneDate: null`; tanggal berkas yang tidak tersedia memakai hari lokal saat ini. Field tambahan diabaikan.

Impor yang tidak valid atau gagal disimpan tidak mengganti daftar maupun data tersimpan. Data localStorage yang rusak tidak ditimpa saat startup; aplikasi menampilkan pesan dan daftar kosong. Menambah kebiasaan atau mengimpor cadangan yang valid kemudian menyimpan data baru. Ekspor hanya mencakup daftar yang sedang ditampilkan, bukan salinan data rusak tersebut.

Pergantian hari saat pemuatan dan impor memakai tanggal lokal browser. Tab yang terus terbuka melewati tengah malam masih perlu dimuat ulang. Riwayat streak lengkap, sinkronisasi antar-tab/perangkat, dan pemicu confetti belum diperbaiki dalam perubahan ini.

## Pengujian browser

Untuk menyiapkan alat tes (Node.js 20 atau lebih baru):

```sh
npm ci
npx playwright install chromium
npm test
```

Tes membuka halaman sintetis di Chromium, memblokir semua permintaan eksternal, dan memakai data lokal sintetis. Cakupannya meliputi nama HTML berbahaya saat impor/pemuatan ulang, ekspor-impor valid, data legacy, penolakan atomik schema/batas ukuran, pemulihan storage rusak, kegagalan penyimpanan, dan pergantian hari di Asia/Jakarta. Tes tidak membuktikan ketersediaan CDN, tampilan CSS, atau layanan produksi.
