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
    .map((book, index) => (book ? `${index}. ${book.title}` : null))
    .filter(Boolean) // hilangkan null
    .join("\n");

  const prompt = `
Berikut daftar buku islami untuk anak dengan ID masing-masing:

${daftarJudul}

Dari harapan berikut:
"${harapanUser}"

Berikan solusi singkat dan relevan dari harapan tersebut, serta sebutkan satu hadits yang berkaitan. Setelah itu, promosikan pengambilan buku yang paling relevan (hanya 1 buku) dari daftar di atas yang sesuai dengan harapan tersebut, dengan menyebutkan ID bukunya saja.

Contoh format output:
Solusi: [Solusi singkat]
Hadits: [Teks hadits]
ID Buku: [ID buku]
`;

  let responseText = "";
  let attempts = 0;
  const maxAttempts = 3; // You can adjust the number of retries
  const delayTime = 6000; // 6 seconds

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`Attempt ${attempts} to fetch Gemini response...`);

    try {
      // Kirim prompt ke Gemini (via Netlify Function)
      const geminiRes = await fetch("/.netlify/functions/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const geminiData = await geminiRes.json();
      responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      // Check if the response contains all expected parts
      const solusiMatch = responseText.match(/Solusi: (.+)/);
      const haditsMatch = responseText.match(/Hadits: (.+)/);
      const idMatch = responseText.match(/ID Buku: (\d+)/);

      if (solusiMatch && haditsMatch && idMatch) {
        console.log("Full response received.");
        break; // Exit the loop if all parts are found
      } else {
        console.warn("Incomplete response, retrying...");
      }
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
    }

    if (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayTime)); // Wait for 6 seconds
    }
  }

  // Parsing respons untuk mendapatkan solusi, hadits, dan ID buku
  const solusiMatch = responseText.match(/Solusi: (.+)/);
  const haditsMatch = responseText.match(/Hadits: (.+)/);
  const idMatch = responseText.match(/ID Buku: (\d+)/);

  const solusiSingkat = solusiMatch ? solusiMatch[1].trim() : "Tidak ditemukan solusi.";
  const hadits = haditsMatch ? haditsMatch[1].trim() : "Tidak ditemukan hadits.";
  const idTerpilih = idMatch ? idMatch[1].trim() : null;

  const buku = books[idTerpilih];

  if (!buku || !solusiMatch || !haditsMatch || !idMatch) {
    hasilDiv.innerHTML = "❌ Tidak dapat menemukan buku yang cocok atau respons tidak lengkap setelah beberapa kali percobaan.";
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