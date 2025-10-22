// index.js
import express from "express";
import multer from "multer";
import cors from "cors";
import axios from "axios";
import FormData from "form-data";

const app = express();
const upload = multer();

app.use(cors({
  origin: "https://junior2704.github.io"
}));

app.get("/", (req, res) =>
  res.send("✅ Proxy Render vers GoFile.io opérationnel")
);

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });

    // 🔹 création du formulaire multipart
    const formData = new FormData();
    formData.append("file", req.file.buffer, "rapport.pdf");

    // 🔹 upload vers GoFile.io
    const response = await axios.post("https://store1.gofile.io/uploadFile", formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity
    });

    const result = response.data;

    if (result.status !== "ok") {
      return res.status(500).json({ error: "Erreur GoFile.io", details: result });
    }

    const link = result.data.downloadPage;
    console.log("✅ Lien GoFile.io :", link);
    res.json({ link });
  } catch (err) {
    console.error("Erreur proxy:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Proxy Render actif sur le port ${PORT}`)
);
