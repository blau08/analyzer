import express from "express";

const app = express();

app.use(express.json());

// simple CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.get("/", (req, res) => {
  res.send("Founders Lab API running");
});

app.post("/analyze", async (req, res) => {
  try {
    console.log("POST /analyze hit");
    console.log("Body:", req.body);

    const { website, industry, pain } = req.body;

    const prompt = `
Analyze this business and suggest AI automation opportunities.

Website: ${website}
Industry: ${industry}
Main problem: ${pain}

Create a short AI strategy report including:

1. Automation opportunities
2. Internal AI tools
3. Marketing automation ideas
4. Efficiency improvements
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    console.log("OpenAI response received");

    if (!response.ok) {
      console.log("OpenAI error:", data);
      return res.status(500).json({
        report: "OpenAI request failed.",
        error: data
      });
    }

    res.json({
      report: data.choices?.[0]?.message?.content || "No report returned."
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      report: "Server error.",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
