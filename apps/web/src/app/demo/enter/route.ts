import { NextResponse } from "next/server";
import { DEMO_COOKIE_NAME, getRequestOrigin } from "@/demo/mode";

export function GET(request: Request) {
  const destination = new URL("/tasks?demoWelcome=1", getRequestOrigin(request));
  const response = NextResponse.redirect(destination);

  response.cookies.set(DEMO_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
