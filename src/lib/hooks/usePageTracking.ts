"use client";
import { useEffect, useState } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

// Define the type for the page view data
interface PageViewData {
  pageViewID: string;
  sessionID: string;
  userID: string;
  url: string;
  referrer: string;
  timestamp: string;
  country: string;
  city: string;
  region: string;
  pathname: string;
  userAgent: string;
  platform: string;
  isMobileDevice: boolean;
}

// Define the type for the time spent data
interface TimeSpentData {
  sessionID: string;
  userID: string;
  timeSpent: number;
  url: string;
  pathname: string;
  userAgent: string;
  platform: string;
  isMobileDevice: boolean;
  country?: string;
  city?: string;
  region?: string;
}

function createSessionID(): string {
  return "session-" + Math.random().toString(36).substr(2, 16);
}

function createPageViewID(): string {
  return "view-" + Math.random().toString(36).substr(2, 16);
}

function getSessionID(): string {
  let sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = createSessionID();
    localStorage.setItem("session_id", sessionId);
  }
  return sessionId;
}

async function sendToPrisma(message: any) {
  // Pushing tracking Info direct to Postgres
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/customtracking`, {
    method: "POST",
    body: JSON.stringify(message),
  });
}

async function getUserID(): Promise<string> {
  const fpPromise = FingerprintJS.load();

  const fp = await fpPromise;
  const result = await fp.get();

  return result.visitorId; // This is the anonymous user ID
}

async function getUserCountry(): Promise<string> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return data.country_name || "Unknown";
  } catch (error) {
    console.error("Error fetching country:", error);
    return "Unknown";
  }
}

async function getUserLocation(): Promise<{
  country: string;
  city: string;
  region: string;
}> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return {
      country: data.country_name || "Unknown",
      city: data.city || "Unknown",
      region: data.region || "Unknown",
    };
  } catch (error) {
    console.error("Error fetching location:", error);
    return {
      country: "Unknown",
      city: "Unknown",
      region: "Unknown",
    };
  }
}

function getPlatform(): string {
  return navigator.platform || "Unknown";
}

function isMobileDevice(): boolean {
  const userAgent =
    navigator.userAgent ||
    navigator.vendor ||
    (window as Window & { opera?: string }).opera;

  // Check if the user agent matches typical mobile devices
  if (/android/i.test(userAgent || "")) {
    return true;
  }

  if (
    /iPad|iPhone|iPod/.test(userAgent || "") &&
    !(window as Window & { MSStream?: unknown }).MSStream
  ) {
    return true;
  }

  return false;
}

async function capturePageView(userID: string): Promise<void> {
  const pageViewID = createPageViewID();
  const sessionID = getSessionID();
  const url = window.location.href;
  const referrer = document.referrer;
  const timestamp = new Date().toISOString();
  const country = await getUserCountry();
  const { city, region } = await getUserLocation();
  const pathname = window.location.pathname;
  const userAgent = navigator.userAgent;
  const platform = getPlatform();
  const mobileDevice = isMobileDevice();

  const pageViewData: PageViewData = {
    pageViewID: pageViewID,
    sessionID: sessionID,
    userID: userID,
    url: url,
    referrer: referrer,
    timestamp: timestamp,
    country: country,
    city: city,
    region: region,
    pathname: pathname,
    userAgent: userAgent,
    platform: platform,
    isMobileDevice: mobileDevice,
  };

  sendDataToServer(pageViewData);
}

function sendDataToServer(data: PageViewData | TimeSpentData): void {
  const trackdata: any = data;

  const message = {
    country: trackdata.country,
    city: trackdata.city,
    region: trackdata.region,
    pathname: trackdata.pathname,
    url: trackdata.url,
    mobile: trackdata.isMobileDevice,
    platform: trackdata.platform,
    useragent: trackdata.userAgent,
    referer: trackdata.referrer,
    userId: trackdata.userID,
    pageViewId: trackdata.pageViewID,
    sessionId: trackdata.sessionID,
    created_at: trackdata.timestamp,
  };

  sendToPrisma(message);

  //   Send data to your server

  //   const endpoint = "https://yourserver.com/track"; // Replace with your server URL

  //   fetch(endpoint, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log("Success:", data);
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
}

export default function usePageTracking(): void {
  const [userID, setUserID] = useState<string | null>(null);

  useEffect(() => {
    // Initialize user ID and start tracking
    const initializeTracking = async () => {
      const id = await getUserID();
      setUserID(id);
      await capturePageView(id);
    };

    initializeTracking();

    const pageLoadTime = Date.now();

    const handleBeforeUnload = async () => {
      if (userID) {
        const timeSpent = Date.now() - pageLoadTime;
        const url = window.location.href;
        const pathname = window.location.pathname;
        const userAgent = navigator.userAgent;
        const platform = getPlatform();
        const mobileDevice = isMobileDevice();
        const { country, city, region } = await getUserLocation(); // get location before unload

        const timeSpentData: TimeSpentData = {
          sessionID: getSessionID(),
          userID: userID,
          timeSpent: timeSpent,
          url: url,
          pathname: pathname,
          userAgent: userAgent,
          platform: platform,
          isMobileDevice: mobileDevice,
          country: country,
          city: city,
          region: region,
        };

        sendDataToServer(timeSpentData);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userID]);
}
