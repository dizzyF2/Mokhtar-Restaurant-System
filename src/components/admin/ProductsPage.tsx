import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit3, PlusCircle, X, Plus } from "lucide-react"
import toast from "react-hot-toast"
import ConfirmModal from "@/components/ConfirmModal"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProductSize } from "@/types"

type Size = {
  id: number
  name: string
}

type Product = {
  id: number
  name: string
  category_id: number
  barcode?: string
  sizes: ProductSize[]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [newName, setNewName] = useState("")
  const [newBarcode, setNewBarcode] = useState("")
  const [newCategory, setNewCategory] = useState<number | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<{ size_id: number; price: number }[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [editingBarcode, setEditingBarcode] = useState("")
  const [editingCategory, setEditingCategory] = useState<number | null>(null)
  const [editingSizes, setEditingSizes] = useState<{ size_id: number; price: number }[]>([])
  const [showSizeDialog, setShowSizeDialog] = useState(false)
  const [editingSizeDialog, setEditingSizeDialog] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchSizes()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const result = await invoke<Product[]>("get_products_with_sizes_cmd")
      setProducts(result)
    } catch (e) {
      console.error(e)
      toast.error("فشل في جلب المنتجات")
    }
  }

  const fetchSizes = async () => {
    try {
      const result = await invoke<Size[]>("fetch_sizes_cmd")
      setSizes(result)
    } catch (e) {
      console.error(e)
      toast.error("فشل في جلب الأحجام")
    }
  }

  const fetchCategories = async () => {
    try {
      const result = await invoke<{ id: number; name: string }[]>("fetch_categories_cmd")
      setCategories(result)
    } catch (e) {
      console.error(e)
      toast.error("فشل في جلب الفئات")
    }
  }

  const addProduct = async () => {
    if (!newName.trim()) return toast.error("يرجى إدخال اسم المنتج")
    if (!newCategory) return toast.error("يرجى اختيار تصنيف")
    if (!selectedSizes.length) return toast.error("يرجى اختيار حجم واحد على الأقل")

    try {
      await invoke("add_product_cmd", {
        name: newName.trim(),
        categoryId: newCategory,
        barcode: newBarcode.trim() || null,
        sizes: selectedSizes,
      })
      await fetchProducts()
      setNewName("")
      setNewBarcode("")
      setNewCategory(null)
      setSelectedSizes([])
      toast.success("تمت إضافة المنتج بنجاح")
    } catch (e) {
      console.error(e)
      toast.error("فشل في إضافة المنتج")
    }
  }

  const startEdit = (p: Product) => {
    setEditingId(p.id)
    setEditingName(p.name)
    setEditingBarcode(p.barcode || "")
    setEditingCategory(p.category_id)
    setEditingSizes(
      p.sizes.map((s) => ({
        size_id: s.size_id,
        price: s.price,
      })),
    )
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName("")
    setEditingBarcode("")
    setEditingCategory(null)
    setEditingSizes([])
  }

  const saveEdit = async () => {
    if (!editingName.trim()) return toast.error("يرجى إدخال اسم المنتج")
    if (!editingCategory) return toast.error("يرجى اختيار تصنيف")
    if (!editingSizes.length) return toast.error("يرجى تحديد سعر لحجم واحد على الأقل")

    try {
      await invoke("update_product_cmd", {
        id: editingId,
        categoryId: editingCategory,
        name: editingName.trim(),
        barcode: editingBarcode.trim() || null,
        sizes: editingSizes,
      })
      await fetchProducts()
      cancelEdit()
      toast.success("تم تعديل المنتج بنجاح")
    } catch (e) {
      console.error(e)
      toast.error("فشل في تعديل المنتج")
    }
  }

  const removeProduct = async (id: number) => {
    try {
      await invoke("delete_product_cmd", { id })
      await fetchProducts()
      toast.success("تم حذف المنتج")
    } catch (e) {
      console.error(e)
      toast.error("فشل في حذف المنتج")
    }
  }

  const SizeManager = ({
    sizes: availableSizes,
    selectedSizes,
    onSizesChange,
    // isEditing = false,
  }: {
    sizes: Size[]
    selectedSizes: { size_id: number; price: number }[]
    onSizesChange: (sizes: { size_id: number; price: number }[]) => void
    isEditing?: boolean
  }) => {
    const addSize = (sizeId: number) => {
      if (!selectedSizes.find((s) => s.size_id === sizeId)) {
        onSizesChange([...selectedSizes, { size_id: sizeId, price: 0 }])
      }
    }

    const removeSize = (sizeId: number) => {
      onSizesChange(selectedSizes.filter((s) => s.size_id !== sizeId))
    }

    const updatePrice = (sizeId: number, price: number) => {
      const safePrice = price < 0 ? 0 : price
      onSizesChange(
        selectedSizes.map((s) =>
          s.size_id === sizeId ? { ...s, price: safePrice } : s
        )
      )
    }

    const availableToAdd = availableSizes.filter((size) => !selectedSizes.find((s) => s.size_id === size.id))

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {selectedSizes.map((selectedSize) => {
            const size = availableSizes.find((s) => s.id === selectedSize.size_id)
            return (
              <div key={selectedSize.size_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <Badge variant="secondary" className="min-w-[80px] justify-center">
                  {size?.name}
                </Badge>
                <Input
                  type="number"
                  value={selectedSize.price}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value) || 0
                    updatePrice(selectedSize.size_id, value < 0 ? 0 : value)
                  }}
                  placeholder="السعر"
                  className="w-32"
                />
                <span className="text-sm text-gray-600">ج.م</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSize(selectedSize.size_id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )
          })}
        </div>

        {availableToAdd.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">إضافة حجم جديد:</p>
            <div className="flex flex-wrap gap-2">
              {availableToAdd.map((size) => (
                <Button
                  key={size.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addSize(size.id)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  {size.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {selectedSizes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>لم يتم اختيار أي أحجام بعد</p>
            <p className="text-sm">اختر الأحجام المتاحة أدناه</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      <Card className="shadow-md border border-gray-200 rounded-xl mb-6">
        <CardContent className="space-y-4">
          <CardTitle className="text-2xl font-bold">إضافة منتج جديد</CardTitle>

          <div className="flex flex-col md:flex-row gap-3">
            <Input placeholder="اسم المنتج" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Select value={newCategory?.toString()} onValueChange={(val) => setNewCategory(Number(val))}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="باركود (اختياري)" value={newBarcode} onChange={(e) => setNewBarcode(e.target.value)} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">الأحجام والأسعار</p>
              <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 bg-transparent">
                    <Plus className="w-4 h-4 ml-1" />
                    إدارة الأحجام
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إدارة أحجام المنتج</DialogTitle>
                  </DialogHeader>
                  <SizeManager sizes={sizes} selectedSizes={selectedSizes} onSizesChange={setSelectedSizes} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="min-h-[60px] p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              {selectedSizes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedSizes.map((selectedSize) => {
                    const size = sizes.find((s) => s.id === selectedSize.size_id)
                    return (
                      <Badge key={selectedSize.size_id} variant="secondary" className="text-sm flex items-center gap-1.5">
                        <p>{size?.name}:</p>
                        <p>{selectedSize.price} ج.م</p>
                      </Badge>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  انقر على "إدارة الأحجام" لإضافة الأحجام والأسعار
                </div>
              )}
            </div>
          </div>

          <Button onClick={addProduct} className="bg-green-600 text-white flex items-center gap-2 px-4 py-2 rounded">
            <PlusCircle size={18} /> إضافة
          </Button>
        </CardContent>
      </Card>


      <ScrollArea className="h-64 w-full rounded-md border border-gray-200" dir="rtl">
        <Table className="border border-gray-200 rounded-lg">
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableHead className="text-right text-gray-700 font-semibold">المنتج</TableHead>
              <TableHead className="text-right text-gray-700 font-semibold">الفئة</TableHead>
              <TableHead className="text-right text-gray-700 font-semibold">الأحجام</TableHead>
              <TableHead className="pl-7 text-gray-700 font-semibold pr-10">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} className="hover:bg-gray-50">
                <TableCell>
                  {editingId === p.id ? (
                    <Input
                      value={editingName}
                      onChange={(ev) => setEditingName(ev.target.value)}
                      className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="font-medium text-gray-800">{p.name}</span>
                  )}
                </TableCell>

                <TableCell>
                  {editingId === p.id ? (
                    <Select
                      value={editingCategory?.toString()}
                      onValueChange={(val) => setEditingCategory(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="font-medium text-gray-600">
                      {categories.find((c) => c.id === p.category_id)?.name || "-"}
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  {editingId === p.id ? (
                    <div className="flex items-center gap-2">
                      <Dialog open={editingSizeDialog} onOpenChange={setEditingSizeDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 bg-transparent">
                            <Edit3 className="w-4 h-4 ml-1" />
                            تعديل الأحجام
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md" dir="rtl">
                          <DialogHeader>
                            <DialogTitle>تعديل أحجام المنتج</DialogTitle>
                          </DialogHeader>
                          <SizeManager
                            sizes={sizes}
                            selectedSizes={editingSizes}
                            onSizesChange={setEditingSizes}
                            isEditing={true}
                          />
                        </DialogContent>
                      </Dialog>
                      <div className="text-sm text-gray-600">({editingSizes.length} حجم محدد)</div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {p.sizes.map((s, index) => (
                        <Badge key={index} variant="outline" className="text-xs flex items-center gap-1.5">
                          <p>{s.size}:</p>
                          <p>{s.price} ج.م</p>
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  {editingId === p.id ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={saveEdit}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3 rounded"
                      >
                        حفظ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-3 rounded bg-transparent"
                      >
                        إلغاء
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded"
                        onClick={() => startEdit(p)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <ConfirmModal
                        trigger={
                          <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white px-3 rounded">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        }
                        message={`هل أنت متأكد أنك تريد حذف المنتج "${p.name}"؟`}
                        confirmText="حذف"
                        cancelText="إلغاء"
                        onConfirm={() => removeProduct(p.id)}
                      />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 p-4">
                  لا يوجد منتجات.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
