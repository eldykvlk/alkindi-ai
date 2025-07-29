# Alkindi AI: Personalizing Early Childhood Education with AI

![Gambar 1: Tampilan Halaman Utama Alkindi AI atau Dashboard User](https://github.com/user-attachments/assets/32ea0f11-804d-4593-9e64-8d80f93233df)


## Deskripsi Proyek

Proyek **Alkindi AI** adalah sebuah inisiatif yang dikembangkan oleh Eldy Effendi, terinspirasi dari tantangan yang dipaparkan oleh startup Alkindi yang tergabung dalam program SheHacks. Proyek ini bertujuan untuk merevolusi pendidikan anak usia dini dengan menyediakan solusi pembelajaran yang dipersonalisasi dan berbasis nilai-nilai Islami, sejalan dengan misi Alkindi Eduprise "Membangun Generasi Muslim Brilian" (5B: Beriman, Berakhlak, Berilmu, Berkarya, Bermanfaat).

Melihat bahwa pendidikan terbaik adalah yang personal dan sesuai dengan karakteristik unik setiap anak, Alkindi AI hadir untuk menjawab kebutuhan orang tua dalam mengarahkan minat, bakat, dan kecenderungan anak mereka secara efektif. Lebih dari sekadar platform *marketplace* buku biasa, Alkindi AI menggunakan kekuatan *Artificial Intelligence* (AI) untuk memberikan rekomendasi yang cerdas dan relevan.

## Maksud Dibangunnya Proyek

Proyek ini dibangun dengan beberapa maksud utama:

1.  **Mengatasi Tantangan Personalisasi Pembelajaran:** Banyak platform pendidikan yang bersifat umum dan tidak mempertimbangkan keunikan setiap anak. Alkindi AI diciptakan untuk menyediakan *learning plan* yang dipersonalisasi, memastikan bahwa setiap rekomendasi konten edukasi (buku, solusi keilmuan, hadits) benar-benar sesuai dengan karakteristik, kebutuhan, dan minat individu anak.
2.  **Mempermudah Orang Tua dalam Mengarahkan Anak:** Orang tua seringkali kesulitan menemukan panduan yang tepat untuk membimbing anak mereka. Alkindi AI berfungsi sebagai asisten cerdas yang memberikan rekomendasi konkret, termasuk hadits *sahih* dan buku-buku relevan, sehingga orang tua bisa lebih efektif dalam membentuk pribadi anak yang Islami.
3.  **Meningkatkan Efisiensi Manajemen Konten Edukasi:** Bagi admin atau staf Alkindi Eduprise (atau lembaga serupa), proyek ini menyediakan panel manajemen informasi buku yang berbasis *real-time database* (Firebase). Hal ini memungkinkan staf non-IT untuk dengan mudah menambah dan memperbarui data konten, memastikan informasi yang disajikan selalu relevan dan *up-to-date*.
4.  **Menjembatani Data Penjualan dengan Rekomendasi:** Sistem ini mengintegrasikan data penjualan buku dari toko, sehingga rekomendasi buku yang diberikan tidak hanya sesuai minat anak tetapi juga mengarahkan pengguna ke jalur pembelian buku yang relevan dan tersedia.
5.  **Mendukung Misi Kebangkitan Nasional melalui Teknologi:** Dengan berpartisipasi dalam IDCamp 2024 Developer Challenge #2 x SheHacks, proyek ini menunjukkan komitmen untuk berkontribusi pada transformasi digital di sektor pendidikan, memberdayakan UMKM (Alkindi Eduprise), dan menciptakan solusi teknologi yang inklusif.

## Manfaat Proyek

Alkindi AI diharapkan dapat memberikan berbagai manfaat signifikan bagi *stakeholder* terkait:

* **Bagi Orang Tua:**
    * Mendapatkan panduan pendidikan yang personal dan sesuai minat anak.
    * Akses mudah ke solusi keilmuan dan hadits *sahih* yang relevan.
    * Menghemat waktu dalam mencari buku yang cocok, karena rekomendasi diberikan secara cerdas oleh AI.
    * Membantu membentuk karakter anak sesuai nilai 5B (Beriman, Berakhlak, Berilmu, Berkarya, Bermanfaat) sejak dini.
* **Bagi Admin/Staf Alkindi Eduprise:**
    * Mempermudah pengelolaan data buku, solusi ilmiah, dan hadits secara *real-time* melalui antarmuka yang ramah pengguna.
    * Meningkatkan efisiensi operasional dan kecepatan pembaruan informasi.
    * Memungkinkan staf non-teknis untuk berkontribusi aktif dalam pengelolaan konten.
* **Bagi Ekosistem Pendidikan Anak Usia Dini:**
    * Mendorong adopsi teknologi AI untuk personalisasi pembelajaran.
    * Meningkatkan kualitas dan relevansi konten edukasi Islami.
    * Mendukung pertumbuhan UMKM di bidang pendidikan melalui inovasi digital.

## Fitur Utama

* **Learning Plan Berbasis AI:** Pembuatan rencana belajar yang dipersonalisasi sesuai karakteristik, kebutuhan, dan minat anak.
* **Rekomendasi Konten Cerdas:** Rekomendasi buku, solusi keilmuan, dan hadits *sahih* yang relevan dengan *learning plan* anak.
* **Manajemen Informasi Buku (Admin Panel):** Form manajemen *real-time database* (Firebase) yang memudahkan staf untuk menambah dan mengelola data buku dan konten lainnya.
* **Integrasi Data Penjualan Toko:** Rekomendasi buku terhubung dengan data penjualan, mengarahkan pengguna ke jalur pembelian yang sesuai.
* **Artikel Pendukung:** Penjelasan mengenai cara kerja AI dalam solusi ini, pentingnya hadits, dan tips memilih buku yang tepat.
* **Fitur Bantuan:** Tutorial penggunaan *website* untuk pengguna umum maupun admin.

## Demo Aplikasi

Aplikasi Alkindi AI telah di-*deploy* dan dapat diakses melalui tautan berikut:

[https://alkindi-ai.netlify.app/](https://alkindi-ai.netlify.app/)

![Gambar 2: Tampilan Halaman Fitur AI](https://github.com/user-attachments/assets/e51c81d4-4f7a-4d6d-9932-9e8c8455493c)

## Teknologi yang Digunakan (Tech Stack)

* **Front-End:**
    * HTML
    * CSS
    * JavaScript (JS)
    * Tailwind CSS
* **Back-End:**
    * Node.js
    * Firebase Realtime Database (untuk pengelolaan manajemen data latih AI yang mudah digunakan oleh admin atau staf di panel staf)
    * Cloudinary (untuk menyimpan dan manajemen *upload* gambar)

## Instalasi (untuk Pengembang)

Untuk menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut:

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/eldykvlk/alkindi-ai.git](https://github.com/eldykvlk/alkindi-ai.git)
    ```
2.  **Masuk ke direktori proyek:**
    ```bash
    cd alkindi-ai
    ```
3.  **Instal dependensi:**
    ```bash
    npm install
    ```
4.  **Konfigurasi Variabel Lingkungan:**
    Buat file `.env` di *root* proyek dan tambahkan variabel lingkungan yang diperlukan, seperti kredensial Firebase dan Cloudinary. (Contoh: `FIREBASE_API_KEY=your_key`, `CLOUDINARY_CLOUD_NAME=your_cloud_name`, dll.)
5.  **Jalankan aplikasi
    ```bash
    netlify dev
    ```

## Kontribusi

Proyek ini merupakan bagian dari IDCamp 2024 Developer Challenge #2 x SheHacks. Jika ada niat untuk pengembangan lebih lanjut atau kontribusi setelah periode *challenge*, silakan hubungi pengembang.

## Kontak

Jika ada pertanyaan atau saran, jangan ragu untuk menghubungi:

**Eldy Effendi**
* GitHub: [eldykvlk](https://github.com/eldykvlk)
* Email: [eldy.email@example.com](mailto:eldyeffendi9@gmail.com)
