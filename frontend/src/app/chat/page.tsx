import type { Metadata } from "next";

import { ChatUI } from "@/components/chat/ChatUI";
import { Navbar } from "@/components/ui/Navbar";
import { PageAnalytics } from "@/components/PageAnalytics";

export const metadata: Metadata = {
  title: "Talk with my AI",
  description:
    "An AI version of Afnan Hany, grounded in her real CV, projects, and experience. It never makes things up.",
};

export default function ChatPage() {
  return (
    <>
      <Navbar />
      <PageAnalytics />
      <ChatUI />
    </>
  );
}
