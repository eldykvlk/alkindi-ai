// Deklarasikan variabel di lingkup atas agar dapat diakses oleh semua fungsi
let firebaseConfig = {};
let CLOUDINARY_CLOUD_NAME = "";
let CLOUDINARY_UPLOAD_PRESET = "";
let database;
let booksRef;
let adminRef;

// --- DOM Elements (deklarasikan di awal untuk akses mudah) ---
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

const searchBookTitleInput = document.getElementById('searchBookTitle');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const currentPageInfo = document.getElementById('currentPageInfo');

const loggedInUsernameSpan = document.getElementById('loggedInUsername');
const logoutBtn = document.getElementById('logoutBtn');

const adminListDiv = document.getElementById('adminList');
const loadingAdminsMessage = document.getElementById('loadingAdmins');
const filterAdminStatusSelect = document.getElementById('filterAdminStatus');
const searchAdminUsernameInput = document.getElementById('searchAdminUsername');
const prevAdminPageBtn = document.getElementById('prevAdminPageBtn');
const nextAdminPageBtn = document.getElementById('nextAdminPageBtn');
const currentAdminPageInfo = document.getElementById('currentAdminPageInfo');

// --- Variabel untuk state ---
let currentEditingBookId = null;
let currentImageLink = null;
let allBooks = [];
const itemsPerPage = 6;
let currentPage = 1;
let filteredBooks = [];

let allAdmins = [];
const adminItemsPerPage = 5;
let currentAdminPage = 1;
let filteredAndSearchedAdmins = [];

// Fungsi untuk mengambil konfigurasi dari Netlify Function
async function fetchAllConfigs() {
    try {
        const response = await fetch('/.netlify/functions/manage-config'); // Memanggil fungsi baru
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const config = await response.json();

        firebaseConfig = config.firebaseConfig;
        CLOUDINARY_CLOUD_NAME = config.cloudinaryCloudName;
        CLOUDINARY_UPLOAD_PRESET = config.cloudinaryUploadPreset;

        initializeAppComponents(); // Panggil fungsi inisialisasi setelah semua config dimuat
    } catch (error) {
        console.error('Error fetching configurations:', error);
        alert('Gagal memuat konfigurasi aplikasi. Silakan coba lagi.');
        // Anda mungkin ingin menonaktifkan fungsionalitas atau menampilkan pesan kesalahan yang lebih jelas
    }
}

// Fungsi untuk menginisialisasi Firebase dan komponen lain yang bergantung pada konfigurasi
function initializeAppComponents() {
    // Inisialisasi Firebase
    if (firebaseConfig.apiKey) { // Pastikan konfigurasi Firebase ada
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        booksRef = database.ref('books');
        adminRef = database.ref('admin'); // Inisialisasi adminRef di sini juga

        // Panggil fungsi-fungsi yang bergantung pada inisialisasi Firebase/Cloudinary di sini
        setupFirebaseListeners();
    } else {
        console.error('Firebase config not loaded. Cannot initialize Firebase.');
    }

    // Inisialisasi Cloudinary Upload Widget (pindahkan ke sini)
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET && typeof cloudinary !== 'undefined') {
        const uwConfig = {
            cloudName: CLOUDINARY_CLOUD_NAME,
            uploadPreset: CLOUDINARY_UPLOAD_PRESET,
            folder: "alkindibooks",
        };

        const myWidget = cloudinary.createUploadWidget(uwConfig,
            (error, result) => {
                if (!error && result && result.event === "success") {
                    console.log('Upload Berhasil:', result.info);
                    const imageUrl = result.info.secure_url;
                    if (imageLinkInput) imageLinkInput.value = imageUrl;
                    currentImageLink = imageUrl;
                    if (currentImageLinkParagraph) {
                        currentImageLinkParagraph.textContent = `Gambar berhasil diupload: ${imageUrl}`;
                        currentImageLinkParagraph.style.display = 'block';
                    }
                    if (submitBtn) submitBtn.disabled = false;
                    alert('Gambar berhasil diupload');
                } else if (error) {
                    console.error('Upload Error:', error);
                    alert('Gagal mengupload gambar. Silakan coba lagi.');
                    if (submitBtn) submitBtn.disabled = false;
                } else if (result && result.event === "abort") {
                    console.log('Upload dibatalkan oleh pengguna.');
                    if (submitBtn) submitBtn.disabled = false;
                }
            }
        );

        // Event Listener untuk membuka widget (jika elemen ini ada di halaman yang menggunakan script ini)
        if (openCloudinaryWidgetBtn) {
            openCloudinaryWidgetBtn.addEventListener('click', () => {
                myWidget.open();
                if (submitBtn) submitBtn.disabled = true;
            });
        }
    } else {
        console.warn('Cloudinary config or SDK not loaded. Cloudinary widget will not be initialized.');
    }
    
    setupEventListeners(); // Panggil event listeners DOM setelah semua komponen utama siap
}

