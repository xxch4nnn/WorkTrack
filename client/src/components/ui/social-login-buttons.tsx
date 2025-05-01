import React from "react";
import { Button } from "@/components/ui/button";
import { FaGoogle, FaFacebook, FaApple, FaGithub } from "react-icons/fa";

interface SocialLoginButtonsProps {
  onLogin: (provider: string) => void;
  className?: string;
}

export function SocialLoginButtons({ 
  onLogin, 
  className 
}: SocialLoginButtonsProps) {
  return (
    <div className={`grid grid-cols-4 gap-2 ${className || ""}`}>
      <Button
        type="button"
        variant="outline"
        className="flex items-center justify-center"
        onClick={() => onLogin("Google")}
      >
        <FaGoogle className="h-4 w-4 text-red-500" />
      </Button>
      
      <Button
        type="button"
        variant="outline"
        className="flex items-center justify-center"
        onClick={() => onLogin("Facebook")}
      >
        <FaFacebook className="h-4 w-4 text-blue-600" />
      </Button>
      
      <Button
        type="button"
        variant="outline"
        className="flex items-center justify-center"
        onClick={() => onLogin("Apple")}
      >
        <FaApple className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="outline"
        className="flex items-center justify-center"
        onClick={() => onLogin("GitHub")}
      >
        <FaGithub className="h-4 w-4" />
      </Button>
    </div>
  );
}