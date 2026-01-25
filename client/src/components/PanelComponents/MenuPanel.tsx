import QRCode from './QRCode';
import { NavbarPanel } from './NavbarPanel';
import PanelFooter from './PanelFooter';

export default function MenuPanel() {
    return (
        <div className="min-h-dvh max-w-md mx-auto w-full max-w-[500px] bg-background text-foreground">
            <NavbarPanel></NavbarPanel>
            <div className="">
                <QRCode />
            </div>
            <PanelFooter></PanelFooter>
        </div>
    );
};