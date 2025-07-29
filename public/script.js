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

Berikan solusi singkat dan relevan dari harapan tersebut dalam dua paragraf. Setelah itu, sebutkan satu hadits yang berkaitan. Terakhir, promosikan pengambilan buku yang paling relevan (hanya 1 buku) dari daftar di atas yang sesuai dengan harapan tersebut, dengan menyebutkan ID bukunya saja.

Contoh format output:
Solusi: [Paragraf pertama solusi]
[Paragraf kedua solusi]
Hadits: [Teks hadits]
ID Buku: [ID buku]
`;

  // Kirim prompt ke Gemini (via Netlify Function)
  const geminiRes = await fetch("/.netlify/functions/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const geminiData = await geminiRes.json();
  const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  // Parsing respons untuk mendapatkan solusi, hadits, dan ID buku
  const solusiMatch = responseText.match(/Solusi: ([\s\S]+?)(?=Hadits:)/); // This regex captures everything after "Solusi:" until "Hadits:"
  const haditsMatch = responseText.match(/Hadits: (.+)/);
  const idMatch = responseText.match(/ID Buku: (\d+)/);

  const solusiSingkat = solusiMatch ? solusiMatch[1].trim() : "Tidak ditemukan solusi.";
  const hadits = haditsMatch ? haditsMatch[1].trim() : "Tidak ditemukan hadits.";
  const idTerpilih = idMatch ? idMatch[1].trim() : null;

  const buku = books[idTerpilih];

  if (!buku) {
    hasilDiv.innerHTML = "❌ Tidak dapat menemukan buku yang cocok.";
    return;
  }

  hasilDiv.innerHTML = `
    <p>💡 ${solusiSingkat}</p>
    <p>📜 ${hadits}</p>
    <p>🌟 <strong>Rekomendasi Buku Islami untuk Anak Anda:</strong></p>
    <h3>${buku.title}</h3>
    <p>${buku.description}</p>
    <img src="${buku.imageLink}" alt="Gambar Buku">
    <p><a href="${buku.orderLink}" target="_blank" class="beli-btn">📘 Pesan buku ini</a></p>
  `;
});