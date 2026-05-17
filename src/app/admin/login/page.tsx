import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/booking/AdminLoginForm";
import { getTenant } from "@/lib/tenant";
import { ADMIN_SESSION_COOKIE, isAdminSessionValue } from "@/lib/admin/auth";

const tenant = getTenant();

export const metadata = {
  title: `Operator login · ${tenant.shortName}`,
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLoginPage() {
  const authCookie = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (await isAdminSessionValue(authCookie)) {
    redirect("/admin/bookings");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-12 sm:px-8">
        <div className="rounded-4xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
              Operator login
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              {tenant.name} admin access
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600">
              Sign in with your admin credentials to manage bookings and send customer emails.
            </p>
          </div>
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
