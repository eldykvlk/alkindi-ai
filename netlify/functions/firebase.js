const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

exports.handler = async function(event, context) {
  const firebaseURL = process.env.FIREBASE_URL;

  try {
    const response = await fetch(firebaseURL);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data), // PASTIKAN ADA JSON.stringify DI SINI
    };
  } catch (error) {
    console.error("Firebase error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Gagal mengambil data dari Firebase" }),
    };
  }
};
