// Proxy Groq: API key disimpan di Environment Variable (GROQ_API_KEY), tidak pernah dikirim ke browser.
const BASE = "https://api.groq.com/openai/v1";
const MAX_TOKENS = 1024;

module.exports = async function handler(req, res) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: { message: "GROQ_API_KEY belum diatur di server." } });

  try {
    if (req.method === "GET") {
      const r = await fetch(BASE + "/models", { headers: { Authorization: "Bearer " + key } });
      res.status(r.status).setHeader("Content-Type", "application/json");
      return res.send(await r.text());
    }

    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      if (!Array.isArray(b.messages) || b.messages.length > 40) {
        return res.status(400).json({ error: { message: "Permintaan tidak valid." } });
      }
      const body = {
        model: String(b.model || "openai/gpt-oss-20b"),
        messages: b.messages,
        temperature: typeof b.temperature === "number" ? b.temperature : 0.85,
        max_tokens: Math.min(Number(b.max_tokens) || MAX_TOKENS, MAX_TOKENS),
      };
      if (b.reasoning_effort) body.reasoning_effort = "low";

      const r = await fetch(BASE + "/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
        body: JSON.stringify(body),
      });
      res.status(r.status).setHeader("Content-Type", "application/json");
      return res.send(await r.text());
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: { message: "Method tidak diizinkan." } });
  } catch (e) {
    return res.status(502).json({ error: { message: "Gagal menghubungi Groq." } });
  }
};
                                                  
