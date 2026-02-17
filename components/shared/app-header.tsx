"use client";

import { Separator } from "@radix-ui/react-separator";
import { SidebarTrigger } from "../ui/sidebar";

type props = {
  title: string;
};

function AppHeader({ title }: props) {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b p-2 bg-white rounded-lg">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-2 text-primary"
      />
      <p className="font-semibold">{title}</p>
    </header>
  );
}

export default AppHeader;
