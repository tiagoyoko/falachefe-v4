import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function getSession() {
  const supabase = await createClient();

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error in getSession:", error);
    return null;
  }
}

export async function getUser() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error in getUser:", error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const supabase = await createClient();

  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = profile?.role || "user";
    if (userRole !== "admin" && userRole !== "super_admin") {
      redirect("/dashboard");
    }

    return user;
  } catch (error) {
    console.error("Error checking admin role:", error);
    redirect("/dashboard");
  }
}
