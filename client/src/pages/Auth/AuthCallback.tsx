import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const allowedTypes = new Set([
    "signup",
    "magiclink",
    "recovery",
    "invite",
    "email_change",
]);

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const run = async () => {
            const type = searchParams.get("type") ?? "";
            const token_hash =
                searchParams.get("token_hash") ?? searchParams.get("token") ?? "";

            if (!allowedTypes.has(type) || !token_hash) {
                navigate("/", { replace: true });
                return;
            }

            const { data, error } = await supabase.auth.verifyOtp({
                token_hash,
                type: type as any,
            });

            if (error || !data.session) {
                navigate("/error", { replace: true });
                return;
            }

            navigate("/admin", { replace: true });
        };

        run();
    }, [searchParams, navigate]);

    return <div>Confirming email...</div>;
}
