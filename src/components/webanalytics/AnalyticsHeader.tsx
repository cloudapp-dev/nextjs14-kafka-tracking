"use client";
import DateFilter from "@/components/webanalytics/DateFilter";
import CurrentVisitors from "@/components/webanalytics/CurrentVisitors";
import useDomain from "@/lib/hooks/use-domain";
import Image from "next/image";

export default function AnalyticsHeader() {
  const { domain, logo, handleLogoError } = useDomain();

  return (
    <div className="flex justify-between flex-col lg:flex-row gap-6 mb-4">
      <div className="flex gap-2 md:gap-10 justify-between md:justify-start">
        <h1 className="flex items-center gap-2 min-w-max">
          <Image
            src={logo}
            alt=""
            width={16}
            height={16}
            onError={handleLogoError}
            loading="lazy"
          />
          <span className="text-lg leading-6">{domain}</span>
        </h1>
        <CurrentVisitors />
      </div>
      <DateFilter />
    </div>
  );
}
