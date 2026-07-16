# Gate C — Visual regression (pilot)

So screenshot Storybook static với baseline trong `pilot.spec.ts-snapshots/`.

```bash
# Từ frontend/
pnpm test:visual          # build Storybook + so baseline
pnpm test:visual:update   # cập nhật baseline sau khi đổi UI có chủ ý
```

Canonical baseline nên sinh trên Linux (khớp CI):

```bash
docker run --rm -v "$PWD/..":/repo -w /repo/frontend \
  mcr.microsoft.com/playwright:v1.51.1-jammy \
  bash -lc 'corepack enable && pnpm install --frozen-lockfile && pnpm test:visual:update'
```

Story pilot: Button, Alert, PublicHeader, DataTable, GioCard. Workflow: `.github/workflows/visual.yml`.
