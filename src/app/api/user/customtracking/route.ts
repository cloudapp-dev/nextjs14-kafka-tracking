import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const {
    country,
    city,
    region,
    pathname,
    url,
    mobile,
    platform,
    useragent,
    referer,
    created_at,
    userId,
    pageViewId,
    sessionId,
  } = await req.json();

  let data = await prisma.customtracking.create({
    data: {
      country: country,
      city: city,
      region: region,
      pathname: pathname,
      url: url,
      mobile: mobile,
      platform: platform,
      useragent: useragent,
      referer: referer,
      created_at: created_at,
      userId: userId,
      pageViewId: pageViewId,
      sessionId: sessionId,
    },
  });

  return NextResponse.json({
    data,
  });
}
