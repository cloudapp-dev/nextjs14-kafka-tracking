"use client";
import { useState, useEffect } from "react";
import type { LocaleTypes } from "@/app/i18n/settings";
import { useTranslation } from "@/app/i18n/client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaHandsClapping } from "react-icons/fa6";

interface ClapButtonProps {
  slug: string | undefined;
}

export default function ClapButton({ slug }: ClapButtonProps) {
  const [claps, setClaps] = useState<number>(0);

  const locale = useParams()?.locale as LocaleTypes;
  const { t } = useTranslation(locale, "common");

  const { data: session } = useSession();
  const disabled = !session;

  useEffect(() => {
    const fetchClaps = async () => {
      const res = await fetch(`/api/claps?slug=${slug}`);
      const data = await res.json();
      setClaps(data.claps);
    };

    fetchClaps();
  }, [slug]);

  const handleClap = async () => {
    const res = await fetch("/api/claps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug }),
    });

    const data = await res.json();
    setClaps(data.claps);
  };

  return (
    <div>
      {(session && (
        <div className="pb-4 text-base">{t("claps.clapText")}</div>
      )) || <div className="pb-4 text-base">{t("claps.clapLogin")}</div>}
      <button
        disabled={disabled}
        onClick={handleClap}
        className="bg-blue-500 fixed z-10 bottom-4 left-4 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600 transition duration-300 ease-in-out flex items-center"
      >
        <FaHandsClapping className="mr-2 w-6 h-6" />
        <span className="text-lg">{claps}</span>
      </button>
    </div>
  );
}
