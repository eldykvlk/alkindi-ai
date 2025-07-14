// Konfigurasi Firebase Anda
// GANTI DENGAN KONFIGURASI PROYEK ANDA!
const firebaseConfig = {
    apiKey: "AIzaSyBYY5VTaOHFHeBgyuevFYzwqY3v0xixktw",
    authDomain: "alkindi-24a1a.firebaseapp.com",
    databaseURL: "https://alkindi-24a1a-default-rtdb.firebaseio.com",
    projectId: "alkindi-24a1a",
    // Hapus atau komentar baris ini jika tidak lagi menggunakan Firebase Storage
    // storageBucket: "alkindi-24a1a.firebasestorage.app",
    messagingSenderId: "55610192397",
    appId: "1:55610192397:web:8fb5027b86c48d595b1b44",
    measurementId: "G-4EPQVYKMME"
};

// **GANTI DENGAN CLOUD NAME CLOUDINARY ANDA!**
const CLOUDINARY_CLOUD_NAME = "dvagwxqmr"; 
// Jika Anda membuat upload preset custom, ganti 'ml_default' dengan nama preset Anda
const CLOUDINARY_UPLOAD_PRESET = "gambar"; 
// Pastikan preset ini adalah "unsigned upload preset" di Cloudinary dashboard Anda.

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Referensi ke Firebase Realtime Database
const database = firebase.database();
const booksRef = database.ref('books');

// Hapus referensi ke Firebase Storage jika tidak lagi digunakan
// const storage = firebase.storage();
// const storageRef = storage.ref();

// Elemen-elemen DOM
const bookForm = document.getElementById('bookForm');
const bookIdInput = document.getElementById('bookId');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const orderLinkInput = document.getElementById('orderLink');
// Ganti imageUploadInput dengan tombol untuk membuka widget
const openCloudinaryWidgetBtn = document.getElementById('openCloudinaryWidget'); 
const currentImageLinkParagraph = document.getElementById('currentImageLink');
// Tambahkan elemen untuk input hidden URL gambar
const imageLinkInput = document.getElementById('imageLinkInput'); 
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const bookListDiv = document.getElementById('bookList');
const loadingMessage = document.getElementById('loadingMessage');

let currentEditingBookId = null; 
let currentImageLink = null; 

// --- Inisialisasi Cloudinary Upload Widget ---
const uwConfig = {
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    folder: "alkindibooks", // Opsional: nama folder di Cloudinary
    // maxFileSize: 10485760, // Contoh: Batasi ukuran file hingga 10MB (dalam bytes)
    // clientAllowedFormats: ["png", "gif", "jpeg", "jpg"], // Contoh: Batasi format file
};

const myWidget = cloudinary.createUploadWidget(uwConfig,
    (error, result) => {
        if (!error && result && result.event === "success") {
            console.log('Upload Cloudinary Berhasil:', result.info);
            const imageUrl = result.info.secure_url; // URL gambar yang diupload
            imageLinkInput.value = imageUrl; // Simpan URL ke input hidden
            currentImageLink = imageUrl; // Update currentImageLink untuk tampilan
            currentImageLinkParagraph.textContent = `Gambar berhasil diupload: ${imageUrl}`;
            currentImageLinkParagraph.style.display = 'block';
            submitBtn.disabled = false; // Aktifkan tombol submit lagi
            alert('Gambar berhasil diupload ke Cloudinary!');
        } else if (error) {
            console.error('Cloudinary Upload Error:', error);
            alert('Gagal mengupload gambar ke Cloudinary. Silakan coba lagi.');
            submitBtn.disabled = false;
        } else if (result && result.event === "abort") {
            console.log('Upload dibatalkan oleh pengguna.');
            submitBtn.disabled = false;
        }
    }
);

// --- Event Listener untuk membuka widget ---
openCloudinaryWidgetBtn.addEventListener('click', () => {
    myWidget.open();
    submitBtn.disabled = true; // Nonaktifkan tombol submit saat widget dibuka
});


// --- Fungsi untuk Memuat dan Menampilkan Buku (READ) ---
booksRef.on('value', (snapshot) => {
    bookListDiv.innerHTML = ''; 
    loadingMessage.style.display = 'none'; 

    const books = snapshot.val();
    if (books) {
        Object.entries(books).forEach(([id, book]) => {
            const bookItem = document.createElement('div');
            bookItem.classList.add('book-item');
            bookItem.dataset.id = id; 

            bookItem.innerHTML = `
                <img src="${book.imageLink || 'https://via.placeholder.com/200x200?text=No+Image'}" alt="${book.title}">
                <h3>${book.title}</h3>
                <p>${book.description}</p>
                <div class="actions">
                    <button class="edit-btn" data-id="${id}">Edit</button>
                    <button class="delete-btn" data-id="${id}">Delete</button>
                </div>
            `;
            bookListDiv.appendChild(bookItem);
        });
    } else {
        bookListDiv.innerHTML = '<p>Belum ada buku ditambahkan.</p>';
    }
});

