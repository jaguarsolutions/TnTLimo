import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, isAdminSessionValue } from "@/lib/admin/auth";

export default async function AdminIndex() {
  const authCookie = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isAdminSessionValue(authCookie))) {
    redirect("/admin/login");
  }

  redirect("/admin/bookings");
}
