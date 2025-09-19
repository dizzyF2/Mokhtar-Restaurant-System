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

type Category = { id: number; name: string };

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
        const result = await invoke<Category[]>("fetch_categories_cmd");
        setCategories(result);
        } catch (e) {
        console.error("فشل في جلب الفئات:", e);
        toast.error("فشل في جلب الفئات");
        }
    };

    const addCategory = async () => {
        if (!newCategory.trim()) {
        toast.error("يرجى إدخال اسم الفئة");
        return;
        }
        try {
        await invoke("add_category_cmd", { name: newCategory.trim() });
        setNewCategory("");
        await fetchCategories();
        toast.success("تمت إضافة الفئة بنجاح");
        } catch (e) {
        console.error("فشل في إضافة الفئة:", e);
        toast.error("فشل في إضافة الفئة");
        }
    };

    const startEdit = (cat: Category) => {
        setEditingId(cat.id);
        setEditingName(cat.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const saveEdit = async () => {
        if (editingId === null) return;
        if (!editingName.trim()) {
        toast.error("يرجى إدخال اسم الفئة");
        return;
        }
        try {
        await invoke("update_category_cmd", { id: editingId, name: editingName.trim() });
        cancelEdit();
        await fetchCategories();
        toast.success("تم تعديل الفئة بنجاح");
        } catch (e) {
        console.error("فشل في تعديل الفئة:", e);
        toast.error("فشل في تعديل الفئة");
        }
    };

    const removeCategory = async (id: number) => {
        try {
        await invoke("delete_category_cmd", { id });
        await fetchCategories();
        toast.success("تم حذف الفئة");
        } catch (e) {
        console.error("فشل في حذف الفئة:", e);
        toast.error("فشل في حذف الفئة");
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto" dir="rtl">
        <Card className="shadow-md border border-gray-200 rounded-xl">
            <CardContent className="p-6 space-y-6">
            <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
                إدارة الفئات
            </CardTitle>

            {/* إضافة فئة */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col md:flex-row gap-3">
                <Input
                    type="text"
                    placeholder="أدخل اسم الفئة"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <Button
                    onClick={addCategory}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                >
                    <PlusCircle size={18} /> إضافة
                </Button>
                </div>
            </div>

            {/* جدول الفئات */}
            <div className="overflow-x-auto">
                <Table className="border border-gray-200 rounded-lg">
                <TableHeader>
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                    <TableHead className="text-right text-gray-700 font-semibold">
                        اسم الفئة
                    </TableHead>
                    <TableHead className="pl-7 text-gray-700 font-semibold pr-10">
                        الإجراءات
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((c) => (
                    <TableRow key={c.id} className="hover:bg-gray-50">
                        <TableCell>
                        {editingId === c.id ? (
                            <Input
                            value={editingName}
                            onChange={(ev) => setEditingName(ev.target.value)}
                            className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <span className="font-medium text-gray-800">{c.name}</span>
                        )}
                        </TableCell>
                        <TableCell className="text-right">
                        {editingId === c.id ? (
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
                                onClick={() => startEdit(c)}
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
                                message={`هل أنت متأكد أنك تريد حذف الفئة "${c.name}"؟`}
                                confirmText="حذف"
                                cancelText="إلغاء"
                                onConfirm={() => removeCategory(c.id)}
                            />
                            </div>
                        )}
                        </TableCell>
                    </TableRow>
                    ))}

                    {categories.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center text-gray-500 p-4">
                        لا توجد فئات.
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
