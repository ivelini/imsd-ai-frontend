// Личный кабинет: отдельной главной нет — ведём в профиль (макет account/profile.html)
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/account/profile");
}
