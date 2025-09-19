import { useEffect, useState } from "react";
import { LogOut, Package, Users, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProductsPage from "../components/admin/ProductsPage";
import EmployeesPage from "../components/admin/EmployeesPage";
import Reports from "../components/admin/Reports";
import AdminSettings from "@/components/admin/AdminSettings";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

export default function AdminPanel() {
    const [activePage, setActivePage] = useState<
        "products" | "employees" | "reports" | "settings" | null
    >(null);
    const [adminName, setAdminName] = useState<string>("admin");
    const navigate = useNavigate();

    const menuItems = [
        { key: "products", label: "المنتجات", icon: Package },
        { key: "employees", label: "الموظفين", icon: Users },
        { key: "reports", label: "التقارير", icon: BarChart3 },
        { key: "settings", label: "الإعدادات", icon: Settings },
    ];

    const fetchAdminName = async () => {
        try {
            const name = await invoke<string>("get_admin_name");
            setAdminName(name);
        } catch (error) {
            console.error("Failed to fetch admin name:", error);
        }
    };

    useEffect(() => {
        fetchAdminName();
    }, []);

    useEffect(() => {
        if (activePage === null) {
            fetchAdminName();
        }
    }, [activePage]);

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden" dir="rtl">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col h-full">
                <div
                    className="hover:bg-gray-700/30 flex flex-row-reverse justify-center items-center p-5 font-bold text-lg border-b border-gray-700 cursor-pointer"
                    onClick={() => setActivePage(null)}
                >
                    <img
                        src="/icons/take-away.png"
                        alt="شعار المطعم"
                        className="w-14 h-14 mr-3 rounded-md"
                    />
                    <h1>لوحة التحكم</h1>
                </div>

                <nav className="flex-1 mt-4 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePage === item.key;
                        return (
                            <Button
                                key={item.key}
                                onClick={() => setActivePage(item.key as any)}
                                className={`bg-transparent flex justify-start items-center w-full px-4 py-2 transition-colors ${
                                    isActive ? "bg-blue-600" : "hover:bg-gray-700"
                                }`}
                            >
                                <span>{item.label}</span>
                                <Icon size={18} className="ml-2" />
                            </Button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <Button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 rounded-lg"
                    >
                        <LogOut size={18} />
                        <span>تسجيل الخروج</span>
                    </Button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col h-full">
                {!activePage && (
                    <div className="flex flex-col items-center justify-center flex-1 text-center">
                        <h1 className="text-3xl font-semibold capitalize">
                            مرحبا، {adminName}
                        </h1>
                        <p className="text-lg">اختر خياراً من القائمة للبدء.</p>
                    </div>
                )}

                <ScrollArea className="flex-1 p-6 h-full">
                    {activePage === "products" && <ProductsPage />}
                    {activePage === "employees" && <EmployeesPage />}
                    {activePage === "reports" && <Reports />}
                    {activePage === "settings" && <AdminSettings />}
                </ScrollArea>
            </main>
        </div>
    );
}
