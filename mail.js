/**
 * mail.js — passerelle Node.js pour SendPulse
 * Auteur : ton_nom
 * Description : reçoit les requêtes depuis ton site et envoie les e-mails via SendPulse API.
 */

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

// === 🔧 Configuration à personnaliser ===
const CLIENT_ID = "2791ee5cd2fe86363b423d1ca0da4c8e";
const CLIENT_SECRET = "c154f218aa3d57f0de5f4ffc72ee7fb9";
const SENDER_EMAIL = "no-reply@urgences.fr";
const SENDER_NAME = "Service des Urgences";

const app = express();
app.use(cors());
app.use(express.json());

// Cache token pour éviter les requêtes inutiles
let cachedToken = "";
let tokenExpiry = 0;

// === 1️⃣ Obtenir le token SendPulse ===
async function getAccessToken() {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

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

  if (!data.access_token) {
    throw new Error("Échec de l’obtention du token SendPulse : " + JSON.stringify(data));
  }

  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in - 60) * 1000; // sécurité : rafraîchir 1 min avant expiration

  return cachedToken;
}

// === 2️⃣ Endpoint principal pour l’envoi de mail ===
app.post("/send-mail", async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: "Champs manquants (to, subject, html)." });
    }

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
          from: { email: SENDER_EMAIL, name: SENDER_NAME },
          to: [{ email: to }],
          html,
        },
      }),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.message || "Erreur API SendPulse");
    }

    console.log(`✅ E-mail envoyé à ${to}`);
    res.json({ success: true, result });

  } catch (err) {
    console.error("❌ Erreur d’envoi :", err);
    res.status(500).json({ error: err.message });
  }
});

// === 3️⃣ Lancement du serveur local (si tu testes en local) ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur mail.js actif sur le port ${PORT}`);
});
