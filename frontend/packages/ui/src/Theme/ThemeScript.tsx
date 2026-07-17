import { THEME_STORAGE_KEY } from "./themeTypes";

/**
 * Inline script (string) — chạy trước hydrate để tránh FOUC.
 * Giữ đồng bộ với applyTheme / readAppearance.
 */
export function getThemeInitScript(): string {
  return `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var r=document.documentElement;var d={palette:"bang-vang",mode:"system"};try{var raw=localStorage.getItem(k);if(raw){var p=JSON.parse(raw);if(p&&(p.palette==="bang-vang"||p.palette==="co"))d.palette=p.palette;if(p&&(p.mode==="light"||p.mode==="dark"||p.mode==="system"))d.mode=p.mode;}}catch(e){}var dark=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var resolved=d.mode==="dark"||(d.mode==="system"&&dark)?"dark":"light";r.setAttribute("data-palette",d.palette);r.setAttribute("data-mode",resolved);r.style.colorScheme=resolved;}catch(e){}})();`;
}

/** Đặt trong `<head>` (portal) hoặc đầu `<html>` để áp theme trước paint. */
export function ThemeScript() {
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: getThemeInitScript() }}
    />
  );
}
