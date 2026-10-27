# Habit Tracker

Aplikasi web statis satu halaman untuk melacak kebiasaan harian. Implementasi yang tersedia berada di `index.html`, menggunakan HTML, CSS, dan JavaScript di dalam satu berkas.

## Menjalankan

Buka `index.html` langsung di browser, atau sajikan direktorinya:

```bash
python3 -m http.server 8000
```

Tidak ada langkah build. Satu-satunya skrip proyek adalah `npm run env:check`, yang memeriksa kesesuaian nama variabel lingkungan antara kode dan `.env.example`; halaman ini tidak membaca variabel lingkungan apa pun.

Halaman memuat Tailwind CSS, ikon Lucide, pustaka `canvas-confetti`, dan font Inter dari CDN. Ketersediaan aset eksternal tersebut bergantung pada akses jaringan.

## Isi yang terlihat

Antarmuka menyediakan kolom untuk menambahkan kebiasaan, area daftar kebiasaan, indikator progres, serta tombol **Export**, **Import**, dan **Reset**. Tiap item dirancang untuk menampilkan status selesai dan jumlah hari streak, dengan kontrol edit dan hapus.

Kode yang terlihat menyimpan data melalui `localStorage` dengan kunci `habit-tracker-v2`. Logika pemuatan yang tersedia memeriksa tanggal dan mengatur ulang status harian serta streak berdasarkan tanggal penyelesaian terakhir.

## Struktur

- `index.html`: antarmuka, gaya, dan JavaScript aplikasi.

## Batasan dan verifikasi

Halaman menyediakan operasi menambah, mengedit, menghapus, serta menandai kebiasaan, perhitungan streak dan progres, ekspor/impor JSON, dan reset data melalui JavaScript di `index.html`.

Verifikasi terakhir dijalankan di browser pada 375px dan desktop: menambah kebiasaan, menandai selesai lewat checkbox dengan keyboard, mengedit, menghapus dengan konfirmasi, reset dengan konfirmasi, dan pemulihan dari `localStorage` yang rusak. Tidak ada skrip pengujian otomatis di repositori.
