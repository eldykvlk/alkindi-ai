exports.handler = async function (event, context) {
  const firebaseURL = process.env.FIREBASE_URL;

  try {
    const res = await fetch(firebaseURL);
    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Gagal mengambil data Firebase" })
    };
  }
};
