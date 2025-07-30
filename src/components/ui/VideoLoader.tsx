import React from 'react';

interface VideoLoaderProps {
  className?: string;
}

export function VideoLoader({ className = "" }: VideoLoaderProps) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-secondary-400 via-secondary-500 to-secondary-800 ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-white/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <span className="text-white/80 text-sm font-medium">Loading video...</span>
      </div>
    </div>
  );
}