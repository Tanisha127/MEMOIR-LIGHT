import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Memoir Light — Your Memory Companion",
  description: "A warm, gentle companion for memory care and daily living",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              className: "toast-warm",
              duration: 3000,
              style: {
                background: "#FDF0DC",
                color: "#4A3728",
                border: "1px solid #E8DDD4",
                borderRadius: "16px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "15px",
                padding: "14px 20px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
