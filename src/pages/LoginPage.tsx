import { useState, useEffect } from "react"
import { invoke } from "@tauri-apps/api/core"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Shield, Building2, Lock } from "lucide-react"

interface Employee {
    id: number
    name: string
}

export default function LoginPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [employeeId, setEmployeeId] = useState<number | null>(null)
    const [employeePassword, setEmployeePassword] = useState("")
    const [adminName, setAdminName] = useState("")
    const [adminPassword, setAdminPassword] = useState("")
    const { login } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        invoke("setup_admin")

        invoke<Employee[]>("fetch_employees")
        .then((data) => setEmployees(data))
        .catch((err) => {
            console.error("failed to fetch employees: ", err)
            toast.error("تعذر تحميل الموظفين")
        })

        invoke<string>("get_admin_name")
        .then((name) => setAdminName(name))
        .catch(() => toast.error("تعذر تحميل بيانات المدير"))
    }, [])

    const handleEmployeeLogin = async () => {
        try {
        if (!employeeId) {
            toast.error("الرجاء اختيار الموظف")
            return
        }

        const selectedEmployee = employees.find((emp) => emp.id === employeeId)
        if (!selectedEmployee) {
            toast.error("الموظف غير موجود")
            return
        }

        const employee = await invoke<{ id: number; name: string } | null>("login_employee_cmd", {
            name: selectedEmployee.name,
            password: employeePassword,
        })

        if (employee && employee.id) {
            login({
            role: "employee",
            employeeId: employee.id,
            employeeName: employee.name,
            })
            navigate("/pos")
        } else {
            toast.error("بيانات الموظف غير صحيحة")
        }
        } catch (e) {
        console.error("error login: ", e)
        toast.error("حدث خطأ أثناء تسجيل الدخول")
        }
    }

    const handleAdminLogin = async () => {
        try {
        const isValid = await invoke<boolean>("login_admin", {
            name: adminName,
            password: adminPassword,
        })

        if (isValid) {
            login({ role: "admin", employeeId: null, employeeName: null })
            navigate("/admin")
        } else {
            toast.error("بيانات المدير غير صحيحة")
        }
        } catch {
        toast.error("حدث خطأ أثناء تسجيل الدخول")
        }
    }

    return (
        <div className="min-h-screen login-gradient flex items-center justify-center p-4" dir="rtl">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5"></div>

        <div className="relative w-full max-w-md">
            <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
                <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">مطعم مختار</h1>
            <p className="text-muted-foreground">مرحباً بك، يرجى تسجيل الدخول للمتابعة</p>
            </div>

            <div className="glass-card rounded-2xl p-8 shadow-2xl">
            <Tabs defaultValue="employee" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1 rounded-xl">
                <TabsTrigger
                    value="employee"
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                    <User className="w-4 h-4" />
                    الموظف
                </TabsTrigger>
                <TabsTrigger
                    value="admin"
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                    <Shield className="w-4 h-4" />
                    المدير
                </TabsTrigger>
                </TabsList>


                <TabsContent value="employee" className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">اختر الموظف</label>
                    <select
                        className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        onChange={(e) => setEmployeeId(Number(e.target.value))}
                    >
                        <option value="">اختر موظف</option>
                        {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                            {emp.name}
                        </option>
                        ))}
                    </select>
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">كلمة المرور</label>
                    <div className="relative">
                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                        type="password"
                        placeholder="أدخل كلمة المرور"
                        value={employeePassword}
                        onChange={(e) => setEmployeePassword(e.target.value)}
                        className="pr-12 h-12 bg-input border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    </div>

                    <Button
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={handleEmployeeLogin}
                    >
                    تسجيل الدخول
                    </Button>
                </div>
                </TabsContent>


                <TabsContent value="admin" className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">اسم المدير</label>
                    <Input
                        type="text"
                        value={adminName}
                        disabled
                        className="h-12 bg-muted border-border rounded-xl text-muted-foreground"
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">كلمة المرور</label>
                    <div className="relative">
                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                        type="password"
                        placeholder="أدخل كلمة مرور المدير"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="pr-12 h-12 bg-input border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    </div>

                    <Button
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={handleAdminLogin}
                    >
                    <Shield className="w-4 h-4 ml-2" />
                    تسجيل الدخول كمدير
                    </Button>
                </div>
                </TabsContent>
            </Tabs>
            </div>

            <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">جميع الحقوق محفوظة © 2025</p>
            </div>
        </div>
        </div>
    )
}
