exports.handler = async function (event, context) {
  const { prompt } = JSON.parse(event.body);

  const geminiKey = process.env.GEMINI_API_KEY;

  const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await geminiRes.json();
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
