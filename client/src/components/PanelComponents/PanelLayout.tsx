import { NavbarPanel } from './NavbarPanel';
import PanelFooter from './PanelFooter';
import { Outlet } from 'react-router-dom';

export default function PanelLayout() {
    return (
        <div className="min-h-dvh max-w-md mx-auto w-full max-w-[500px] bg-background text-foreground">
            <NavbarPanel></NavbarPanel>
            <div className="">
                <Outlet>

                </Outlet>
            </div>
            <PanelFooter></PanelFooter>
        </div>
    );
};