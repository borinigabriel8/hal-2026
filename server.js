import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import 'dotenv/config';

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// ENV
// ===============================
const HF_TOKEN = process.env.HF_TOKEN;
const PORT = process.env.PORT || 4000;

if (!HF_TOKEN) {
  console.error("HF_TOKEN não definido!");
  process.exit(1);
}

// ===============================
// ROUTE
// ===============================
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ reply: "Nenhuma mensagem recebida." });
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HF_TOKEN}`,
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.1-8B-Instruct",
          messages: [
            {
              role: "system",
              content:
                "Você é o HAL 9000. Fale calmo, lógico e levemente inquietante.",
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ??
      "Silêncio no vácuo do espaço… nenhuma resposta recebida.";

    res.json({ reply });
  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ reply: "Erro ao se comunicar com o sistema." });
  }
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
