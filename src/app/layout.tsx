import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SteppeQuest — Монголын түүхэн аялал",
  description: "Монголын түүх, газар нутаг, түүхэн хүмүүс, өв соёлыг зураг, дуу, интерактив аяллаар танилцуулах SteppeQuest платформ."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}
