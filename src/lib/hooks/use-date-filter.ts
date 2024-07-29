"use client";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateRangePickerValue } from "@tremor/react";
import { DateFilter, dateFormat } from "@/types/date-filter";

export default function useDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [dateRangePickerValue, setDateRangePickerValue] =
    useState<DateRangePickerValue>();

  const setDateFilter = useCallback(
    ([startDate, endDate, value]: DateRangePickerValue) => {
      const lastDays = value ?? DateFilter.Custom;

      params.set("last_days", lastDays);

      if (lastDays === DateFilter.Custom && startDate && endDate) {
        params.set("start_date", moment(startDate).format(dateFormat));
        params.set("end_date", moment(endDate).format(dateFormat));
      } else {
        params.delete("start_date");
        params.delete("end_date");
      }

      router.push("/dashboard?" + params.toString(), { scroll: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const lastDaysParam = searchParams?.get("last_days") as DateFilter;
  const lastDays: DateFilter =
    typeof lastDaysParam === "string" &&
    Object.values(DateFilter).includes(lastDaysParam)
      ? lastDaysParam
      : DateFilter.Last7Days;

  const { startDate, endDate } = useMemo(() => {
    const today = moment().utc();
    if (lastDays === DateFilter.Custom) {
      const startDateParam = searchParams?.get("start_date") as string;
      const endDateParam = searchParams?.get("end_date") as string;

      const startDate =
        startDateParam ||
        moment(today)
          .subtract(+DateFilter.Last7Days, "days")
          .format(dateFormat);
      const endDate = endDateParam || moment(today).format(dateFormat);

      return { startDate, endDate };
    }

    const startDate = moment(today)
      .subtract(+lastDays, "days")
      .format(dateFormat);
    const endDate =
      lastDays === DateFilter.Yesterday
        ? moment(today)
            .subtract(+DateFilter.Yesterday, "days")
            .format(dateFormat)
        : moment(today).format(dateFormat);

    return { startDate, endDate };
  }, [
    lastDays,
    searchParams,
    // searchParams?.get("start_date"),
    // searchParams?.get("end_date"),
  ]);

  useEffect(() => {
    setDateRangePickerValue([
      moment(startDate).toDate(),
      moment(endDate).toDate(),
      lastDays === DateFilter.Custom ? null : lastDays,
    ]);
  }, [startDate, endDate, lastDays]);

  const onDateRangePickerValueChange = useCallback(
    ([startDate, endDate, value]: DateRangePickerValue) => {
      if (startDate && endDate) {
        setDateFilter([startDate, endDate, value]);
      } else {
        setDateRangePickerValue([startDate, endDate, value]);
      }
    },
    [setDateFilter]
  );

  return {
    startDate,
    endDate,
    dateRangePickerValue,
    onDateRangePickerValueChange,
  };
}
