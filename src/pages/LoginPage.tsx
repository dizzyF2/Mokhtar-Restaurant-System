import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

interface Employee {
    id: number;
    name: string;
}

export default function LoginPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeId, setEmployeeId] = useState<number | null>(null);
    const [employeePassword, setEmployeePassword] = useState("");
    const [adminName, setAdminName] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        invoke("setup_admin");

        invoke<Employee[]>("fetch_employees")
        .then((data) => setEmployees(data))
        .catch((err) => {
            console.error("failed to fetch employees: ", err);
            toast.error("تعذر تحميل الموظفين");
        });

        invoke<string>("get_admin_name")
        .then((name) => setAdminName(name))
        .catch(() => toast.error("تعذر تحميل بيانات المدير"));
    }, []);

    const handleEmployeeLogin = async () => {
        try {
        if (!employeeId) {
            toast.error("الرجاء اختيار الموظف");
            return;
        }

        const selectedEmployee = employees.find((emp) => emp.id === employeeId);
        if (!selectedEmployee) {
            toast.error("الموظف غير موجود");
            return;
        }

        const employee = await invoke<{ id: number; name: string } | null>(
            "login_employee_cmd",
            {
            name: selectedEmployee.name,
            password: employeePassword,
            }
        );

        if (employee && employee.id) {
            login({
            role: "employee",
            employeeId: employee.id,
            employeeName: employee.name,
            });
            navigate("/pos");
        } else {
            toast.error("بيانات الموظف غير صحيحة");
        }
        } catch (e) {
        console.error("error login: ", e);
        toast.error("حدث خطأ أثناء تسجيل الدخول");
        }
    };

    const handleAdminLogin = async () => {
        try {
        const isValid = await invoke<boolean>("login_admin", {
            name: adminName,
            password: adminPassword,
        });

        if (isValid) {
            login({ role: "admin", employeeId: null, employeeName: null });
            navigate("/admin");
        } else {
            toast.error("بيانات المدير غير صحيحة");
        }
        } catch {
        toast.error("حدث خطأ أثناء تسجيل الدخول");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
        <Tabs defaultValue="employee" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employee">الموظف</TabsTrigger>
            <TabsTrigger value="admin">المدير</TabsTrigger>
            </TabsList>

            {/* Employee Login */}
            <TabsContent value="employee">
            <div className="space-y-4">
                <select
                className="w-full border rounded p-2"
                onChange={(e) => setEmployeeId(Number(e.target.value))}
                >
                <option value="">اختر موظف</option>
                {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                    {emp.name}
                    </option>
                ))}
                </select>

                <Input
                type="password"
                placeholder="كلمة المرور"
                value={employeePassword}
                onChange={(e) => setEmployeePassword(e.target.value)}
                />

                <Button className="w-full" onClick={handleEmployeeLogin}>
                تسجيل الدخول
                </Button>
            </div>
            </TabsContent>

            {/* Admin Login */}
            <TabsContent value="admin">
            <div className="space-y-4">
                <Input type="text" value={adminName} disabled />

                <Input
                type="password"
                placeholder="كلمة المرور"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                />

                <Button className="w-full" onClick={handleAdminLogin}>
                تسجيل الدخول كمدير
                </Button>
            </div>
            </TabsContent>
        </Tabs>
        </div>
    );
}
