import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
    console.log('before I get the cookies')
	const cookieStore = await cookies();

	return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
        { cookies: {getAll() {
            return cookieStore.getAll()
        },
        setAll(cookies2Set){
            try {
                cookies2Set.forEach(({name, value, options})=>{
                    cookieStore.set(name, value, options)
                })
            } catch (error) {
							// The `setAll` method was called from a Server Component.
							// This can be ignored if you have middleware refreshing
							// user sessions.
                            console.log('Error setting cookies in server component, this can be ignored if you have middleware refreshing sessions: %s', error);
						}
        }} }
    );
};
