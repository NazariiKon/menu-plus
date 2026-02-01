import QRCode from './QRCode';

export default function MenuPanel() {
    return (
        <div className="min-h-dvh max-w-md mx-auto w-full max-w-[500px] bg-background text-foreground">
            <QRCode />
        </div>
    );
};