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

// Elemen-elemen DOM
const bookForm = document.getElementById('bookForm');
const bookIdInput = document.getElementById('bookId');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const orderLinkInput = document.getElementById('orderLink');
const openCloudinaryWidgetBtn = document.getElementById('openCloudinaryWidget');
const currentImageLinkParagraph = document.getElementById('currentImageLink');
const imageLinkInput = document.getElementById('imageLinkInput');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const bookListDiv = document.getElementById('bookList');
const loadingMessage = document.getElementById('loadingMessage');

// Elemen-elemen DOM baru untuk search dan pagination
const searchBookTitleInput = document.getElementById('searchBookTitle');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const currentPageInfo = document.getElementById('currentPageInfo');

let currentEditingBookId = null;
let currentImageLink = null;

// --- Variabel untuk Paginasi dan Pencarian ---
let allBooks = []; // Menyimpan semua buku yang dimuat dari Firebase
const itemsPerPage = 6; // Jumlah buku per halaman
let currentPage = 1;
let filteredBooks = []; // Menyimpan buku setelah filter pencarian

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
            console.log('Upload Berhasil:', result.info);
            const imageUrl = result.info.secure_url; // URL gambar yang diupload
            imageLinkInput.value = imageUrl; // Simpan URL ke input hidden
            currentImageLink = imageUrl; // Update currentImageLink untuk tampilan
            currentImageLinkParagraph.textContent = `Gambar berhasil diupload: ${imageUrl}`;
            currentImageLinkParagraph.style.display = 'block';
            submitBtn.disabled = false; // Aktifkan tombol submit lagi
            alert('Gambar berhasil diupload');
        } else if (error) {
            console.error('Upload Error:', error);
            alert('Gagal mengupload gambar. Silakan coba lagi.');
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


// --- Fungsi untuk Memuat, Filter, dan Menampilkan Buku (READ, SEARCH, PAGINATION) ---
const renderBooks = () => {
    bookListDiv.innerHTML = '';
    loadingMessage.style.display = 'none';

    // Apply search filter
    const searchTerm = searchBookTitleInput.value.toLowerCase();
    filteredBooks = allBooks.filter(book =>
        book.title && book.title.toLowerCase().includes(searchTerm)
    );

    // Calculate pagination values
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    currentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1); // Pastikan current page tidak melebihi total pages
    currentPage = Math.max(currentPage, 1); // Pastikan current page tidak kurang dari 1

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const booksToDisplay = filteredBooks.slice(startIndex, endIndex);

    // Update pagination info
    currentPageInfo.textContent = `Halaman ${currentPage} dari ${totalPages > 0 ? totalPages : 1}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

    if (booksToDisplay.length > 0) {
        booksToDisplay.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.classList.add('book-item');
            bookItem.dataset.id = book.id;

            bookItem.innerHTML = `
                <img src="${book.imageLink || 'https://via.placeholder.com/200x200?text=No+Image'}" alt="${book.title}">
                <h3>${book.title}</h3>
                <p>${book.description}</p>
                <div class="actions">
                    <button class="edit-btn" data-id="${book.id}">Edit</button>
                    <button class="delete-btn" data-id="${book.id}">Delete</button>
                </div>
            `;
            bookListDiv.appendChild(bookItem);
        });
    } else {
        bookListDiv.innerHTML = '<p>Tidak ada buku yang ditemukan.</p>';
    }
};

// --- Event Listener untuk Perubahan Data dari Firebase ---
booksRef.on('value', (snapshot) => {
    const books = snapshot.val();
    allBooks = [];
    if (books) {
        Object.entries(books).forEach(([id, book]) => {
            allBooks.push({ id, ...book });
        });
    }
    // Sort books by ID for consistent pagination (optional, but good practice)
    allBooks.sort((a, b) => Number(a.id) - Number(b.id));
    renderBooks(); // Panggil renderBooks setiap kali data berubah
});


// --- Event Listeners untuk Paginasi ---
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderBooks();
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderBooks();
    }
});

// --- Event Listener untuk Pencarian ---
searchBookTitleInput.addEventListener('keyup', () => {
    currentPage = 1; // Reset ke halaman pertama setiap kali pencarian baru
    renderBooks();
});


// --- Fungsi untuk Menambah/Mengupdate Buku (CREATE/UPDATE) ---
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = titleInput.value;
    const description = descriptionInput.value;
    const orderLink = orderLinkInput.value;
    const imageLink = imageLinkInput.value;

    if (!currentEditingBookId && !imageLink) {
        alert('Harap upload gambar buku terlebih dahulu menggunakan tombol "Pilih/Upload Gambar"!');
        return;
    }

    const bookData = {
        title: title,
        description: description,
        orderLink: orderLink,
        imageLink: imageLink
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
                currentImageLink = book.imageLink;
                imageLinkInput.value = book.imageLink;

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
            console.warn('Gambar tidak dapat dihapus dari Cloudinary secara langsung dari frontend dengan unsigned upload. Pertimbangkan backend jika diperlukan.');

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
    imageLinkInput.value = '';
    currentImageLinkParagraph.textContent = '';
    currentImageLinkParagraph.style.display = 'none';
    submitBtn.textContent = 'Tambah Buku';
    cancelBtn.style.display = 'none';
    currentEditingBookId = null;
    currentImageLink = null;
    submitBtn.disabled = false;
}

// --- Session Check and Logout (Tetap sama seperti sebelumnya) ---
const adminRef = database.ref('admin');
const loggedInUsernameSpan = document.getElementById('loggedInUsername');
const logoutBtn = document.getElementById('logoutBtn');
const adminListDiv = document.getElementById('adminList'); // Tambahkan ini jika belum ada
const loadingAdminsMessage = document.getElementById('loadingAdmins'); // Tambahkan ini jika belum ada

const checkLogin = () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return null;
    }
    const user = JSON.parse(loggedInUser);
    if (user.adminStatus !== 'acc') {
        window.location.href = 'login.html';
        return null;
    }
    loggedInUsernameSpan.textContent = `Welcome, ${user.username}`;
    return user;
};

const currentUser = checkLogin();
// Pastikan currentUser ada sebelum mencoba menggunakannya
if (!currentUser) {
    // Redirect sudah terjadi, tidak perlu melakukan apa-apa lagi di sini.
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
});

// --- Admin Management Section ---
const renderAdminList = (admins) => {
    // Cek apakah adminListDiv dan loadingAdminsMessage ada sebelum digunakan
    if (!adminListDiv || !loadingAdminsMessage) {
        console.error('Admin list elements not found. Skipping admin list rendering.');
        return;
    }

    loadingAdminsMessage.style.display = 'none'; // Hide loading message
    adminListDiv.innerHTML = ''; // Clear previous list

    if (!admins || Object.keys(admins).length === 0) {
        adminListDiv.innerHTML = '<p>No admin users registered yet.</p>';
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
        // Jangan tampilkan admin yang sedang login di daftar untuk modifikasi
        if (currentUser && admin.id === currentUser.id) return;

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
    // Pastikan loadingAdminsMessage ada sebelum digunakan
    if (loadingAdminsMessage) {
        loadingAdminsMessage.style.display = 'none'; // Hide loading message
    }
    const admins = snapshot.val();
    if (admins) {
        renderAdminList(admins);
    } else {
        if (adminListDiv) { // Pastikan adminListDiv ada sebelum digunakan
            adminListDiv.innerHTML = '<p>No admin users registered yet.</p>';
        }
    }
}, (error) => {
    console.error('Error fetching admin data:', error);
    if (adminListDiv) { // Pastikan adminListDiv ada sebelum digunakan
        adminListDiv.innerHTML = '<p>Error loading admin data.</p>';
    }
});