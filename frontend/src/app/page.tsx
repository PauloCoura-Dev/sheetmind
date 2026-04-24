import { redirect } from "next/navigation";

// Redireciona para a página principal da aplicação
export default function Root() {
  redirect("/app");
}
