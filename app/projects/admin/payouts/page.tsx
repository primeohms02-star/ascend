import { requireProjectsAdmin } from "@/lib/projects/admin-auth";
import { redirect } from "next/navigation";
import PayoutConsole from "./PayoutConsole";
export default async function PayoutsPage() { try { await requireProjectsAdmin(); } catch { redirect("/dashboard"); } return <PayoutConsole />; }
