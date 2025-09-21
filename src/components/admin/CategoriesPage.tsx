import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Trash2, Check, X, Edit3, PlusCircle, Tag } from "lucide-react"
import toast from "react-hot-toast"
import ConfirmModal from "../ConfirmModal"
import { ScrollArea } from "../ui/scroll-area"

type Category = { id: number; name: string }

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [newCategory, setNewCategory] = useState("")
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingName, setEditingName] = useState("")

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
        const result = await invoke<Category[]>("fetch_categories_cmd")
        setCategories(result)
        } catch (e) {
        console.error("فشل في جلب الفئات:", e)
        toast.error("فشل في جلب الفئات")
        }
    }

    const addCategory = async () => {
        if (!newCategory.trim()) {
        toast.error("يرجى إدخال اسم الفئة")
        return
        }
        try {
        await invoke("add_category_cmd", { name: newCategory.trim() })
        setNewCategory("")
        await fetchCategories()
        toast.success("تمت إضافة الفئة بنجاح")
        } catch (e) {
        console.error("فشل في إضافة الفئة:", e)
        toast.error("فشل في إضافة الفئة")
        }
    }

    const startEdit = (cat: Category) => {
        setEditingId(cat.id)
        setEditingName(cat.name)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditingName("")
    }

    const saveEdit = async () => {
        if (editingId === null) return
        if (!editingName.trim()) {
        toast.error("يرجى إدخال اسم الفئة")
        return
        }
        try {
        await invoke("update_category_cmd", { id: editingId, name: editingName.trim() })
        cancelEdit()
        await fetchCategories()
        toast.success("تم تعديل الفئة بنجاح")
        } catch (e) {
        console.error("فشل في تعديل الفئة:", e)
        toast.error("فشل في تعديل الفئة")
        }
    }

    const removeCategory = async (id: number) => {
        try {
        await invoke("delete_category_cmd", { id })
        await fetchCategories()
        toast.success("تم حذف الفئة")
        } catch (e) {
        console.error("فشل في حذف الفئة:", e)
        toast.error("فشل في حذف الفئة")
        }
    }

    return (
        <div className="p-6 max-w-5xl mx-auto" dir="rtl">
        <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-8 space-y-8">
            <div className="border-b border-gray-100 pb-6">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Tag className="text-blue-600" size={32} />
                إدارة الفئات
                </CardTitle>
                <p className="text-gray-600 text-lg">إضافة وتعديل وحذف فئات المنتجات</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PlusCircle className="text-green-600" size={24} />
                إضافة فئة جديدة
                </h3>
                <div className="flex gap-4">
                <Input
                    type="text"
                    placeholder="اسم الفئة *"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                />
                <Button
                    onClick={addCategory}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                    <PlusCircle size={20} /> إضافة
                </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">قائمة الفئات</h3>
                </div>
                <ScrollArea className="h-80 w-full" dir="rtl">
                <Table>
                    <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-right font-semibold text-gray-700 py-4">اسم الفئة</TableHead>
                        <TableHead className="text-center font-semibold text-gray-700 py-4">الإجراءات</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {categories.map((c) => (
                        <TableRow key={c.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="py-4">
                            {editingId === c.id ? (
                            <Input
                                value={editingName}
                                onChange={(ev) => setEditingName(ev.target.value)}
                                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                            />
                            ) : (
                            <span className="font-medium text-gray-900 bg-orange-50 px-3 py-2 rounded-lg inline-block">
                                {c.name}
                            </span>
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
                        <TableCell colSpan={2} className="text-center text-gray-500 py-12">
                            <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                <Tag className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium">لا توجد فئات</p>
                            <p className="text-sm text-gray-400">ابدأ بإضافة فئة جديدة</p>
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
