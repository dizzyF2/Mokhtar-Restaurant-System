import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";



export default function LogoutButton({rotate}: {rotate: "left" | "right"}) {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <Button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
        >
            <LogOut size={18} className={`${rotate === "left" ? "rotate-180" : ""}`}/>
        </Button>
    );
}