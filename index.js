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

// Store conversation history (in-memory for simplicity)
let conversationHistory = [];

// Routes
app.get("/", (req, res) => res.redirect("/chat"));
app.get("/chat", (req, res) => {
  // Reset history on new chat session (optional)
  conversationHistory = [];
  res.render("home");
});

// Chat endpoint with improved prompt structure
app.post("/gemini-chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Improved instruction
  const instruction =
    "You are a friendly, helpful assistant named GeminiBot. Respond in a conversational, upbeat tone. Keep replies concise (under 200 words) but informative. If the user input is vague or unclear (e.g., single characters or symbols), politely ask for clarification. Provide relevant answers based on the conversation context.";

  // Build conversation history
  const newMessage = { role: "user", parts: [{ text: userMessage }] };
  conversationHistory.push(newMessage);

  // Limit history to last 5 messages to avoid token overflow
  if (conversationHistory.length > 5) {
    conversationHistory = conversationHistory.slice(-5);
  }

  const payload = {
    contents: [
      { role: "user", parts: [{ text: instruction }] }, // Instruction as first part
      ...conversationHistory, // Include history
    ],
    generationConfig: {
      temperature: 0.7, // Controls randomness
      maxOutputTokens: 1024, // Increased for fuller responses
      topP: 0.9, // Controls diversity
    },
  };

  try {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"; // Updated model name
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await axios.post(url, payload, {
      params: { key: apiKey },
      headers: { "Content-Type": "application/json" },
    });

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't process that.";

    // Add bot response to history
    conversationHistory.push({ role: "assistant", parts: [{ text: reply }] });

    res.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

// 404 fallback
app.use((req, res) => {
  res.redirect("/chat"); // Redirect to chat for better UX
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
