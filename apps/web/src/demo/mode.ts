export const DEMO_COOKIE_NAME = "demo_mode";

export const DEMO_UNAVAILABLE_MESSAGE =
  "Bank connections are not available in the demo.";

export function getRequestOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.replace(":", "");

  return host ? `${protocol}://${host}` : requestUrl.origin;
}
