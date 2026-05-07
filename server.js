const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());
app.use(express.json());

const FAL_API_KEY = process.env.FAL_API_KEY;
const PASSWORD = "1075688202";

const authMiddleware = (req, res, next) => {
  const password = req.headers.authorization?.split(' ')[1];
  if (password !== PASSWORD) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }
  next();
};

app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

app.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { prompt, model, duration, aspect, imageUrl, negative_prompt, seed } = req.body;

    const payload = {
      prompt,
      duration: parseInt(duration) || 6,
      aspect_ratio: aspect || "16:9",
      negative_prompt: negative_prompt || "",
      seed: seed ? parseInt(seed) : Math.floor(Math.random() * 10000000)
    };

    if (imageUrl) payload.image_url = imageUrl;

    const response = await fetch(`https://queue.fal.run/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.json({ success: true, output: data.output || data });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 RataVideo IA v2.1 corriendo");
});
