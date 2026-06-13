<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Saya ingin membuat aplikasi penjadwalan pertandingan badminton ganda untuk komunitas mabar.

Target utama aplikasi adalah membantu admin menentukan pemain yang bermain pada match berikutnya dengan tetap menjaga rotasi, keadilan, dan keseimbangan level permainan.

Platform

Buat aplikasi berbasis web (HTML + CSS + JavaScript) yang mobile friendly dan dapat dijalankan dengan nyaman di HP Android.

Lebih disukai berupa Progressive Web App (PWA) sehingga bisa diinstall dari browser ke home screen.

Tidak memerlukan backend atau database online. Semua data dapat disimpan lokal di browser.

Konsep Dasar

- 1 match terdiri dari 4 pemain.
- Badminton dimainkan dalam format ganda (2 vs 2).
- Biasanya terdapat 11 pemain reguler.
- Saya (admin) bisa masuk sebagai pemain tambahan ke-12 jika diperlukan.
- Total target sekitar 9 match dalam satu sesi.

Input Awal

Sebelum pertandingan dimulai saya akan menginput:

- Nama pemain
- Level pemain (1-5)

Namun level bisa belum diketahui saat pemain baru datang.

Karena itu level boleh kosong terlebih dahulu dan dapat diubah kapan saja.

Contoh:

Nama: Fadhil
Level: 5

Nama: Rohman
Level: 3

Nama: Alvin
Level: belum diketahui

Match Awal

Match F dan Match G akan saya tentukan secara manual berdasarkan urutan kedatangan.

Aplikasi tidak perlu membuat Match F dan Match G.

Saya akan memasukkan sendiri siapa saja yang bermain pada Match F dan Match G.

Match H juga bisa saya tentukan secara manual jika kondisi lapangan belum stabil atau masih ada pemain yang belum datang.

Setelah histori Match F, G, dan mungkin H tersedia, aplikasi mulai membantu membuat rekomendasi match berikutnya.

Tujuan Utama Aplikasi

Aplikasi tidak harus membuat seluruh jadwal dari awal sampai akhir.

Aplikasi cukup menjadi asisten penjadwal.

Setiap kali saya menekan tombol:

"Generate Match Berikutnya"

aplikasi memberikan beberapa rekomendasi match terbaik.

Hard Constraints (WAJIB)

1. Tidak boleh main berturut-turut.

Jika seorang pemain bermain di Match F maka dia tidak boleh bermain di Match G.

2. Tidak boleh menunggu lebih dari 2 match.

Contoh:

Main di F
Tidak main di G
Tidak main di H
Maka wajib main di J

Jika tidak dimainkan di J maka jadwal dianggap tidak valid.

3. Setiap match harus berisi tepat 4 pemain.

4. Histori pertandingan harus disimpan.

Aplikasi harus mengetahui:

- siapa pernah menjadi partner siapa
- siapa pernah menjadi lawan siapa
- berapa kali setiap pemain bermain
- match terakhir yang dimainkan

Soft Constraints (Prioritas Tinggi)

1. Keseimbangan level adalah prioritas tertinggi setelah hard constraints terpenuhi.

2. Partner yang sama sebisa mungkin tidak terulang.

Contoh:

Jika pernah:

A + B vs C + D

maka di match berikutnya lebih baik jangan ada pasangan A + B lagi.

3. Lawan yang sama sebisa mungkin tidak terulang.

Namun jika harus memilih antara:

- partner berulang
  atau
- lawan berulang

maka lawan berulang lebih dapat diterima.

4. Jumlah bermain diusahakan merata.

Target umum adalah sekitar 3 kali bermain per pemain.

Namun ini tidak lebih penting daripada keseimbangan level.

Prioritas Algoritma

Urutan prioritas:

1. Pemain yang sudah menunggu 2 match harus dimainkan.
2. Pemain yang bermain pada match sebelumnya tidak boleh dimainkan.
3. Cari kombinasi pemain yang levelnya paling seimbang.
4. Hindari partner berulang.
5. Hindari lawan berulang.
6. Ratakan jumlah bermain.

Penentuan Pasangan

Jika sudah terpilih 4 pemain:

A
B
C
D

Aplikasi harus mencoba seluruh kombinasi pasangan yang mungkin:

A+B vs C+D
A+C vs B+D
A+D vs B+C

Kemudian memilih pasangan terbaik berdasarkan:

1. Tidak mengulang partner.
2. Selisih total level tim sekecil mungkin.

Contoh:

A=5
B=4
C=3
D=2

Maka:

A+D = 7
B+C = 7

lebih baik daripada:

A+B = 9
C+D = 5

Sistem Rekomendasi

Jangan hanya menghasilkan 1 rekomendasi.

Tampilkan minimal 3 rekomendasi terbaik.

Contoh:

Rekomendasi 1
Skor 95

Rekomendasi 2
Skor 92

Rekomendasi 3
Skor 90

Dengan begitu admin tetap dapat memilih secara manual.

Fitur Tambahan

Dashboard pemain:

- Nama
- Level
- Total bermain
- Match terakhir
- Jumlah partner unik
- Jumlah lawan unik

Riwayat pertandingan:

Match F
Match G
Match H
Match J
dst

Fitur Admin

Saya dapat:

- Mengubah level pemain kapan saja.
- Mengedit hasil match sebelumnya.
- Menambahkan pemain baru.
- Menonaktifkan pemain yang pulang lebih awal.
- Menambahkan diri saya sebagai pemain cadangan/joker.

Pemain Admin (Joker)

Admin bukan bagian utama algoritma.

Admin dapat dimasukkan kapan saja sebagai pemain tambahan.

Jika terjadi kondisi sulit atau deadlock, admin dapat digunakan untuk membantu mengisi slot yang diperlukan.

Output Yang Diharapkan

Buat aplikasi lengkap yang:

- Mobile friendly
- Mudah dipakai di Android
- Tidak membutuhkan backend
- Menggunakan HTML, CSS, dan JavaScript modern
- Memiliki antarmuka sederhana dan cepat digunakan saat sedang mengelola pertandingan badminton di lapangan
- Fokus pada rekomendasi match berikutnya, bukan pembuatan jadwal penuh dari awal sampai akhir
<!-- END:nextjs-agent-rules -->

