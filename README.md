# Habit Tracker

Aplikasi web statis satu halaman untuk melacak kebiasaan harian. Implementasi yang tersedia berada di `index.html`, menggunakan HTML, CSS, dan JavaScript di dalam satu berkas.

## Menjalankan

Buka `index.html` langsung di browser. Tidak ada langkah instalasi atau skrip proyek yang tercantum.

Halaman memuat Tailwind CSS, ikon Lucide, pustaka `canvas-confetti`, dan font Inter dari CDN. Ketersediaan aset eksternal tersebut bergantung pada akses jaringan.

## Isi yang terlihat

Antarmuka menyediakan kolom untuk menambahkan kebiasaan, area daftar kebiasaan, indikator progres, serta tombol **Export**, **Import**, dan **Reset**. Tiap item dirancang untuk menampilkan status selesai dan jumlah hari streak, dengan kontrol edit dan hapus.

Kode yang terlihat menyimpan data melalui `localStorage` dengan kunci `habit-tracker-v2`. Logika pemuatan yang tersedia memeriksa tanggal dan mengatur ulang status harian serta streak berdasarkan tanggal penyelesaian terakhir.

## Struktur

- `index.html` — antarmuka, gaya, dan JavaScript aplikasi.

## Batasan dan verifikasi

Halaman menyediakan operasi menambah, mengedit, menghapus, serta menandai kebiasaan, perhitungan streak dan progres, ekspor/impor JSON, dan reset data melalui JavaScript di `index.html`. Fungsionalitas tersebut teridentifikasi dari kode dan belum diuji langsung dalam browser pada audit dokumentasi ini; tidak ada skrip pengujian otomatis di repositori.
