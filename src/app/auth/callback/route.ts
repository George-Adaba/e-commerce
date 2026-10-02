import { createServerClient } from "@/lib/supabase";
import { createServiceClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/shop";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    const errorMessage = errorDescription || "Authentication failed";
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorMessage)}`
    );
  }

  if (code) {
    const supabase = await createServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const serviceClient = createServiceClient();
        const { data: existingProfile } = await serviceClient
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingProfile) {
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
          const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || "";

          const profileData = {
            id: user.id,
            email: user.email!,
            full_name: fullName,
            avatar_url: avatarUrl,
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (serviceClient.from("profiles").insert as any)([profileData]);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Invalid authentication code")}`);
}