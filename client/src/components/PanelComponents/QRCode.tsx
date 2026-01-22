import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";

const QRCodePage = () => {
    const qrRef = useRef<HTMLDivElement>(null);
    const { slug } = useParams();

    const handleDownload = () => {
        const canvas = qrRef.current?.querySelector("canvas");
        if (canvas) {
            const url = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = url;
            link.download = `qrcode-${slug}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const qrUrl = `${window.location.origin}/p/${slug}`;

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100dvh-128px)] bg-white p-4 overflow-hidden">
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div ref={qrRef} className="p-6 bg-white border-2 border-gray-100 rounded-3xl shadow-xl">
                    <QRCodeCanvas
                        value={qrUrl}
                        size={220}
                        level="H"
                        includeMargin={false}
                    />
                </div>

                <div className="text-center mt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-6">
                        Scan to view menu
                    </p>

                    <Button
                        onClick={handleDownload}
                        size="lg"
                        className="rounded-full px-8 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                        <Download className="w-5 h-5" />
                        Download PNG
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default QRCodePage;
