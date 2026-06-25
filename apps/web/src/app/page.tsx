import { AUTH_COOKIE_NAME } from "@life/shared";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HomeDashboard } from "@/components/home-dashboard";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);

  if (!token?.value) {
    redirect("/sign-in");
  }

  return <HomeDashboard />;
}
