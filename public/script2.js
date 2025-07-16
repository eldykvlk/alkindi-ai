const form = document.getElementById("harapanForm");
const hasilDiv = document.getElementById("hasil");

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const harapanUser = document.getElementById("harapan").value.trim();
  hasilDiv.innerHTML = "⏳ Memproses harapan Anda...";

    // Tampilkan div hasil dan skeleton loading
    hasilDiv.style.display = "block";
    hasilDiv.innerHTML = `
      <div class="skeleton"></div>
      <div class="skeleton" style="height: 20px; width: 60%; margin-top: 15px;"></div>
      <div class="skeleton" style="height: 20px; width: 80%; margin-top: 10px;"></div>
    `; 
  // Ambil buku dari Firebase (via Netlify Function)
  const firebaseRes = await fetch("/.netlify/functions/firebase");
  const books = await firebaseRes.json();
  const daftarJudul = books
  .map((book, index) => book ? `${index}. ${book.title}` : null)
  .filter(Boolean) // hilangkan null
  .join("\n");

  const prompt = `
Berikut daftar buku islami untuk anak dengan ID masing-masing:

${daftarJudul}

Dari harapan berikut:
"${harapanUser}"

Tentukan ID buku (hanya 1 angka saja) yang paling relevan untuk mendukung perkembangan anak sesuai harapan tersebut.
Jawab hanya berupa angka ID buku tanpa penjelasan.
`;

  // Kirim prompt ke Gemini (via Netlify Function)
  const geminiRes = await fetch("/.netlify/functions/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const geminiData = await geminiRes.json();
  const idTerpilih = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  const buku = books[idTerpilih];

  if (!buku) {
    hasilDiv.innerHTML = "❌ Tidak dapat menemukan buku yang cocok.";
    return;
  }

  hasilDiv.innerHTML = `
    <p>🌟 <strong>Rekomendasi Buku Islami untuk Anak Anda:</strong></p>
    <h3>${buku.title}</h3>
    <p>${buku.description}</p>
    <img src="${buku.imageLink}" alt="Gambar Buku">
    <p><a href="${buku.orderLink}" target="_blank">📘 Beli Buku di sini</a></p>
  `;
});
