const form = document.getElementById("harapanForm");
const hasilDiv = document.getElementById("hasil");

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const harapanUser = document.getElementById("harapan").value.trim();
  hasilDiv.innerHTML = "⏳ Memproses harapan Anda...";

  const geminiKey = "AIzaSyBFLY_iHSfOb96YjKPTr7ukUp3f9fCJPrU"; // Ganti dengan key Gemini kamu
  const firebaseURL = "https://alkindi-24a1a-default-rtdb.firebaseio.com/books.json";

  try {
    // 1. Ambil semua data buku dari Firebase
    const booksRes = await fetch(firebaseURL);
    const books = await booksRes.json();


    // 2. Buat daftar judul dari index 1 ke atas
    const daftarJudul = books
      .map((book, index) => book ? `${index}. ${book.title}` : null)
      .filter(Boolean) // hilangkan null
      .join("\n");


    // 2. Minta Gemini untuk memilih ID buku berdasarkan harapan
    const prompt = `
Berikut daftar buku islami untuk anak dengan ID masing-masing:

${daftarJudul}

Dari harapan berikut:
"${harapanUser}"

Tentukan ID buku (hanya 1 angka saja) yang paling relevan untuk mendukung perkembangan anak sesuai harapan tersebut.
Jawab hanya berupa angka ID buku tanpa penjelasan.
`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const geminiData = await geminiRes.json();
    const idTerpilih = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    const buku = books[idTerpilih];

    if (!buku) {
      hasilDiv.innerHTML = "❌ Tidak dapat menemukan buku yang cocok.";
      return;
    }

    // 3. Tampilkan hasil rekomendasi
    hasilDiv.innerHTML = `
      <p>🌟 <strong>Rekomendasi Buku Islami untuk Anak Anda:</strong></p>
      <h3>${buku.title}</h3>
      <p>${buku.description}</p>
      <img src="${buku.imageLink}" alt="Gambar Buku">
      <p><a href="${buku.orderLink}" target="_blank">📘 Beli Buku di sini</a></p>
    `;
  } catch (error) {
    console.error(error);
    hasilDiv.innerHTML = "❌ Terjadi kesalahan saat memproses.";
  }
});





