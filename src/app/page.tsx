import { redirect } from "next/navigation";
import { readSession, userCount } from "@/lib/auth";

export default async function HomePage() {
  if ((await userCount()) === 0) {
    redirect("/setup");
  }
  if (await readSession()) {
    redirect("/dashboard");
  }
  redirect("/login");
}
