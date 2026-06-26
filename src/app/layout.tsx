import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FeedbackProvider } from "@/components/FeedbackWidget";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Start With Startup",
  description:
    "A weekly AI agent that finds recently funded startups and creates a personalized application strategy",
};

const themeScript = `
  (function () {
    try {
      var theme = localStorage.getItem("theme");
      if (theme === "light") {
        document.documentElement.classList.add("light");
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <PostHogProvider>
            <FeedbackProvider>{children}</FeedbackProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
