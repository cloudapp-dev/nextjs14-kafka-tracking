import { DecodedPayload } from "@/types/api";

const unixTimestampToDate = (unixTimestamp: number): Date => {
  return new Date(unixTimestamp * 1000);
};

const urlBase64Decode = (payload: string): DecodedPayload => {
  // decode the base64 string
  const base64Decoded = atob(payload);

  // URL-decode the data
  const urlDecoded = decodeURIComponent(base64Decoded);

  // parse the JSON data
  return JSON.parse(urlDecoded);
};

export { unixTimestampToDate, urlBase64Decode };

//Web Analytics

export const cx = (...args: (string | undefined | false)[]) =>
  args.filter(Boolean).join(" ");

export const formatNumber = (num: number) => Intl.NumberFormat().format(+num);

export const dataFormatter = (number: number) =>
  `$ ${Intl.NumberFormat("us").format(number).toString()}`;

export function kFormatter(value: number): string {
  return value > 999 ? `${(value / 1000).toFixed(1)}K` : String(value);
}

export function formatMinSec(totalSeconds: number) {
  if (isNaN(totalSeconds)) return "0s";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const padTo2Digits = (value: number) => value.toString().padStart(2, "0");
  return `${minutes ? `${minutes}m` : ""} ${padTo2Digits(seconds)}s`;
}

export function formatPercentage(value: number) {
  return `${value ? (value * 100).toFixed(2) : "0"}%`;
}
