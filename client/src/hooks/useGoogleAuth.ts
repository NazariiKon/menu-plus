import { supabase } from "@/lib/supabase";
import { useState } from "react";

export const useGoogleAuth = () => {
    const [googleLoading, setGoogleLoading] = useState(false);

    const signUpWithGoogle = async () => {
        setGoogleLoading(true);
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
        } catch (error) {

        } finally {
            setGoogleLoading(false);
        }
    };

    return { googleLoading, signUpWithGoogle };
};
