import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/site";

const title = "StartWithStartup — Land your role at a funded startup";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title,
    path: "/app",
  }),
  title: {
    absolute: title,
  },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return children;
}
