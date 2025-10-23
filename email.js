import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const CLIENT_ID = "TON_CLIENT_ID_SENDPULSE";
const CLIENT_SECRET = "TON_CLIENT_SECRET_SENDPULSE";

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
          from: { email: "no-reply@tonhopital.fr", name: "Centre Hospitalier" },
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
