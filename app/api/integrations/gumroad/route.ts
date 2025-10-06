import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Define a type for the payload you expect (replace with your real shape)
interface GumroadPayload {
	productId: string;
	quantity: number;
	userId?: string;
}

export async function POST(req: Request) {
	// Parse the JSON body (unknown is safer than any)
	const body = (await req.json()) as unknown;

	// Validate or narrow type
	if (
		typeof body !== "object" ||
		body === null ||
		!("productId" in body) ||
		!("quantity" in body)
	) {
		return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
	}

	const payload = body as GumroadPayload;

	// Create supabase client
	const cookieStore = await cookies();
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string, opts: any) {
					cookieStore.set({ name, value, ...opts });
				},
				remove(name: string, opts: any) {
					cookieStore.set({ name, value: "", ...opts });
				},
			},
		}
	);

	// (Optional) check user
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
	}

	// Example: Save an order or log in a “purchases” table
	await supabase.from("purchases").insert({
		user_id: user.id,
		product_id: payload.productId,
		quantity: payload.quantity,
		purchased_at: new Date().toISOString(),
	});

	return NextResponse.json({ success: true });
}
