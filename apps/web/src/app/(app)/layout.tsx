import { AUTH_COOKIE_NAME } from "@life/shared";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { DEMO_COOKIE_NAME } from "@/demo/mode";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  const demoMode = cookieStore.get(DEMO_COOKIE_NAME)?.value === "1";

  if (!token?.value && !demoMode) {
    redirect("/sign-in");
  }

  return <AppShell>{children}</AppShell>;
}
