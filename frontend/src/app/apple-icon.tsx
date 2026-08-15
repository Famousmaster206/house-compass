import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#E97832",
        }}
      >
        <svg width="128" height="128" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="1.6" />
          <path d="M15.5 8.5L13.2 13.2L8.5 15.5L10.8 10.8L15.5 8.5Z" fill="#FFFFFF" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
