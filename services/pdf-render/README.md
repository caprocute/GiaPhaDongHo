# pdf-render (Playwright)

Service Node render HTML → PDF (F10 / R2.7).

```bash
cd services/pdf-render
pnpm install   # hoặc npm i
npx playwright install chromium
pnpm start     # :3939
```

BE gọi `POST /render` body `{"html":"..."}` khi `PDF_RENDER_URL=http://localhost:3939`.
Không cấu hình → BE dùng OpenPDF fallback.
