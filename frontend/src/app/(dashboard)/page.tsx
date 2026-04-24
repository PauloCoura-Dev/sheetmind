import { redirect } from "next/navigation";

// Rota / não usada — página principal está em /app
export default function DashboardRoot() {
  redirect("/app");
}