// Fungsi untuk menyiapkan listener Firebase (dipisahkan untuk kejelasan)
function setupFirebaseListeners() {
    if (booksRef) {
        booksRef.on('value', (snapshot) => {
            const books = snapshot.val();
            allBooks = [];
            if (books) {
                Object.entries(books).forEach(([id, book]) => {
                    allBooks.push({ id, ...book });
                });
            }
            allBooks.sort((a, b) => Number(a.id) - Number(b.id));
            renderBooks();
        });
    }

    if (adminRef) {
        adminRef.on('value', (snapshot) => {
            if (loadingAdminsMessage) {
                loadingAdminsMessage.style.display = 'none';
            }
            const admins = snapshot.val();
            allAdmins = []; // Inisialisasi ulang
            if (admins) {
                Object.entries(admins).forEach(([id, admin]) => {
                    allAdmins.push({ id, ...admin });
                });
            }
            allAdmins.sort((a, b) => (a.username || '').localeCompare(b.username || ''));
            currentAdminPage = 1; // Reset to first page on data change
            renderAdminList(); // Render list with updated data
        }, (error) => {
            console.error('Error fetching admin data:', error);
            if (adminListDiv) {
                adminListDiv.innerHTML = '<p>Terjadi kesalahan saat memuat data admin.</p>';
            }
            if (loadingAdminsMessage) {
                loadingAdminsMessage.style.display = 'none';
            }
        });
    }
}

// Fungsi untuk menyiapkan semua event listener DOM lainnya
function setupEventListeners() {
    // Session Check and Logout
    const currentUser = checkLogin();
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
    }

    // Event Listeners untuk Paginasi & Pencarian Buku
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderBooks();
        }
    });

    if (nextPageBtn) nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderBooks();
        }
    });

    if (searchBookTitleInput) searchBookTitleInput.addEventListener('keyup', () => {
        currentPage = 1;
        renderBooks();
    });

    // Event Listeners untuk Menambah/Mengupdate Buku
    if (bookForm) {
        bookForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = titleInput ? titleInput.value : '';
            const description = descriptionInput ? descriptionInput.value : '';
            const orderLink = orderLinkInput ? orderLinkInput.value : '';
            const imageLink = imageLinkInput ? imageLinkInput.value : '';

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
                if (booksRef) {
                    booksRef.child(currentEditingBookId).update(bookData)
                        .then(() => {
                            alert('Buku berhasil diupdate!');
                            resetForm();
                        })
                        .catch((error) => {
                            console.error("Error updating book:", error);
                            alert("Gagal mengupdate buku: " + error.message);
                        });
                }
            } else {
                if (booksRef) {
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
            }
        });
    }

    // Event Listener untuk Mengisi Form Saat Edit
    if (bookListDiv && booksRef) {
        bookListDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const id = e.target.dataset.id;
                booksRef.child(id).once('value', (snapshot) => {
                    const book = snapshot.val();
                    if (book) {
                        currentEditingBookId = id;
                        if (titleInput) titleInput.value = book.title;
                        if (descriptionInput) descriptionInput.value = book.description;
                        if (orderLinkInput) orderLinkInput.value = book.orderLink;
                        currentImageLink = book.imageLink;
                        if (imageLinkInput) imageLinkInput.value = book.imageLink;

                        if (currentImageLinkParagraph) {
                            if (currentImageLink) {
                                currentImageLinkParagraph.textContent = `Gambar saat ini: ${currentImageLink}`;
                                currentImageLinkParagraph.style.display = 'block';
                            } else {
                                currentImageLinkParagraph.textContent = '';
                                currentImageLinkParagraph.style.display = 'none';
                            }
                        }

                        if (submitBtn) submitBtn.textContent = 'Update Buku';
                        if (cancelBtn) cancelBtn.style.display = 'inline-block';
                        if (bookForm) bookForm.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }
        });
    }

    // Event Listener untuk Menghapus Buku
    if (bookListDiv && booksRef) {
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
    }

    // Fungsi Reset Form
    if (cancelBtn) cancelBtn.addEventListener('click', resetForm);

    // Event Listeners untuk Filter, Pencarian, dan Paginasi Admin
    if (filterAdminStatusSelect) {
        filterAdminStatusSelect.addEventListener('change', () => {
            currentAdminPage = 1;
            renderAdminList();
        });
    }

    if (searchAdminUsernameInput) {
        searchAdminUsernameInput.addEventListener('keyup', () => {
            currentAdminPage = 1;
            renderAdminList();
        });
    }

    if (prevAdminPageBtn) {
        prevAdminPageBtn.addEventListener('click', () => {
            if (currentAdminPage > 1) {
                currentAdminPage--;
                renderAdminList();
            }
        });
    }

    if (nextAdminPageBtn) {
        nextAdminPageBtn.addEventListener('click', () => {
            const totalAdminPages = Math.ceil(filteredAndSearchedAdmins.length / adminItemsPerPage);
            if (currentAdminPage < totalAdminPages) {
                currentAdminPage++;
                renderAdminList();
            }
        });
    }
}


