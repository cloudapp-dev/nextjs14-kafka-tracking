"use client";
import { useState } from "react";
import {
  DatePicker,
  DateRangePicker,
  DateRangePickerValue,
  DateRangePickerItem,
} from "@tremor/react";

import { format, subDays } from "date-fns";
import { de } from "date-fns/locale";

const Tracking = () => {
  const [dateRange, setDateRange] = useState<DateRangePickerValue>({
    from: new Date(2023, 1, 1),
    to: new Date(),
  });

  //   const [dateRange, setDateRange] = useState<[Date, Date]>([
  //     subDays(new Date(), 30),
  //     new Date(),
  //   ]);

  //   const handleDateChange = (range: [Date, Date]) => {
  //     setDateRange(range);
  //   };

  return (
    <div className="mx-auto max-w-md space-y-3 text-base">
      <p className="text-center font-mono text-sm text-slate-500">
        Date Picker
      </p>
      <DatePicker placeholder="Datum auswählen" className="2xs" />
      <p className="pt-6 text-center font-mono text-sm text-slate-500">
        Date Range Picker
      </p>
      <DateRangePicker
        className="mx-auto max-w-md text-base"
        value={dateRange}
        onValueChange={setDateRange}
        locale={de}
        selectPlaceholder="Bereich auswählen"
        placeholder="Auswahl"
        // enableSelect={false}
      />
    </div>
  );
};

export default Tracking;
