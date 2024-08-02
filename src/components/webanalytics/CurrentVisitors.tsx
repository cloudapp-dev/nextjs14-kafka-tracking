"use client";
import useCurrentVisitors from "@/lib/hooks/use-current-visitors";

export default function CurrentVisitors() {
  const currentVisitors = useCurrentVisitors();
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full h-2 w-2 bg-blue-500" />
      <p className="text-[#636679] text-sm truncate">{`${currentVisitors} current visitor${
        currentVisitors === 1 ? "" : "s"
      }`}</p>
    </div>
  );
}
