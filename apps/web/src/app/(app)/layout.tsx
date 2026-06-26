import { AUTH_COOKIE_NAME } from "@life/shared";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);

  if (!token?.value) {
    redirect("/sign-in");
  }

  return <AppShell>{children}</AppShell>;
}
