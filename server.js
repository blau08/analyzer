import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Founders Lab API running");
});

app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : "";
}

function extractMetaDescription(html) {
  const match = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
  );
  return match ? match[1].trim() : "";
}

function extractHeadings(html) {
  const matches = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)];
  return matches
    .map(m => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 15);
}

app.get("/analyze", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const website = req.query.website || "";
  const industry = req.query.industry || "";
  const pain = req.query.pain || "";

  if (!website) {
    return res.status(400).json({ report: "Missing website parameter." });
  }

  let normalizedUrl = website.trim();
  if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  try {
    // 1) Fetch the website
    const siteResponse = await fetch(normalizedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 FoundersLabAnalyzer/1.0"
      }
    });

    const html = await siteResponse.text();

    // 2) Extract useful context
    const title = extractTitle(html);
    const metaDescription = extractMetaDescription(html);
    const headings = extractHeadings(html);
    const bodyText = stripHtml(html).slice(0, 6000);

    // 3) Build prompt for OpenAI
    const prompt = `
You are analyzing an organization for AI and workflow opportunities.

Website URL:
${normalizedUrl}

Industry:
${industry}

Main operational challenge:
${pain}

Website title:
${title}

Meta description:
${metaDescription}

Key headings:
${headings.join(" | ")}

Visible homepage text:
${bodyText}

Write a concise but useful report with these sections:

1. What this organization appears to do
2. Likely operational bottlenecks
3. AI automation opportunities
4. Internal AI tools or copilots they could use
5. Practical first 3 steps
6. Estimated efficiency gains

Be specific to the website context. Avoid generic fluff.
`;

    // 4) Call OpenAI
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert AI operations consultant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({
        report: "OpenAI analysis failed.",
        error: data
      });
    }

    const report = data.choices?.[0]?.message?.content || "No report returned.";

    res.json({
      report,
      scraped: {
        url: normalizedUrl,
        title,
        metaDescription,
        headings
      }
    });

  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({
      report: "Website analysis failed.",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
