import { Redirect } from "expo-router";
import { useAuth } from "@/src/context/auth-context";

export default function Index() {
  const { user } = useAuth();
  return <Redirect href={user ? "/(tabs)/tasks" : "/sign-in"} />;
}
