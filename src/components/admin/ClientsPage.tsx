import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Trash2, Check, X, Edit3, PlusCircle, Contact } from "lucide-react"
import toast from "react-hot-toast"
import ConfirmModal from "../ConfirmModal"
import { ScrollArea } from "../ui/scroll-area"

type Client = {
    id: number
    name: string
    phone: string
    phone2?: string | null
    address?: string | null
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [newName, setNewName] = useState("")
    const [newPhone, setNewPhone] = useState("")
    const [newPhone2, setNewPhone2] = useState("")
    const [newAddress, setNewAddress] = useState("")

    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingName, setEditingName] = useState("")
    const [editingPhone, setEditingPhone] = useState("")
    const [editingPhone2, setEditingPhone2] = useState("")
    const [editingAddress, setEditingAddress] = useState("")

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
        const result = await invoke<Client[]>("fetch_clients")
        setClients(result)
        } catch (e) {
        console.error("فشل في جلب العملاء:", e)
        toast.error("فشل في جلب العملاء")
        }
    }

    const addClient = async () => {
        if (!newName.trim() || !newPhone.trim()) {
        toast.error("يرجى إدخال الاسم ورقم الهاتف")
        return
        }
        try {
        await invoke("add_new_client", {
            name: newName.trim(),
            phone: newPhone.trim(),
            phone2: newPhone2.trim() || null,
            address: newAddress.trim() || null,
        })
        setNewName("")
        setNewPhone("")
        setNewPhone2("")
        setNewAddress("")
        await fetchClients()
        toast.success("تمت إضافة العميل بنجاح")
        } catch (e) {
        console.error("فشل في إضافة العميل:", e)
        toast.error("فشل في إضافة العميل")
        }
    }

    const startEdit = (c: Client) => {
        setEditingId(c.id)
        setEditingName(c.name)
        setEditingPhone(c.phone)
        setEditingPhone2(c.phone2 || "")
        setEditingAddress(c.address || "")
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditingName("")
        setEditingPhone("")
        setEditingPhone2("")
        setEditingAddress("")
    }

    const saveEdit = async () => {
        if (editingId === null) return
        if (!editingName.trim() || !editingPhone.trim()) {
        toast.error("يرجى إدخال الاسم ورقم الهاتف")
        return
        }
        try {
        await invoke("update_client_cmd", {
            id: editingId,
            name: editingName.trim(),
            phone: editingPhone.trim(),
            phone2: editingPhone2.trim() || null,
            address: editingAddress.trim() || null,
        })
        cancelEdit()
        await fetchClients()
        toast.success("تم تعديل بيانات العميل بنجاح")
        } catch (e) {
        console.error("فشل في تعديل العميل:", e)
        toast.error("فشل في تعديل العميل")
        }
    }

    const removeClient = async (id: number) => {
        try {
        await invoke("delete_client_cmd", { id })
        await fetchClients()
        toast.success("تم حذف العميل")
        } catch (e) {
        console.error("فشل في حذف العميل:", e)
        toast.error("فشل في حذف العميل")
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto" dir="rtl">
        <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-8 space-y-8">
            <div className="border-b border-gray-100 pb-6">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Contact className="text-blue-600" size={32}/>
                    إدارة العملاء
                </CardTitle>
                <p className="text-gray-600 text-lg">إضافة وتعديل وحذف بيانات العملاء</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PlusCircle className="text-green-600" size={24} />
                إضافة عميل جديد
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                    type="text"
                    placeholder="اسم العميل *"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
                <Input
                    type="text"
                    placeholder="رقم الهاتف *"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
                <Input
                    type="text"
                    placeholder="رقم هاتف إضافي"
                    value={newPhone2}
                    onChange={(e) => setNewPhone2(e.target.value)}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
                <Input
                    type="text"
                    placeholder="العنوان"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
                </div>
                <div className="flex justify-end mt-6">
                <Button
                    onClick={addClient}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                    <PlusCircle size={20} /> إضافة العميل
                </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">قائمة العملاء</h3>
                </div>
                <ScrollArea className="h-96 w-full" dir="rtl">
                <Table>
                    <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-right font-semibold text-gray-700 py-4">الاسم</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700 py-4">الهاتف</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700 py-4">الهاتف الإضافي</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700 py-4">العنوان</TableHead>
                        <TableHead className="text-center font-semibold text-gray-700 py-4">الإجراءات</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {clients.map((c) => (
                        <TableRow key={c.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="py-4">
                            {editingId === c.id ? (
                            <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                            ) : (
                            <span className="font-medium text-gray-900">{c.name}</span>
                            )}
                        </TableCell>
                        <TableCell className="py-4">
                            {editingId === c.id ? (
                            <Input
                                value={editingPhone}
                                onChange={(e) => setEditingPhone(e.target.value)}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                            ) : (
                            <span className="text-gray-700">{c.phone}</span>
                            )}
                        </TableCell>
                        <TableCell className="py-4">
                            {editingId === c.id ? (
                            <Input
                                value={editingPhone2}
                                onChange={(e) => setEditingPhone2(e.target.value)}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                            ) : (
                            <span className="text-gray-700">{c.phone2 || "—"}</span>
                            )}
                        </TableCell>
                        <TableCell className="py-4">
                            {editingId === c.id ? (
                            <Input
                                value={editingAddress}
                                onChange={(e) => setEditingAddress(e.target.value)}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                            ) : (
                            <span className="text-gray-700">{c.address || "—"}</span>
                            )}
                        </TableCell>
                        <TableCell className="text-center py-4">
                            {editingId === c.id ? (
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
                                onClick={() => startEdit(c)}
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
                                message={`هل أنت متأكد أنك تريد حذف العميل "${c.name}"؟`}
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
                        <TableCell colSpan={5} className="text-center text-gray-500 py-12">
                            <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                <PlusCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium">لا يوجد عملاء</p>
                            <p className="text-sm text-gray-400">ابدأ بإضافة عميل جديد</p>
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
