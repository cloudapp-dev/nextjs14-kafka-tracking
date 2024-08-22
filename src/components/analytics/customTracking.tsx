"use client";
import usePageTracking from "@/lib/hooks/usePageTracking";

const PageTracker: React.FC = () => {
  usePageTracking(); // Hook is called here

  return null; // This component doesn't need to render anything
};

export default PageTracker;
