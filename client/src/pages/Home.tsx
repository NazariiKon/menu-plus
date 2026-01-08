import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom";


export default function Home() {
    const navigate = useNavigate();

    return (
        <>
            <Button onClick={() => navigate('/registration')}>Sign Up</Button>
            <p>Home Page</p>
        </>
    )
}