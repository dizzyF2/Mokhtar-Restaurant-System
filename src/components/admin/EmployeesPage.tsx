import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Trash2, Check, X, Edit3, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../ConfirmModal";

type Employee = { id: number; name: string; password: string };

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [newEmployee, setNewEmployee] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingPassword, setEditingPassword] = useState("");

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
        const result = await invoke<Employee[]>("fetch_employees");
        setEmployees(result);
        } catch (e) {
        console.error("فشل في جلب الموظفين:", e);
        toast.error("فشل في جلب الموظفين");
        }
    };

    const addEmployee = async () => {
        if (!newEmployee.trim() || !newPassword.trim()) {
        toast.error("يرجى إدخال الاسم وكلمة المرور");
        return;
        }
        try {
        await invoke("add_new_employee", {
            name: newEmployee.trim(),
            password: newPassword.trim(),
        });
        setNewEmployee("");
        setNewPassword("");
        await fetchEmployees();
        toast.success("تمت إضافة الموظف بنجاح");
        } catch (e) {
        console.error("فشل في إضافة موظف جديد:", e);
        toast.error("فشل في إضافة موظف جديد");
        }
    };

    const startEdit = (emp: Employee) => {
        setEditingId(emp.id);
        setEditingName(emp.name);
        setEditingPassword(emp.password);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
        setEditingPassword("");
    };

    const saveEdit = async () => {
        if (editingId === null) return;
        if (!editingName.trim() || !editingPassword.trim()) {
        toast.error("يرجى إدخال الاسم وكلمة المرور");
        return;
        }
        try {
        await invoke("update_employee_cmd", {
            id: editingId,
            name: editingName.trim(),
            password: editingPassword.trim(),
        });
        cancelEdit();
        await fetchEmployees();
        toast.success("تم تعديل بيانات الموظف بنجاح");
        } catch (e) {
        console.error("فشل في تحديث الموظف:", e);
        toast.error("فشل في تحديث الموظف");
        }
    };

    const removeEmployee = async (id: number) => {
        try {
        await invoke("delete_employee_cmd", { id });
        await fetchEmployees();
        toast.success("تم حذف الموظف");
        } catch (e) {
        console.error("فشل في حذف الموظف:", e);
        toast.error("فشل في حذف الموظف");
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto" dir="rtl">
        <Card className="shadow-md border border-gray-200 rounded-xl">
            <CardContent className="p-6 space-y-6">
            <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
                إدارة الموظفين
            </CardTitle>

            {/* إضافة موظف */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col md:flex-row gap-3">
                <Input
                    type="text"
                    placeholder="أدخل اسم الموظف"
                    value={newEmployee}
                    onChange={(e) => setNewEmployee(e.target.value)}
                    className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <Input
                    type="password"
                    placeholder="كلمة المرور"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <Button
                    onClick={addEmployee}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                >
                    <PlusCircle size={18} /> إضافة
                </Button>
                </div>
            </div>

            {/* جدول الموظفين */}
            <div className="overflow-x-auto">
                <Table className="border border-gray-200 rounded-lg">
                <TableHeader>
                    <TableRow className=" bg-gray-100 hover:bg-gray-100">
                        <TableHead className="text-right text-gray-700 font-semibold">
                            الاسم
                        </TableHead>
                        <TableHead className="text-right text-gray-700 font-semibold">
                            كلمة المرور
                        </TableHead>
                        <TableHead className="pl-7 text-gray-700 font-semibold pr-10">
                            الإجراءات
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((e) => (
                    <TableRow key={e.id} className="hover:bg-gray-50">
                        <TableCell>
                        {editingId === e.id ? (
                            <Input
                            value={editingName}
                            onChange={(ev) => setEditingName(ev.target.value)}
                            className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <span className="font-medium text-gray-800">
                            {e.name}
                            </span>
                        )}
                        </TableCell>
                        <TableCell>
                        {editingId === e.id ? (
                            <Input
                            type="password"
                            value={editingPassword}
                            onChange={(ev) =>
                                setEditingPassword(ev.target.value)
                            }
                            className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <span className="font-medium text-gray-600">
                            ••••••
                            </span>
                        )}
                        </TableCell>
                        <TableCell className="text-right">
                        {editingId === e.id ? (
                            <div className="flex justify-end gap-2">
                            <Button
                                size="sm"
                                onClick={saveEdit}
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3 rounded"
                            >
                                <Check size={16} /> حفظ
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                className="flex items-center gap-1 px-3 rounded"
                            >
                                <X size={16} /> إلغاء
                            </Button>
                            </div>
                        ) : (
                            <div className="flex justify-end gap-2">
                            <Button
                                variant="secondary"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded"
                                onClick={() => startEdit(e)}
                            >
                                <Edit3 className="w-4 h-4" />
                            </Button>
                            <ConfirmModal
                                trigger={
                                <Button
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                }
                                message={`هل أنت متأكد أنك تريد حذف الموظف "${e.name}" ؟`}
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
                        <TableCell
                        colSpan={3}
                        className="text-center text-gray-500 p-4"
                        >
                        لا يوجد موظفين.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            </CardContent>
        </Card>
        </div>
    );
}
