"use client";
import { useRouter, useParams, useSearchParams } from "next/navigation";

export default function useParamsModul<T extends string>({
  key,
  defaultValue,
  values,
}: {
  key: string;
  defaultValue?: T;
  values: T[];
}): [T, (param: T) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const param = useParams()?.key as T;
  // const param = router.query[key] as T;
  const value =
    typeof param === "string" && values.includes(param)
      ? param
      : defaultValue ?? values[0];

  const setParam = (param: T) => {
    // const searchParams = new URLSearchParams(window.location.search);
    // searchParams.set(key, param);
    params.set(key, param);
    router.push("/dashboard?" + params.toString(), { scroll: false });
    // router.push(searchParams.toString(), { scroll: false });
  };

  return [value, setParam];
}
