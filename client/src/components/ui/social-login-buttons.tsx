import React from "react";
import { Button } from "./button";
import { FaGoogle, FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";

interface SocialLoginButtonsProps {
  onLogin: (provider: string) => void;
  className?: string;
}

export function SocialLoginButtons({ onLogin, className }: SocialLoginButtonsProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      <Button 
        type="button" 
        variant="outline" 
        className="flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
        onClick={() => onLogin('google')}
      >
        <FaGoogle className="text-red-500" />
        <span className="text-sm">Google</span>
      </Button>

      <Button 
        type="button" 
        variant="outline" 
        className="flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
        onClick={() => onLogin('facebook')}
      >
        <FaFacebook className="text-blue-600" />
        <span className="text-sm">Facebook</span>
      </Button>

      <Button 
        type="button" 
        variant="outline" 
        className="flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
        onClick={() => onLogin('github')}
      >
        <FaGithub className="text-gray-900" />
        <span className="text-sm">GitHub</span>
      </Button>

      <Button 
        type="button" 
        variant="outline" 
        className="flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
        onClick={() => onLogin('linkedin')}
      >
        <FaLinkedin className="text-blue-700" />
        <span className="text-sm">LinkedIn</span>
      </Button>
    </div>
  );
}