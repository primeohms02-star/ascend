/* eslint-disable @next/next/no-img-element */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

const logoDataUrl =
  `data:image/png;base64,${readFileSync(
    join(
      process.cwd(),
      "public",
      "ascend-navbar-logo.png"
    )
  ).toString("base64")}`;

export function createMusicSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background:
            "radial-gradient(circle at 84% 22%, rgba(37, 99, 235, 0.28), transparent 34%), radial-gradient(circle at 18% 86%, rgba(8, 145, 178, 0.18), transparent 36%), #020617",
          color: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: "56px 68px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(148, 163, 184, 0.16)",
            borderRadius: "38px",
            display: "flex",
            inset: "24px",
            position: "absolute",
          }}
        />

        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            left: "68px",
            position: "absolute",
            top: "56px",
            width: "1064px",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: "18px",
            }}
          >
            <img
              alt=""
              height={62}
              src={logoDataUrl}
              width={62}
            />
            <div
              style={{
                display: "flex",
                fontSize: "25px",
                fontWeight: 800,
                letterSpacing: "0.18em",
              }}
            >
              ASCEND
            </div>
          </div>

          <div
            style={{
              border: "1px solid rgba(125, 211, 252, 0.3)",
              borderRadius: "999px",
              color: "#BAE6FD",
              display: "flex",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              padding: "12px 20px",
            }}
          >
            ASCEND MUSIC
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            left: "68px",
            position: "absolute",
            top: "202px",
            width: "940px",
          }}
        >
          <div
            style={{
              color: "#7DD3FC",
              display: "flex",
              fontSize: "21px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              marginBottom: "22px",
              textTransform: "uppercase",
            }}
          >
            Nigeria · Africa · Global
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "65px",
              fontWeight: 850,
              letterSpacing: "-0.045em",
              lineHeight: 1.04,
            }}
          >
            Direction for the music career you are building.
          </div>

          <div
            style={{
              color: "#CBD5E1",
              display: "flex",
              fontSize: "25px",
              lineHeight: 1.35,
              marginTop: "24px",
            }}
          >
            Career clarity · Atlas guidance · Music opportunities
          </div>
        </div>

        <div
          style={{
            alignItems: "center",
            bottom: "52px",
            color: "#94A3B8",
            display: "flex",
            fontSize: "18px",
            justifyContent: "space-between",
            left: "68px",
            position: "absolute",
            width: "1064px",
          }}
        >
          <div style={{ display: "flex" }}>
            A specialist pathway inside ASCEND
          </div>
          <div
            style={{
              color: "#E2E8F0",
              display: "flex",
              fontWeight: 700,
            }}
          >
            ascendai.space/music
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
