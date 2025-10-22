// index.js
import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const upload = multer();

// ✅ Autoriser ton site GitHub Pages à utiliser ce proxy
app.use(cors({
  origin: "https://junior2704.github.io"
}));

// ✅ Route test
app.get("/", (req, res) => res.send("✅ Proxy Render vers Transfer.sh opérationnel"));

// ✅ Route d’upload
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }

    // 🔹 Envoi direct du fichier à Transfer.sh
    const response = await fetch("https://transfer.sh/rapport.pdf", {
      method: "PUT",
      body: req.file.buffer
    });

    const link = await response.text();
    console.log("✅ Lien Transfer.sh :", link);

    if (!link.startsWith("https://")) {
      return res.status(500).json({ error: "Réponse invalide de transfer.sh", details: link });
    }

    res.json({ link: link.trim() });
  } catch (err) {
    console.error("Erreur proxy:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy Render actif sur le port ${PORT}`));
