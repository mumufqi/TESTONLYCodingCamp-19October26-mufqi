# CodingCamp-19October26-mufqi

To-Do List Life Dashboard untuk RevoU Coding Camp Software Engineering.

## Menjalankan

Buka `index.html` langsung di browser. Aplikasi memakai HTML, satu file CSS di `css/`, dan satu file vanilla JavaScript di `js/`. Tidak memerlukan backend, build, atau instalasi paket untuk digunakan.

## Fitur

- Waktu, tanggal, dan sapaan mengikuti waktu lokal perangkat.
- Timer fokus bawaan 25 menit, Start/Stop/Reset, notifikasi selesai, dan durasi kustom 1–120 menit bulat.
- Tambah, edit, tandai selesai, dan hapus task; tersimpan di Local Storage.
- Tambah dan hapus maksimal 20 Quick Links dengan URL HTTP(S); terbuka di tab baru.
- Tiga challenge: Light/Dark Mode, Custom Name, dan Change Pomodoro Time.

Data disimpan pada browser dan origin yang digunakan. Data dari file lokal, localhost pada port berbeda, dan GitHub Pages tidak otomatis berpindah atau tersinkron. Jika penyimpanan diblokir/penuh, perubahan tetap dapat digunakan selama sesi dan aplikasi memberi peringatan. Item tersimpan yang rusak dilewati tanpa menghentikan widget lainnya.

## Pengujian pengembangan (opsional untuk menjalankan aplikasi)

Dengan Node.js dan npm tersedia, jalankan `npm ci`, lalu `npm test -- --runInBand`.

Lima suite menguji fungsi aplikasi sebenarnya melalui ekspor CommonJS dan DOM dari `index.html`. Mencakup 17 property test (minimal 100 percobaan per properti), alur task/link, penyimpanan gagal/rusak, validasi URL/durasi, tema, serta timer saat callback terlambat. Hasil saat pembaruan: **68 tes lulus**. Status pemeriksaan browser dicatat di `.kiro/specs/todo-life-dashboard/tasks.md`.

Folder `node_modules/` adalah hasil instalasi lokal dan diabaikan Git. `package.json` dan `package-lock.json` tetap disertakan.

## Pengumpulan

1. Sertakan folder `.kiro` di repo.
2. Push perubahan melalui GitHub Desktop, lalu aktifkan GitHub Pages dari branch `main`, folder `/ (root)`.
3. Periksa URL website yang diterbitkan dan seluruh fitur pada Chrome, Firefox, Edge, dan Safari.
4. Kumpulkan AWS Builder ID, URL repo, dan URL website melalui formulir resmi CodingCamp.

Perubahan lokal dan tes otomatis belum membuktikan deployment atau pengumpulan formulir selesai.
