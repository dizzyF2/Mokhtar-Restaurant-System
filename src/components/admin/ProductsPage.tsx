import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Edit3, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../ConfirmModal";
import { ScrollArea } from "../ui/scroll-area";

type Size = {
  id: number;
  name: string;
};

type ProductSize = {
  id: number;
  product_id: number;
  size_id: number;
  size: string;
  price: number;
};

type Product = {
  id: number;
  name: string;
  category_id: number;
  barcode?: string;
  sizes: ProductSize[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );

  const [newName, setNewName] = useState("");
  const [newBarcode, setNewBarcode] = useState("");
  const [newCategory, setNewCategory] = useState<number | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<
    { size_id: number; price: number }[]
  >([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingBarcode, setEditingBarcode] = useState("");
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editingSizes, setEditingSizes] = useState<
    { size_id: number; price: number }[]
  >([]);

  useEffect(() => {
    fetchProducts();
    fetchSizes();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const result = await invoke<Product[]>("get_products_with_sizes_cmd");
      setProducts(result);
    } catch (e) {
      console.error(e);
      toast.error("فشل في جلب المنتجات");
    }
  };

  const fetchSizes = async () => {
    try {
      const result = await invoke<Size[]>("fetch_sizes_cmd");
      setSizes(result);
    } catch (e) {
      console.error(e);
      toast.error("فشل في جلب الأحجام");
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await invoke<{ id: number; name: string }[]>(
        "fetch_categories_cmd"
      );
      setCategories(result);
    } catch (e) {
      console.error(e);
      toast.error("فشل في جلب التصنيفات");
    }
  };

  const addProduct = async () => {
    if (!newName.trim()) return toast.error("يرجى إدخال اسم المنتج");
    if (!newCategory) return toast.error("يرجى اختيار تصنيف");
    if (!selectedSizes.length)
      return toast.error("يرجى اختيار حجم واحد على الأقل");

    try {
      await invoke("add_product_cmd", {
        name: newName.trim(),
        categoryId: newCategory,
        barcode: newBarcode.trim() || null,
        sizes: selectedSizes, // pass sizes here
      });
      setNewName("");
      setNewBarcode("");
      setNewCategory(null);
      setSelectedSizes([]);
      await fetchProducts();
      toast.success("تمت إضافة المنتج بنجاح");
    } catch (e) {
      console.error(e);
      toast.error("فشل في إضافة المنتج");
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditingName(p.name);
    setEditingBarcode(p.barcode || "");
    setEditingCategory(p.category_id);
    setEditingSizes(
      p.sizes.map((s) => ({
        size_id: s.size_id,
        price: s.price,
      }))
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingBarcode("");
    setEditingCategory(null);
    setEditingSizes([]);
  };

  const saveEdit = async () => {
    if (!editingName.trim()) return toast.error("يرجى إدخال اسم المنتج");
    if (!editingCategory) return toast.error("يرجى اختيار تصنيف");
    if (!editingSizes.length)
      return toast.error("يرجى تحديد سعر لحجم واحد على الأقل");

    try {
      await invoke("update_product_cmd", {
        id: editingId,
        categoryId: editingCategory,
        name: editingName.trim(),
        barcode: editingBarcode.trim() || null,
        sizes: editingSizes,
      });

      cancelEdit();
      await fetchProducts();
      toast.success("تم تعديل المنتج بنجاح");
    } catch (e) {
      console.error(e);
      toast.error("فشل في تعديل المنتج");
    }
  };

  const removeProduct = async (id: number) => {
    try {
      await invoke("delete_product_cmd", { id });
      await fetchProducts();
      toast.success("تم حذف المنتج");
    } catch (e) {
      console.error(e);
      toast.error("فشل في حذف المنتج");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      <Card className="shadow-md border border-gray-200 rounded-xl mb-6">
        <CardContent className="space-y-4">
          <CardTitle className="text-2xl font-bold">إضافة منتج جديد</CardTitle>

          <div className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="اسم المنتج"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Select
              value={newCategory?.toString()}
              onValueChange={(val) => setNewCategory(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر التصنيف" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="باركود (اختياري)"
              value={newBarcode}
              onChange={(e) => setNewBarcode(e.target.value)}
            />
          </div>

          {/* Sizes */}
          <div>
            <p className="mb-1 font-medium">الأحجام</p>
            {sizes.map((s) => {
              const selected = selectedSizes.find((sz) => sz.size_id === s.id);
              return (
                <div key={s.id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSizes([
                          ...selectedSizes,
                          { size_id: s.id, price: 0 },
                        ]);
                      } else {
                        setSelectedSizes(
                          selectedSizes.filter((sz) => sz.size_id !== s.id)
                        );
                      }
                    }}
                  />
                  <span className="w-20">{s.name}</span>
                  {selected && (
                    <Input
                      type="number"
                      value={selected.price}
                      onChange={(e) => {
                        const price = parseFloat(e.target.value) || 0;
                        setSelectedSizes(
                          selectedSizes.map((sz) =>
                            sz.size_id === s.id ? { ...sz, price } : sz
                          )
                        );
                      }}
                      placeholder="السعر"
                      className="w-24"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <Button
            onClick={addProduct}
            className="bg-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded"
          >
            <PlusCircle size={18} /> إضافة
          </Button>
        </CardContent>
      </Card>

      {/* Products Table */}
      <ScrollArea className="h-64 w-full rounded-md border border-gray-200" dir="rtl">
        <Table className="border border-gray-200 rounded-lg">
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableHead className="text-right text-gray-700 font-semibold">
                المنتج
              </TableHead>
              <TableHead className="text-right text-gray-700 font-semibold">
                التصنيف
              </TableHead>
              <TableHead className="text-right text-gray-700 font-semibold">
                الأحجام
              </TableHead>
              <TableHead className="pl-7 text-gray-700 font-semibold pr-10">
                الإجراءات
              </TableHead>
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
                        <SelectValue placeholder="اختر التصنيف" />
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
                      {categories.find((c) => c.id === p.category_id)?.name ||
                        "-"}
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  {editingId === p.id ? (
                    <div className="flex flex-col gap-2">
                      {sizes.map((s) => {
                        const sizeEdit = editingSizes.find(
                          (sz) => sz.size_id === s.id
                        );
                        return (
                          <div key={s.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!sizeEdit}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditingSizes([
                                    ...editingSizes,
                                    { size_id: s.id, price: 0 },
                                  ]);
                                } else {
                                  setEditingSizes(
                                    editingSizes.filter(
                                      (sz) => sz.size_id !== s.id
                                    )
                                  );
                                }
                              }}
                            />
                            <span className="w-20">{s.name}</span>
                            {sizeEdit && (
                              <Input
                                type="number"
                                value={sizeEdit.price}
                                onChange={(e) => {
                                  const price =
                                    parseFloat(e.target.value) || 0;
                                  setEditingSizes(
                                    editingSizes.map((sz) =>
                                      sz.size_id === s.id
                                        ? { ...sz, price }
                                        : sz
                                    )
                                  );
                                }}
                                className="w-24"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span>
                      {p.sizes
                        .map((s) => `${s.size}: ${s.price} ج.م`)
                        .join(", ")}
                    </span>
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
                        className="flex items-center gap-1 px-3 rounded"
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
                          <Button
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 text-white px-3 rounded"
                          >
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
                <TableCell
                  colSpan={4}
                  className="text-center text-gray-500 p-4"
                >
                  لا يوجد منتجات.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
