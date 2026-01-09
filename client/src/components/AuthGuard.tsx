import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import type { JSX } from "react";

export default function AuthGuard({ children }: { children: JSX.Element }) {
    const currentUser = useSelector((state: RootState) => state.user.currentUser);
    const location = useLocation();

    if (currentUser) {
        return <Navigate to="/admin" replace state={{ from: location }} />;
    }
    return children;
}
