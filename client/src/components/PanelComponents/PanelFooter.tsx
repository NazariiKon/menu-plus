import { Pencil, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";

const Footer = () => {
    const navigate = useNavigate();
    const { slug } = useParams();

    return (
        <footer className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-sm">
            <div className="grid h-full max-w-md grid-cols-2 mx-auto">
                <Button
                    variant="ghost"
                    className="flex flex-col items-center justify-center h-full rounded-none gap-1 hover:bg-gray-50 group"
                    onClick={() => navigate(`/p/${slug}`)}
                >
                    <Pencil className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                    <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                        Edit Menu
                    </span>
                </Button>

                <Button
                    variant="ghost"
                    className="flex flex-col items-center justify-center h-full rounded-none gap-1 border-l border-gray-100 hover:bg-gray-50 group"
                    onClick={() => navigate(`/panel/${slug}/qr-code`)}
                >
                    <QrCode className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                    <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                        QR Code
                    </span>
                </Button>
            </div>
        </footer>
    );
};

export default Footer;
