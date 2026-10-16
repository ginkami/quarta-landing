import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { hero, site } from "@/content/landing";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const headingFont = await readFile(
    path.join(process.cwd(), "src/fonts/YanoneKaffeesatz-Bold.woff2"),
  );
  const bodyFont = await readFile(
    path.join(process.cwd(), "src/fonts/PTSerif-Regular.woff2"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#faf6ee",
          color: "#2c2623",
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontFamily: "Yanone",
            fontWeight: 700,
            color: "#4a5d4e",
            lineHeight: 1,
          }}
        >
          {site.name}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 52,
            fontFamily: "PTSerif",
            color: "#2c2623",
          }}
        >
          {hero.title}
        </div>
        <div style={{ marginTop: 48, display: "flex", gap: 16 }}>
          <span
            style={{
              background: "#d08a4b",
              color: "#2c2623",
              padding: "14px 28px",
              borderRadius: 9999,
              fontSize: 30,
              fontFamily: "PTSerif",
            }}
          >
            Обжарка по четвергам
          </span>
          <span
            style={{
              background: "#4a5d4e",
              color: "#faf6ee",
              padding: "14px 28px",
              borderRadius: 9999,
              fontSize: 30,
              fontFamily: "PTSerif",
            }}
          >
            Доставка в пятницу
          </span>
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
      fonts: [
        {
          name: "Yanone",
          data: headingFont,
          style: "normal",
          weight: 700,
        },
        {
          name: "PTSerif",
          data: bodyFont,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
