"use client";
import { BarChart } from "@tremor/react";
import Widget from "../Widget";
import useTrend from "@/lib/hooks/use-trend";
import { useMemo } from "react";
import moment from "moment";

export default function TrendWidget() {
  const { data, status, warning } = useTrend();
  const chartData = useMemo(
    () =>
      (data?.data ?? []).map((d) => ({
        Date: moment(d.t).format("HH:mm"),
        "Number of visits": d.visits,
      })),
    [data]
  );

  return (
    <Widget>
      <div className="flex items-center justify-between">
        <Widget.Title>Users in last 30 minutes</Widget.Title>
        <h3 className="text-neutral-64 font-normal text-xl">
          {data?.totalVisits ?? 0}
        </h3>
      </div>
      <Widget.Content
        status={status}
        loaderSize={40}
        noData={!chartData?.length}
        warning={warning?.message}
      >
        <BarChart
          data={chartData}
          index="Date"
          categories={["Number of visits"]}
          colors={["blue"]}
          className="h-32"
          showXAxis={false}
          showYAxis={false}
          showLegend={false}
          showGridLines={false}
        />
      </Widget.Content>
    </Widget>
  );
}
