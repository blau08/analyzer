import express from "express";

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  res.send("Founders Lab API running");
});

app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

app.get("/analyze", async (req, res) => {
  try {
    console.log("GET /analyze hit");
    console.log("Query:", req.query);

    const website = req.query.website || "";
    const industry = req.query.industry || "";
    const pain = req.query.pain || "";

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

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("OpenAI error:", data);
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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
