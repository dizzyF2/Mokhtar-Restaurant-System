import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Trash2, Check, X, Edit3, PlusCircle, Users } from "lucide-react"
import toast from "react-hot-toast"
import ConfirmModal from "../ConfirmModal"
import { ScrollArea } from "../ui/scroll-area"

type Employee = { id: number; name: string; password: string }

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [newEmployee, setNewEmployee] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingName, setEditingName] = useState("")
    const [editingPassword, setEditingPassword] = useState("")

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
        const result = await invoke<Employee[]>("fetch_employees")
        setEmployees(result)
        } catch (e) {
        console.error("فشل في جلب الموظفين:", e)
        toast.error("فشل في جلب الموظفين")
        }
    }

    const addEmployee = async () => {
        if (!newEmployee.trim() || !newPassword.trim()) {
        toast.error("يرجى إدخال الاسم وكلمة المرور")
        return
        }
        try {
        await invoke("add_new_employee", {
            name: newEmployee.trim(),
            password: newPassword.trim(),
        })
        setNewEmployee("")
        setNewPassword("")
        await fetchEmployees()
        toast.success("تمت إضافة الموظف بنجاح")
        } catch (e) {
        console.error("فشل في إضافة موظف جديد:", e)
        toast.error("فشل في إضافة موظف جديد")
        }
    }

    const startEdit = (emp: Employee) => {
        setEditingId(emp.id)
        setEditingName(emp.name)
        setEditingPassword(emp.password)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditingName("")
        setEditingPassword("")
    }

    const saveEdit = async () => {
        if (editingId === null) return
        if (!editingName.trim() || !editingPassword.trim()) {
        toast.error("يرجى إدخال الاسم وكلمة المرور")
        return
        }
        try {
        await invoke("update_employee_cmd", {
            id: editingId,
            name: editingName.trim(),
            password: editingPassword.trim(),
        })
        cancelEdit()
        await fetchEmployees()
        toast.success("تم تعديل بيانات الموظف بنجاح")
        } catch (e) {
        console.error("فشل في تحديث الموظف:", e)
        toast.error("فشل في تحديث الموظف")
        }
    }

    const removeEmployee = async (id: number) => {
        try {
        await invoke("delete_employee_cmd", { id })
        await fetchEmployees()
        toast.success("تم حذف الموظف")
        } catch (e) {
        console.error("فشل في حذف الموظف:", e)
        toast.error("فشل في حذف الموظف")
        }
    }

    return (
        <div className="p-6 max-w-6xl mx-auto" dir="rtl">
        <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-8 space-y-8">
            <div className="border-b border-gray-100 pb-6">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Users className="text-blue-600" size={32} />
                    إدارة الموظفين
                </CardTitle>
                <p className="text-gray-600 text-lg">إضافة وتعديل وحذف بيانات الموظفين</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <PlusCircle className="text-green-600" size={24} />
                    إضافة موظف جديد
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        type="text"
                        placeholder="اسم الموظف *"
                        value={newEmployee}
                        onChange={(e) => setNewEmployee(e.target.value)}
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                    />
                    <Input
                        type="password"
                        placeholder="كلمة المرور *"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                    />
                </div>
                <div className="flex justify-end mt-6">
                    <Button
                        onClick={addEmployee}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        <PlusCircle size={20} /> إضافة الموظف
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">قائمة الموظفين</h3>
                </div>
                <ScrollArea className="h-96 w-full" dir="rtl">
                <Table>
                    <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-right font-semibold text-gray-700 py-4">الاسم</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700 py-4">كلمة المرور</TableHead>
                        <TableHead className="text-center font-semibold text-gray-700 py-4">الإجراءات</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {employees.map((e) => (
                        <TableRow key={e.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="py-4">
                            {editingId === e.id ? (
                            <Input
                                value={editingName}
                                onChange={(ev) => setEditingName(ev.target.value)}
                                className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                            />
                            ) : (
                            <span className="font-medium text-gray-900">{e.name}</span>
                            )}
                        </TableCell>
                        <TableCell className="py-4">
                            {editingId === e.id ? (
                            <Input
                                type="password"
                                value={editingPassword}
                                onChange={(ev) => setEditingPassword(ev.target.value)}
                                className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                            />
                            ) : (
                            <span className="font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded-md">••••••••</span>
                            )}
                        </TableCell>
                        <TableCell className="text-center py-4">
                            {editingId === e.id ? (
                            <div className="flex justify-center gap-2">
                                <Button
                                size="sm"
                                onClick={saveEdit}
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                <Check size={16} /> حفظ
                                </Button>
                                <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                className="border-gray-300 hover:bg-gray-50 flex items-center gap-1 px-3 py-2 rounded-lg bg-transparent"
                                >
                                <X size={16} /> إلغاء
                                </Button>
                            </div>
                            ) : (
                            <div className="flex justify-center gap-2">
                                <Button
                                size="sm"
                                onClick={() => startEdit(e)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                <Edit3 className="w-4 h-4" />
                                </Button>
                                <ConfirmModal
                                trigger={
                                    <Button
                                    size="sm"
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                    <Trash2 className="w-4 h-4" />
                                    </Button>
                                }
                                message={`هل أنت متأكد أنك تريد حذف الموظف "${e.name}"؟`}
                                confirmText="حذف"
                                cancelText="إلغاء"
                                onConfirm={() => removeEmployee(e.id)}
                                />
                            </div>
                            )}
                        </TableCell>
                        </TableRow>
                    ))}
                    {employees.length === 0 && (
                        <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500 py-12">
                            <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium">لا يوجد موظفين</p>
                            <p className="text-sm text-gray-400">ابدأ بإضافة موظف جديد</p>
                            </div>
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </ScrollArea>
            </div>
            </CardContent>
        </Card>
        </div>
    )
}
