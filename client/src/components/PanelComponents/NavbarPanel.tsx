import { X, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const NavbarPanel = ({ title = "QR Code Settings" }) => {
    const navigate = useNavigate();

    return (
        <div className="sticky top-2 z-50 px-4 py-2">
            <nav className="h-14 bg-white/90 backdrop-blur-lg border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl flex items-center px-3">
                <div className="flex w-full items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="rounded-xl h-10 w-10 hover:bg-gray-100"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </Button>

                    <div className="flex-1 text-center">
                        <h1 className="text-lg font-bold tracking-tight">
                            {title}
                        </h1>
                    </div>

                    <div className="w-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/profile")}
                            className="rounded-xl h-10 w-10 hover:bg-gray-100">
                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-blue-500 text-white">
                                    <UserCircle className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </div>
                </div>
            </nav>
        </div>
    );
};
