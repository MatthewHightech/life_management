import { NextResponse } from "next/server";
import { DEMO_COOKIE_NAME, getRequestOrigin } from "@/demo/mode";

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/sign-in", getRequestOrigin(request)));
  response.cookies.set(DEMO_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
