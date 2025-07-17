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

const adminRef = database.ref('admin');
const loggedInUsernameSpan = document.getElementById('loggedInUsername');
const logoutBtn = document.getElementById('logoutBtn');
const adminListDiv = document.getElementById('adminList');
const loadingAdminsMessage = document.getElementById('loadingAdmins');

// --- Session Check and Redirect ---
const checkLogin = () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'login.html'; // No user logged in, redirect
        return null;
    }
    const user = JSON.parse(loggedInUser);
    if (user.adminStatus !== 'acc') {
        window.location.href = 'login.html'; // Not an approved admin, redirect
        return null;
    }
    loggedInUsernameSpan.textContent = `Welcome, ${user.username}`;
    return user;
};

const currentUser = checkLogin();
if (!currentUser) {
    // If checkLogin redirected, the script will stop execution anyway.
    // This is just to prevent further code from running if redirect happened.
}

// --- Logout Functionality ---
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
});

// --- Admin Management Section ---
const renderAdminList = (admins) => {
    adminListDiv.innerHTML = ''; // Clear previous list
    if (Object.keys(admins).length === 0) {
        adminListDiv.innerHTML = '<p>No other admin users found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.innerHTML = `
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Username</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Actions</th>
            </tr>
        </thead>
        <tbody id="adminTableBody"></tbody>
    `;
    adminListDiv.appendChild(table);
    const adminTableBody = document.getElementById('adminTableBody');

    Object.values(admins).forEach(admin => {
        // Don't show the currently logged-in admin in the list for modification
        if (admin.id === currentUser.id) return;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 8px; border: 1px solid #ddd;">${admin.username}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${admin.admin === 'acc' ? 'Approved' : 'Pending'}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">
                <button data-id="${admin.id}" data-status="${admin.admin}" class="toggle-admin-status-btn">
                    ${admin.admin === 'acc' ? 'Revoke Access' : 'Grant Access'}
                </button>
            </td>
        `;
        adminTableBody.appendChild(row);
    });

    document.querySelectorAll('.toggle-admin-status-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const adminIdToUpdate = e.target.dataset.id;
            const currentStatus = e.target.dataset.status;
            const newStatus = currentStatus === 'acc' ? 'not' : 'acc';

            try {
                await adminRef.child(adminIdToUpdate).update({ admin: newStatus });
                alert(`Admin status for ${e.target.parentNode.previousElementSibling.previousElementSibling.textContent} updated to "${newStatus}".`);
            } catch (error) {
                console.error('Error updating admin status:', error);
                alert('Failed to update admin status.');
            }
        });
    });
};

// Listen for changes in the 'admin' node
adminRef.on('value', (snapshot) => {
    loadingAdminsMessage.style.display = 'none'; // Hide loading message
    const admins = snapshot.val();
    if (admins) {
        renderAdminList(admins);
    } else {
        adminListDiv.innerHTML = '<p>No admin users registered yet.</p>';
    }
}, (error) => {
    console.error('Error fetching admin data:', error);
    adminListDiv.innerHTML = '<p>Error loading admin data.</p>';
});