// --- Fungsi untuk Menambah/Mengupdate Buku (CREATE/UPDATE) ---
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = titleInput.value;
    const description = descriptionInput.value;
    const orderLink = orderLinkInput.value;
    // Ambil link gambar dari input hidden, BUKAN dari input file
    const imageLink = imageLinkInput.value; 

    // Validasi sederhana: pastikan ada gambar yang dipilih/diupload
    // Cek jika sedang menambah baru (bukan edit) DAN belum ada imageLink yang terisi
    if (!currentEditingBookId && !imageLink) { 
        alert('Harap upload gambar buku terlebih dahulu menggunakan tombol "Pilih/Upload Gambar"!');
        return;
    }

    const bookData = {
        title: title,
        description: description,
        orderLink: orderLink,
        imageLink: imageLink // Gunakan link dari input hidden yang diisi oleh Cloudinary
    };

    if (currentEditingBookId) {
        // Mode Update
        booksRef.child(currentEditingBookId).update(bookData)
            .then(() => {
                alert('Buku berhasil diupdate!');
                resetForm();
            })
            .catch((error) => {
                console.error("Error updating book:", error);
                alert("Gagal mengupdate buku: " + error.message);
            });
    } else {
        // Mode Tambah Baru
        booksRef.once('value', (snapshot) => {
            const currentBooks = snapshot.val();
            let nextId = 1;
            if (currentBooks) {
                const keys = Object.keys(currentBooks).map(Number).filter(key => !isNaN(key));
                if (keys.length > 0) {
                    nextId = Math.max(...keys) + 1;
                }
            }
            booksRef.child(nextId).set(bookData)
                .then(() => {
                    alert('Buku berhasil ditambahkan!');
                    resetForm();
                })
                .catch((error) => {
                    console.error("Error adding book:", error);
                    alert("Gagal menambahkan buku: " + error.message);
                });
        });
    }
});

// --- Fungsi untuk Mengisi Form Saat Edit (UPDATE) ---
bookListDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
        const id = e.target.dataset.id;
        booksRef.child(id).once('value', (snapshot) => {
            const book = snapshot.val();
            if (book) {
                currentEditingBookId = id;
                titleInput.value = book.title;
                descriptionInput.value = book.description;
                orderLinkInput.value = book.orderLink;
                currentImageLink = book.imageLink; // Simpan link gambar yang sudah ada
                imageLinkInput.value = book.imageLink; // Isi input hidden juga dengan link yang sudah ada

                if (currentImageLink) {
                    currentImageLinkParagraph.textContent = `Gambar saat ini: ${currentImageLink}`;
                    currentImageLinkParagraph.style.display = 'block';
                } else {
                    currentImageLinkParagraph.textContent = '';
                    currentImageLinkParagraph.style.display = 'none';
                }

                submitBtn.textContent = 'Update Buku';
                cancelBtn.style.display = 'inline-block';
                bookForm.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

// --- Fungsi untuk Menghapus Buku (DELETE) ---
bookListDiv.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
            // PERHATIAN: Penghapusan gambar dari Cloudinary memerlukan konfigurasi backend
            // atau penggunaan Signed Uploads (lebih kompleks) untuk keamanan.
            // Dari frontend dengan unsigned upload, tidak ada cara langsung untuk menghapus gambar.
            console.warn('Gambar tidak dapat dihapus dari Cloudinary secara langsung dari frontend dengan unsigned upload. Pertimbangkan backend jika diperlukan.');

            // Hapus data buku dari Realtime Database
            booksRef.child(id).remove()
                .then(() => {
                    alert('Buku berhasil dihapus!');
                    resetForm(); 
                })
                .catch((error) => {
                    console.error("Error deleting book:", error);
                    alert("Gagal menghapus buku: " + error.message);
                });
        }
    }
});

// --- Fungsi Reset Form ---
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    bookForm.reset();
    bookIdInput.value = '';
    titleInput.value = '';
    descriptionInput.value = '';
    orderLinkInput.value = '';
    // Hapus baris ini karena imageUploadInput sudah tidak digunakan sebagai input file
    // imageUploadInput.value = ''; 
    imageLinkInput.value = ''; // Kosongkan input hidden URL gambar
    currentImageLinkParagraph.textContent = '';
    currentImageLinkParagraph.style.display = 'none';
    submitBtn.textContent = 'Tambah Buku';
    cancelBtn.style.display = 'none';
    currentEditingBookId = null;
    currentImageLink = null;
    submitBtn.disabled = false; // Pastikan tombol submit aktif setelah reset
}