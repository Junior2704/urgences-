// index.js
import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import cors from "cors";
import FormData from "form-data";

const app = express();
const upload = multer();

// ✅ Autorise ton site GitHub Pages à accéder au proxy
app.use(cors({
  origin: "https://junior2704.github.io"
}));

// ✅ Route GET de test (facultative)
app.get("/", (req, res) => res.send("✅ Proxy Render opérationnel - route /upload disponible"));

// ✅ Route POST pour l’upload de fichier
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, "rapport.pdf");

    // ✅ Envoi du fichier vers File.io
    const response = await fetch("https://file.io/?expires=7d", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (!result.success) {
      console.error("Erreur file.io :", result);
      return res.status(500).json({ error: result.message });
    }

    console.log("✅ Lien File.io :", result.link);
    res.json({ link: result.link });
  } catch (err) {
    console.error("Erreur proxy :", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy Render actif sur le port ${PORT}`));
