import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
	const cookieStore = await cookies();

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string, options: any) {
					cookieStore.set({ name, value, ...options });
				},
				remove(name: string, options: any) {
					cookieStore.set({ name, value: "", ...options });
				},
			},
		}
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return NextResponse.json({ connected: false });

	const { data } = await supabase
		.from("integrations")
		.select("id")
		.eq("user_id", user.id)
		.eq("provider", "stripe")
		.maybeSingle();

	return NextResponse.json({ connected: !!data });
}
