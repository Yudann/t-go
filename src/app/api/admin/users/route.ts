import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User authenticated:", user.email);

    // Untuk sementara, bypass admin check
    console.log("Bypassing admin check for development");

    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Profiles error:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} profiles`);

    // Untuk development, kita akan menggunakan approach yang lebih sederhana
    // tanpa admin API dulu
    const usersWithDetails = profiles?.map((profile) => ({
      ...profile,
      email: user.email, // Sementara pakai email dari user yang login
      last_sign_in_at: null, // Sementara null dulu
      ticket_count: 0, // Sementara 0 dulu
    })) || [];

    console.log("Successfully processed user data");

    return NextResponse.json({ 
      success: true,
      users: usersWithDetails 
    });
    
  } catch (error: any) {
    console.error("Error in admin users API:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}