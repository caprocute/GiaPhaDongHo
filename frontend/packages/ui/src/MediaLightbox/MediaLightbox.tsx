"use client";

import { useState, type CSSProperties } from "react";
import { Button } from "../Button/Button";

export interface MediaLightboxProps {
  src: string;
  alt: string;
  caption?: string;
}

export function MediaLightbox({ src, alt, caption }: MediaLightboxProps) {
  const [open, setOpen] = useState(false);

  const thumb: CSSProperties = {
    maxWidth: "240px",
    borderRadius: "var(--radius-md)",
    border: "2px solid var(--color-heritage-frame)",
    cursor: "pointer",
  };

  const overlay: CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "color-mix(in srgb, var(--color-ink-900) 50%, transparent)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--spacing-md)",
    zIndex: 1000,
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={{ border: "none", background: "transparent", padding: 0 }}>
        <img src={src} alt={alt} style={thumb} />
      </button>
      {open ? (
        <div role="dialog" aria-modal="true" style={overlay}>
          <img src={src} alt={alt} style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: "var(--radius-md)" }} />
          {caption ? <p style={{ color: "var(--color-surface-card)", fontFamily: "var(--font-body)" }}>{caption}</p> : null}
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Đóng
          </Button>
        </div>
      ) : null}
    </>
  );
}
