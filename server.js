import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Founders Lab API running");
});

app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/analyze", async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  const website = req.query.website || "";
  const industry = req.query.industry || "";
  const pain = req.query.pain || "";

  const prompt = `
Analyze this organization and suggest AI automation opportunities.

Website: ${website}
Industry: ${industry}
Main problem: ${pain}

Write a short report including:

1. Administrative automation opportunities
2. Customer service AI opportunities
3. Marketing automation
4. Internal workflow AI tools
5. Estimated efficiency gains
`;

  try {

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const data = await aiResponse.json();

    res.json({
      report: data.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      report: "AI analysis failed"
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
