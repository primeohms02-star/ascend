import { requireProjectsAdmin } from "@/lib/projects/admin-auth";
import { redirect } from "next/navigation";
import ProjectsAdminConsole from "./ProjectsAdminConsole";
export default async function ProjectsAdminPage(){try{await requireProjectsAdmin()}catch{redirect("/dashboard")}return <ProjectsAdminConsole/>}
