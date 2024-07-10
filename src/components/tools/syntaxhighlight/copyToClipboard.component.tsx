"use client";
import { useState } from "react";
import type { LocaleTypes } from "@/app/i18n/settings";
import { useTranslation } from "@/app/i18n/client";
import { useParams } from "next/navigation";

export default function CopyToClipboard({ code }: { code: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const locale = useParams()?.locale as LocaleTypes;
  const { t } = useTranslation(locale, "common");

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      console.log("Copied to clipboard");
    } catch (error) {
      console.error("Error copying to clipboard", error);
    } finally {
      setTimeout(() => {
        // do something
        setIsCopied(false);
      }, 2000);
    }
  };

  return (
    <button disabled={isCopied} onClick={copyToClipboard}>
      {isCopied ? t("copybutton.afterclick")! : t("copybutton.beforeclick")}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="#fff"
        viewBox="0 0 256 256"
      >
        <path d="M216,40V168H168V88H88V40Z" opacity="0.2"></path>
        <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path>
      </svg>
    </button>
  );
}
