"use client";
import { queryPipe } from "@/lib/apianalytics";
import browsers from "@/lib/constants/browsers";
import { TopBrowsers, TopBrowsersData } from "@/types/top-browsers";
import useDateFilter from "@/lib/hooks/use-date-filter";
import useQuery from "@/lib/hooks/use-query";

async function getTopBrowsers(
  date_from?: string,
  date_to?: string
): Promise<TopBrowsers> {
  const { data: queryData } = await queryPipe<TopBrowsersData>("top_browsers", {
    date_from,
    date_to,
    limit: 4,
  });
  const data = [...queryData]
    .sort((a, b) => b.visits - a.visits)
    .map(({ browser, visits }) => ({
      browser: browsers[browser] ?? browser,
      visits,
    }));

  return { data };
}

export default function useTopBrowsers() {
  const { startDate, endDate } = useDateFilter();
  return useQuery([startDate, endDate, "topBrowsers"], getTopBrowsers);
}
