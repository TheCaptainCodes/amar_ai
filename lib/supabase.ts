import {createClient} from "@supabase/supabase-js";
import {auth} from "@clerk/nextjs/server";

export const createSupabaseClient = async () => {
    try {
        const { getToken } = await auth();
        const token = await getToken();
        
        // Log the token for debugging (remove in production)
        console.log('Clerk JWT Token:', token ? token.substring(0, 50) + '...' : 'No token');
        
        // Create client with or without token
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                },
                global: {
                    headers: token ? {
                        Authorization: `Bearer ${token}`
                    } : {}
                }
            }
        )
    } catch (error) {
        console.error('Error creating Supabase client:', error);
        // Return a client without authentication if token retrieval fails
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }
        )
    }
}