// --- Session Check and Logout ---
const checkLogin = () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return null;
    }
    const user = JSON.parse(loggedInUser);
    // Asumsi halaman ini hanya untuk admin 'acc'
    if (user.adminStatus !== 'acc') {
        alert('Anda tidak memiliki akses untuk melihat halaman ini. Silakan login sebagai admin yang disetujui.');
        window.location.href = 'login.html';
        return null;
    }
    if (loggedInUsernameSpan) {
        loggedInUsernameSpan.textContent = `Selamat datang, ${user.username}`;
    }
    return user;
};


// --- Fungsi untuk Memuat, Filter, dan Menampilkan Buku (READ, SEARCH, PAGINATION) ---
const renderBooks = () => {
    if (!bookListDiv || !loadingMessage) return; // Exit if elements not found

    bookListDiv.innerHTML = '';
    loadingMessage.style.display = 'none';

    const searchTerm = searchBookTitleInput ? searchBookTitleInput.value.toLowerCase() : '';
    filteredBooks = allBooks.filter(book =>
        book.title && book.title.toLowerCase().includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    currentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);
    currentPage = Math.max(currentPage, 1);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const booksToDisplay = filteredBooks.slice(startIndex, endIndex);

    if (currentPageInfo) currentPageInfo.textContent = `Halaman ${currentPage} dari ${totalPages > 0 ? totalPages : 1}`;
    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

    if (booksToDisplay.length > 0) {
        booksToDisplay.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.classList.add('book-item');
            bookItem.dataset.id = book.id;

            // Perbaikan pada template literal
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

// --- Fungsi Reset Form ---
function resetForm() {
    if (bookForm) bookForm.reset();
    if (bookIdInput) bookIdInput.value = '';
    if (titleInput) titleInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    if (orderLinkInput) orderLinkInput.value = '';
    if (imageLinkInput) imageLinkInput.value = '';
    if (currentImageLinkParagraph) {
        currentImageLinkParagraph.textContent = '';
        currentImageLinkParagraph.style.display = 'none';
    }
    if (submitBtn) submitBtn.textContent = 'Tambah Buku';
    if (cancelBtn) cancelBtn.style.display = 'none';
    currentEditingBookId = null;
    currentImageLink = null;
    if (submitBtn) submitBtn.disabled = false;
}

// --- Admin Management Section (Jika script-manage.js juga digunakan untuk mengelola admin) ---
const renderAdminList = () => {
    if (!adminListDiv || !loadingAdminsMessage || !filterAdminStatusSelect || !searchAdminUsernameInput || !prevAdminPageBtn || !nextAdminPageBtn || !currentAdminPageInfo) {
        console.warn('Admin list related DOM elements not fully found. Skipping admin list rendering.');
        return;
    }

    adminListDiv.innerHTML = '';
    loadingAdminsMessage.style.display = 'none';

    const selectedStatus = filterAdminStatusSelect.value;
    const searchTerm = searchAdminUsernameInput.value.toLowerCase();

    filteredAndSearchedAdmins = allAdmins.filter(admin => {
        const currentUser = checkLogin();
        // Jangan tampilkan diri sendiri di daftar admin yang dikelola
        if (currentUser && admin.id === currentUser.id) {
            return false;
        }

        const matchesStatus = (selectedStatus === 'all' || admin.admin === selectedStatus);
        const matchesSearch = (admin.username && admin.username.toLowerCase().includes(searchTerm));

        return matchesStatus && matchesSearch;
    });

    const totalAdminPages = Math.ceil(filteredAndSearchedAdmins.length / adminItemsPerPage);
    currentAdminPage = Math.min(currentAdminPage, totalAdminPages > 0 ? totalAdminPages : 1);
    currentAdminPage = Math.max(currentAdminPage, 1);

    const startAdminIndex = (currentAdminPage - 1) * adminItemsPerPage;
    const endAdminIndex = startAdminIndex + adminItemsPerPage;
    const adminsToDisplay = filteredAndSearchedAdmins.slice(startAdminIndex, endAdminIndex);

    currentAdminPageInfo.textContent = `Halaman ${currentAdminPage} dari ${totalAdminPages > 0 ? totalAdminPages : 1}`;
    prevAdminPageBtn.disabled = currentAdminPage === 1;
    nextAdminPageBtn.disabled = currentAdminPage === totalAdminPages || totalAdminPages === 0;

    if (adminsToDisplay.length === 0) {
        adminListDiv.innerHTML = '<p>Tidak ada pengguna admin yang ditemukan dengan kriteria ini.</p>';
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

    adminsToDisplay.forEach(admin => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 8px; border: 1px solid #ddd;">${admin.username || 'N/A'}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${admin.admin === 'acc' ? 'Disetujui' : 'Menunggu'}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">
                <button data-id="${admin.id}" data-status="${admin.admin}" class="toggle-admin-status-btn" style="margin-right: 5px;">
                    ${admin.admin === 'acc' ? 'Cabut Akses' : 'Berikan Akses'}
                </button>
                <button data-id="${admin.id}" class="delete-admin-btn" style="background-color: #dc3545; color: white;">Hapus</button>
            </td>
        `;
        adminTableBody.appendChild(row);
    });

    // Menambahkan event listener setelah tombol dibuat
    document.querySelectorAll('.toggle-admin-status-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const adminIdToUpdate = e.target.dataset.id;
            const currentStatus = e.target.dataset.status;
            const newStatus = currentStatus === 'acc' ? 'not' : 'acc';

            if (adminRef) {
                try {
                    await adminRef.child(adminIdToUpdate).update({ admin: newStatus });
                    alert(`Status admin untuk ${e.target.parentNode.previousElementSibling.previousElementSibling.textContent} diperbarui menjadi "${newStatus}".`);
                } catch (error) {
                    console.error('Error updating admin status:', error);
                    alert('Gagal memperbarui status admin.');
                }
            }
        });
    });

    document.querySelectorAll('.delete-admin-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const adminIdToDelete = e.target.dataset.id;
            const adminUsername = e.target.parentNode.previousElementSibling.previousElementSibling.textContent;

            if (confirm(`Apakah Anda yakin ingin menghapus admin "${adminUsername}"? Tindakan ini tidak dapat dibatalkan.`)) {
                if (adminRef) {
                    try {
                        await adminRef.child(adminIdToDelete).remove();
                        alert(`Admin "${adminUsername}" berhasil dihapus!`);
                    } catch (error) {
                        console.error('Error deleting admin:', error);
                        alert('Gagal menghapus admin. Silakan coba lagi.');
                    }
                }
            }
        });
    });
};


// Panggil fungsi untuk mengambil konfigurasi saat script dimuat
fetchAllConfigs();