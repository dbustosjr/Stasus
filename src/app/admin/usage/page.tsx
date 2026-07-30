import { redirect } from "next/navigation";

/** Old path — usage lives under the signed-in app. */
export default function AdminUsageRedirect() {
  redirect("/app/admin/usage");
}
