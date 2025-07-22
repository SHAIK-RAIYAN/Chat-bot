require("dotenv").config();

const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Routes
app.get("/", (req, res) => res.redirect("/chat"));
app.get("/chat", (req, res) => {
  res.render("home");
});

// Chat endpoint without conversation history
app.post("/gemini-chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Instruction only prompt
  const prompt = `You are a friendly, helpful assistant. Respond in a professional conversational tone. Keep replies under 200 words but informative.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, { text: userMessage }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      topP: 0.9,
    },
  };

  try {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await axios.post(url, payload, {
      params: { key: apiKey },
      headers: { "Content-Type": "application/json" },
    });

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't process that.";

    res.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

// 404 fallback to /chat
app.use((req, res) => {
  res.redirect("/chat");
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
