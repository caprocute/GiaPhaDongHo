"use client";

import type { ReactNode } from "react";
import { AppearanceControl } from "../Theme/AppearanceControl";
import styles from "./PublicFooter.module.css";

export interface PublicFooterProps {
  title?: string;
  contact?: string;
  columns?: { heading: string; items: string[] }[];
  /** Slot thay control giao diện (mặc định AppearanceControl) */
  tools?: ReactNode;
}

export function PublicFooter({
  title = "Trang thông tin Họ Hoàng thôn Trung Bính",
  contact = "Người chịu trách nhiệm: Hoàng Hoa Thám\nTrung Bính, Bảo Ninh, Đồng Hới, Quảng Trị\nQuỹ công đức: BIDV chi nhánh Quảng Trị",
  columns = [
    {
      heading: "Chuyên mục",
      items: ["Thông tin dòng họ", "Gia phả · Phả đồ", "Ngày giỗ", "Công đức"],
    },
  ],
  tools,
}: PublicFooterProps) {
  return (
    <footer className={styles.foot}>
      <div className={styles.wrap}>
        <div>
          <h6>{title}</h6>
          {contact.split("\n").map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <h6>{col.heading}</h6>
            <ul>
              {col.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h6>Mang theo bên mình</h6>
          <p>Quét mã mở trang trên điện thoại</p>
          <svg className={styles.qr} viewBox="0 0 84 84" aria-label="Mã QR minh họa">
            <g fill="var(--color-heritage-frame)">
              <rect x="8" y="8" width="20" height="20" />
              <rect x="56" y="8" width="20" height="20" />
              <rect x="8" y="56" width="20" height="20" />
              <rect x="12" y="12" width="12" height="12" fill="var(--color-text-on-brand)" />
              <rect x="60" y="12" width="12" height="12" fill="var(--color-text-on-brand)" />
              <rect x="12" y="60" width="12" height="12" fill="var(--color-text-on-brand)" />
              <rect x="36" y="12" width="6" height="6" />
              <rect x="44" y="22" width="6" height="6" />
              <rect x="36" y="34" width="6" height="6" />
              <rect x="50" y="38" width="6" height="6" />
              <rect x="60" y="44" width="6" height="6" />
              <rect x="36" y="50" width="6" height="6" />
              <rect x="46" y="58" width="6" height="6" />
              <rect x="58" y="64" width="6" height="6" />
              <rect x="68" y="54" width="6" height="6" />
              <rect x="40" y="68" width="6" height="6" />
            </g>
          </svg>
        </div>
      </div>
      <div className={styles.bandThin} aria-hidden="true" />
      <div className={styles.base}>
        <span className={styles.baseCopy}>
          © {new Date().getFullYear()} Họ Hoàng – Huỳnh thôn Trung Bính · Xây dựng trên nền tảng GiaPhaHub
        </span>
        <div className={styles.baseTools}>{tools ?? <AppearanceControl />}</div>
      </div>
    </footer>
  );
}
