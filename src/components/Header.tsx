import LogoutButton from "./LogoutButton";

export default function Header() {
    return (
        <header className="flex justify-between items-center bg-gray-50 shadow px-6 py-3">
            <div className="flex items-center space-x-3">
                <img
                    src="/icons/take-away.png"
                    alt="Mokhtar restaurant"
                    className="w-10 h-10 rounded-full"
                />
                <h1 className="text-xl font-bold text-yellow-400 capitalize">مطعم مختار</h1>
            </div>
            <LogoutButton rotate="left"/>
        </header>
    );
}