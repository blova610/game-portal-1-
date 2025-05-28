import { supabaseServer } from "./supabase"

export async function getCurrentUser() {
  try {
    const supabase = supabaseServer

    if (!supabase) {
      return null
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return null
    }

    const { data: user, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.error("Error getting user:", error)
      return null
    }

    return user.user
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}
