import { redirect } from "next/navigation";
import { readSession, userCount } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage() {
  let count = 0;
  try {
    count = await userCount();
  } catch {
    redirect("/setup");
  }

  if (count === 0) {
    redirect("/setup");
  }
  if (await readSession()) {
    redirect("/dashboard");
  }
  redirect("/login");
}
