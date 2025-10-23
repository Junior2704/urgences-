import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const CLIENT_ID = "2791ee5cd2fe86363b423d1ca0da4c8e";
const CLIENT_SECRET = "c154f218aa3d57f0de5f4ffc72ee7fb9";

let cachedToken = "";
let tokenExpiry = 0;

// 🔹 Génère un token d’accès valable 1h
async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  const res = await fetch("https://api.sendpulse.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000;
  return cachedToken;
}

// 🔹 Route pour envoyer un mail
app.post("/send-mail", async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    const token = await getAccessToken();

    const response = await fetch("https://api.sendpulse.com/smtp/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: {
          subject,
          from: { email: "no-reply@serviceurgences.fr", name: "Service des Urgences" },
          to: [{ email: to }],
          html,
        },
      }),
    });

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("✅ Serveur prêt sur le port 3000"));
