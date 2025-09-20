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
import { ScrollArea } from "../ui/scroll-area";

type Client = {
    id: number;
    name: string;
    phone: string;
    phone2?: string | null;
    address?: string | null;
};

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newPhone2, setNewPhone2] = useState("");
    const [newAddress, setNewAddress] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingPhone, setEditingPhone] = useState("");
    const [editingPhone2, setEditingPhone2] = useState("");
    const [editingAddress, setEditingAddress] = useState("");

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
        const result = await invoke<Client[]>("fetch_clients");
        setClients(result);
        } catch (e) {
        console.error("فشل في جلب العملاء:", e);
        toast.error("فشل في جلب العملاء");
        }
    };

    const addClient = async () => {
        if (!newName.trim() || !newPhone.trim()) {
        toast.error("يرجى إدخال الاسم ورقم الهاتف");
        return;
        }
        try {
        await invoke("add_new_client", {
            name: newName.trim(),
            phone: newPhone.trim(),
            phone2: newPhone2.trim() || null,
            address: newAddress.trim() || null,
        });
        setNewName("");
        setNewPhone("");
        setNewPhone2("");
        setNewAddress("");
        await fetchClients();
        toast.success("تمت إضافة العميل بنجاح");
        } catch (e) {
        console.error("فشل في إضافة العميل:", e);
        toast.error("فشل في إضافة العميل");
        }
    };

    const startEdit = (c: Client) => {
        setEditingId(c.id);
        setEditingName(c.name);
        setEditingPhone(c.phone);
        setEditingPhone2(c.phone2 || "");
        setEditingAddress(c.address || "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
        setEditingPhone("");
        setEditingPhone2("");
        setEditingAddress("");
    };

    const saveEdit = async () => {
        if (editingId === null) return;
        if (!editingName.trim() || !editingPhone.trim()) {
        toast.error("يرجى إدخال الاسم ورقم الهاتف");
        return;
        }
        try {
        await invoke("update_client_cmd", {
            id: editingId,
            name: editingName.trim(),
            phone: editingPhone.trim(),
            phone2: editingPhone2.trim() || null,
            address: editingAddress.trim() || null,
        });
        cancelEdit();
        await fetchClients();
        toast.success("تم تعديل بيانات العميل بنجاح");
        } catch (e) {
        console.error("فشل في تعديل العميل:", e);
        toast.error("فشل في تعديل العميل");
        }
    };

    const removeClient = async (id: number) => {
        try {
        await invoke("delete_client_cmd", { id });
        await fetchClients();
        toast.success("تم حذف العميل");
        } catch (e) {
        console.error("فشل في حذف العميل:", e);
        toast.error("فشل في حذف العميل");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto" dir="rtl">
        <Card className="shadow-md border border-gray-200 rounded-xl">
            <CardContent className="p-6 space-y-6">
            <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
                إدارة العملاء
            </CardTitle>

            {/* إضافة عميل */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                    type="text"
                    placeholder="اسم العميل"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <Input
                    type="text"
                    placeholder="رقم الهاتف"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                />
                <Input
                    type="text"
                    placeholder="رقم هاتف إضافي (اختياري)"
                    value={newPhone2}
                    onChange={(e) => setNewPhone2(e.target.value)}
                />
                <Input
                    type="text"
                    placeholder="العنوان (اختياري)"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                />
                </div>
                <div className="flex justify-end mt-3">
                <Button
                    onClick={addClient}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                >
                    <PlusCircle size={18} /> إضافة
                </Button>
                </div>
            </div>

            {/* جدول العملاء */}
            <ScrollArea className="h-80 w-full rounded-md border border-gray-200" dir="rtl">
                <Table className="border border-gray-200 rounded-lg">
                <TableHeader>
                    <TableRow className="bg-gray-100">
                    <TableHead className="text-right font-semibold text-gray-700">
                        الاسم
                    </TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">
                        الهاتف
                    </TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">
                        الهاتف ٢
                    </TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">
                        العنوان
                    </TableHead>
                    <TableHead className="pl-7 font-semibold text-gray-700 pr-10">
                        الإجراءات
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((c) => (
                    <TableRow key={c.id} className="hover:bg-gray-50">
                        <TableCell>
                        {editingId === c.id ? (
                            <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            />
                        ) : (
                            <span className="font-medium text-gray-800">
                            {c.name}
                            </span>
                        )}
                        </TableCell>
                        <TableCell>
                        {editingId === c.id ? (
                            <Input
                            value={editingPhone}
                            onChange={(e) => setEditingPhone(e.target.value)}
                            />
                        ) : (
                            <span>{c.phone}</span>
                        )}
                        </TableCell>
                        <TableCell>
                        {editingId === c.id ? (
                            <Input
                            value={editingPhone2}
                            onChange={(e) => setEditingPhone2(e.target.value)}
                            />
                        ) : (
                            <span>{c.phone2 || "-"}</span>
                        )}
                        </TableCell>
                        <TableCell>
                        {editingId === c.id ? (
                            <Input
                            value={editingAddress}
                            onChange={(e) => setEditingAddress(e.target.value)}
                            />
                        ) : (
                            <span>{c.address || "-"}</span>
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
                                message={`هل أنت متأكد أنك تريد حذف العميل "${c.name}" ؟`}
                                confirmText="حذف"
                                cancelText="إلغاء"
                                onConfirm={() => removeClient(c.id)}
                            />
                            </div>
                        )}
                        </TableCell>
                    </TableRow>
                    ))}
                    {clients.length === 0 && (
                    <TableRow>
                        <TableCell
                        colSpan={5}
                        className="text-center text-gray-500 p-4"
                        >
                        لا يوجد عملاء.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </ScrollArea>
            </CardContent>
        </Card>
        </div>
    );
}
