// index.js
import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const upload = multer();

// ✅ Autoriser ton site GitHub Pages
app.use(cors({
  origin: "https://junior2704.github.io"
}));

// ✅ Route de test
app.get("/", (req, res) => res.send("✅ Proxy Render opérationnel - route /upload disponible"));

// ✅ Route d’upload
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }

    // ⚙️ Créer un vrai FormData natif (Node 18+)
    const formData = new FormData();
    formData.append("file", new Blob([req.file.buffer]), "rapport.pdf");

    // 🔹 Envoi vers File.io
    const response = await fetch("https://file.io/?expires=7d", {
      method: "POST",
      body: formData
    });

    // ⚙️ Lecture de la réponse
    const text = await response.text();
    console.log("Réponse brute file.io:", text);

    // On essaie de parser le JSON
    let result;
    try {
      result = JSON.parse(text);
    } catch (err) {
      console.error("Réponse non JSON:", text);
      return res.status(502).json({ error: "Réponse inattendue de File.io" });
    }

    if (!result.success) {
      console.error("Erreur côté File.io:", result);
      return res.status(500).json({ error: result.message || "Erreur File.io" });
    }

    console.log("✅ Lien File.io :", result.link);
    res.json({ link: result.link });
  } catch (err) {
    console.error("Erreur proxy:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy Render actif sur le port ${PORT}`));
