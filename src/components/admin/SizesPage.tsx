import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Check, X, Edit3, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../ConfirmModal";

type Size = { id: number; name: string };

export default function SizesPage() {
    const [sizes, setSizes] = useState<Size[]>([]);
    const [newSize, setNewSize] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");

    useEffect(() => {
        fetchSizes();
    }, []);

    const fetchSizes = async () => {
        try {
        const result: Size[] = await invoke("fetch_sizes_cmd");
        setSizes(result);
        } catch (e) {
        console.error(e);
        toast.error("فشل في جلب الأحجام");
        }
    };

    const addSize = async () => {
        if (!newSize.trim()) return toast.error("ادخل اسم الحجم");
        try {
        await invoke("add_size_cmd", { name: newSize.trim() });
        setNewSize("");
        await fetchSizes();
        toast.success("تمت إضافة الحجم");
        } catch (e) {
        console.error(e);
        toast.error("فشل في إضافة الحجم");
        }
    };

    const startEdit = (s: Size) => {
        setEditingId(s.id);
        setEditingName(s.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const saveEdit = async () => {
        if (!editingName.trim()) return toast.error("ادخل اسم الحجم");
        try {
        await invoke("update_size_cmd", { id: editingId, name: editingName.trim() });
        cancelEdit();
        await fetchSizes();
        toast.success("تم تعديل الحجم");
        } catch (e) {
        console.error(e);
        toast.error("فشل في تعديل الحجم");
        }
    };

    const removeSize = async (id: number) => {
        try {
        await invoke("delete_size_cmd", { id });
        await fetchSizes();
        toast.success("تم حذف الحجم");
        } catch (e) {
        console.error(e);
        toast.error("فشل في حذف الحجم");
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto" dir="rtl">
        <Card>
            <CardContent className="space-y-4">
            <CardTitle>إدارة الأحجام</CardTitle>

            <div className="flex gap-2">
                <Input value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="اسم الحجم" />
                <Button onClick={addSize} className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusCircle size={16} /> إضافة
                </Button>
            </div>

            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="text-right">اسم الحجم</TableHead>
                    <TableHead className="text-right pr-5">الإجراءات</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {sizes.map((s) => (
                    <TableRow key={s.id}>
                        <TableCell>
                            {editingId === s.id ? (
                            <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                            ) : (
                            s.name
                            )}
                        </TableCell>
                        <TableCell className="flex gap-2">
                            {editingId === s.id ? (
                            <>
                                <Button onClick={saveEdit} className="bg-green-600 hover:bg-green-700 text-white px-2 rounded flex items-center gap-1">
                                <Check size={14} /> حفظ
                                </Button>
                                <Button onClick={cancelEdit} className="bg-gray-200 px-2 rounded flex items-center gap-1">
                                <X size={14} /> إلغاء
                                </Button>
                            </>
                            ) : (
                            <>
                                <Button onClick={() => startEdit(s)} className="bg-blue-600 hover:bg-blue-700 text-white px-2 rounded flex items-center gap-1">
                                <Edit3 size={14} />
                                </Button>
                                <ConfirmModal
                                trigger={
                                    <Button className="bg-red-600 hover:bg-red-700 text-white px-2 rounded flex items-center gap-1">
                                    <Trash2 size={14} />
                                    </Button>
                                }
                                message={`هل أنت متأكد من حذف الحجم "${s.name}"؟`}
                                confirmText="حذف"
                                cancelText="إلغاء"
                                onConfirm={() => removeSize(s.id)}
                                />
                            </>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
        </div>
    );
}
