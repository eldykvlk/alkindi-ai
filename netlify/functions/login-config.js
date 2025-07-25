// netlify/functions/login-config.js
exports.handler = async function(event, context) {
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        projectId: process.env.FIREBASE_PROJECT_ID,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
    };

    return {
        statusCode: 200,
        body: JSON.stringify(firebaseConfig),
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://alkindi-ai.netlify.app", // Sesuaikan dengan domain frontend Anda di produksi
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    };
};