import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Founders Lab API is running");
});

app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/analyze", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const website = req.query.website || "";
  const industry = req.query.industry || "";
  const pain = req.query.pain || "";

  const report = `
AI Opportunity Report

Website: ${website}
Industry: ${industry}

Key opportunities:

1. Automate admin workflows
2. AI chatbot for inquiries
3. AI marketing content generation
4. CRM automation
5. Workflow optimization

Estimated efficiency gain: 20-40%
`;

  res.json({ report });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
