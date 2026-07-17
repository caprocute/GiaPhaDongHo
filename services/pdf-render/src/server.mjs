import http from "node:http";
import { chromium } from "playwright";

const PORT = Number(process.env.PORT || 3939);

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (req.method !== "POST" || req.url !== "/render") {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const { html } = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!html || typeof html !== "string") {
      res.writeHead(400);
      res.end("html required");
      return;
    }
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle" });
      const pdf = await page.pdf({ format: "A4", printBackground: true });
      res.writeHead(200, { "Content-Type": "application/pdf", "Content-Length": pdf.length });
      res.end(pdf);
    } finally {
      await browser.close();
    }
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(String(e?.message || e));
  }
});

server.listen(PORT, () => {
  console.log(`pdf-render listening on :${PORT}`);
});
