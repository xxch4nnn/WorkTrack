import React from "react";
import { Button } from "./button";
import { ArrowLeftCircle, ArrowRightCircle, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile?: boolean;
  className?: string;
}

export function SidebarToggle({ isOpen, toggleSidebar, isMobile = false, className }: SidebarToggleProps) {
  return (
    <Button
      onClick={toggleSidebar}
      variant="ghost"
      size="icon"
      className={cn(
        "transition-all duration-300",
        isMobile ? "lg:hidden" : "hidden lg:flex",
        className
      )}
    >
      {isMobile ? (
        <Menu className="h-5 w-5" />
      ) : isOpen ? (
        <ArrowLeftCircle className="h-5 w-5" />
      ) : (
        <ArrowRightCircle className="h-5 w-5" />
      )}
    </Button>
  );
}