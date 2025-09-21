import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Check, X, Edit3, PlusCircle, Ruler } from "lucide-react"
import toast from "react-hot-toast"
import ConfirmModal from "../ConfirmModal"
import { ScrollArea } from "../ui/scroll-area"

type Size = { id: number; name: string }

export default function SizesPage() {
    const [sizes, setSizes] = useState<Size[]>([])
    const [newSize, setNewSize] = useState("")
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingName, setEditingName] = useState("")

    useEffect(() => {
        fetchSizes()
    }, [])

    const fetchSizes = async () => {
        try {
        const result: Size[] = await invoke("fetch_sizes_cmd")
        setSizes(result)
        } catch (e) {
        console.error(e)
        toast.error("فشل في جلب الأحجام")
        }
    }

    const addSize = async () => {
        if (!newSize.trim()) return toast.error("ادخل اسم الحجم")
        try {
        await invoke("add_size_cmd", { name: newSize.trim() })
        setNewSize("")
        await fetchSizes()
        toast.success("تمت إضافة الحجم")
        } catch (e) {
        console.error(e)
        toast.error("فشل في إضافة الحجم")
        }
    }

    const startEdit = (s: Size) => {
        setEditingId(s.id)
        setEditingName(s.name)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditingName("")
    }

    const saveEdit = async () => {
        if (!editingName.trim()) return toast.error("ادخل اسم الحجم")
        try {
        await invoke("update_size_cmd", { id: editingId, name: editingName.trim() })
        cancelEdit()
        await fetchSizes()
        toast.success("تم تعديل الحجم")
        } catch (e) {
        console.error(e)
        toast.error("فشل في تعديل الحجم")
        }
    }

    const removeSize = async (id: number) => {
        try {
        await invoke("delete_size_cmd", { id })
        await fetchSizes()
        toast.success("تم حذف الحجم")
        } catch (e) {
        console.error(e)
        toast.error("فشل في حذف الحجم")
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto" dir="rtl">
        <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-8 space-y-8">
            <div className="border-b border-gray-100 pb-6">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Ruler className="text-blue-600" size={32} />
                إدارة الأحجام
                </CardTitle>
                <p className="text-gray-600 text-lg">إضافة وتعديل وحذف أحجام المنتجات</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PlusCircle className="text-green-600" size={24} />
                إضافة حجم جديد
                </h3>
                <div className="flex gap-4">
                <Input
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="اسم الحجم *"
                    className="flex-1 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
                <Button
                    onClick={addSize}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                    <PlusCircle size={20} /> إضافة
                </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">قائمة الأحجام</h3>
                </div>
                <ScrollArea className="h-80 w-full" dir="rtl">
                <Table>
                    <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-right font-semibold text-gray-700 py-4">اسم الحجم</TableHead>
                        <TableHead className="text-center font-semibold text-gray-700 py-4">الإجراءات</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {sizes.map((s) => (
                        <TableRow key={s.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="py-4">
                            {editingId === s.id ? (
                            <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                            />
                            ) : (
                            <span className="font-medium text-gray-900 bg-purple-50 px-3 py-2 rounded-lg inline-block">
                                {s.name}
                            </span>
                            )}
                        </TableCell>
                        <TableCell className="text-center py-4">
                            {editingId === s.id ? (
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
                                onClick={() => startEdit(s)}
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
                                message={`هل أنت متأكد من حذف الحجم "${s.name}"؟`}
                                confirmText="حذف"
                                cancelText="إلغاء"
                                onConfirm={() => removeSize(s.id)}
                                />
                            </div>
                            )}
                        </TableCell>
                        </TableRow>
                    ))}
                    {sizes.length === 0 && (
                        <TableRow>
                        <TableCell colSpan={2} className="text-center text-gray-500 py-12">
                            <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                <Ruler className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium">لا توجد أحجام</p>
                            <p className="text-sm text-gray-400">ابدأ بإضافة حجم جديد</p>
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
