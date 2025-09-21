import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Input } from "../ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ProductSize, ProductWithSizes } from "@/types"

interface CartItem {
    product: ProductWithSizes
    size: ProductSize
    quantity: number
    extraAmount?: number
}

interface CartProps {
    items: CartItem[]
    onUpdateQuantity: (productId: number, sizeId: number, quantity: number) => void
    onRemove: (productId: number, sizeId: number) => void
    onUpdateExtra: (productId: number, sizeId: number, extra: number) => void
    total: number
    onCheckout: () => void
    onClearOrder: () => void
    loading: boolean
}

export default function Cart({
    items,
    onUpdateQuantity,
    onRemove,
    onUpdateExtra,
    total,
    onCheckout,
    onClearOrder,
    loading,
    }: CartProps) {
    return (
        <div className="bg-blue-50 rounded-2xl shadow-lg p-6 flex flex-col border border-blue-200 h-full" dir="rtl">
        {/* Cart Header */}
        <h2 className="text-2xl font-bold text-blue-900 mb-4">🛒 السلة</h2>

        {/* Scrollable Items */}
        <ScrollArea className="flex-1 pr-2">
            <div className="max-h-[50vh] p-3">
            {items.length === 0 && <p className="text-blue-600 text-center">لا توجد منتجات في السلة.</p>}
            {items.map((item) => (
                <div
                key={`${item.product.id}-${item.size.id}`}
                className="flex flex-col gap-3 mb-4 border-b border-blue-200 pb-4"
                >
                <div className="flex justify-between items-start">
                    <div>
                    <p className="font-semibold text-blue-900">{item.product.name}</p>
                    <p className="text-sm text-blue-700">
                        الحجم: {item.size.size} | السعر: {item.size.price} ج.م
                    </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-400 text-blue-800 hover:bg-blue-100 bg-transparent"
                        onClick={() => onUpdateQuantity(item.product.id, item.size.id, item.quantity - 1)}
                    >
                        -
                    </Button>
                    <span className="font-bold text-blue-900">{item.quantity}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-400 text-blue-800 hover:bg-blue-100 bg-transparent"
                        onClick={() => onUpdateQuantity(item.product.id, item.size.id, item.quantity + 1)}
                    >
                        +
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="bg-red-600 hover:bg-red-700 rounded-full"
                        onClick={() => onRemove(item.product.id, item.size.id)}
                    >
                        <Trash2 size={16} />
                    </Button>
                    </div>
                </div>


                <div>
                    <Input
                        type="number"
                        placeholder="أضف قيمة إضافية"
                        className="w-32"
                        min="0"
                        value={item.extraAmount || ""}
                        onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e") {
                            e.preventDefault()
                            }
                        }}
                        onChange={(e) => {
                            const value = Number.parseInt(e.target.value)
                            onUpdateExtra(item.product.id, item.size.id, isNaN(value) || value < 0 ? 0 : value)
                        }}
                    />
                </div>
                </div>
            ))}
            </div>
        </ScrollArea>

        {/* Footer (Total, Checkout and clear all orders) */}
        <div className="mt-4">
            <div className="flex justify-between font-bold text-xl mb-4 text-blue-900">
            <span>الإجمالي:</span>
            <span>{total} ج.م</span>
            </div>
            <Button
            onClick={onCheckout}
            disabled={items.length === 0 || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 rounded-xl shadow-md transition"
            >
            {loading ? "جارٍ المعالجة..." : "إتمام الدفع"}
            </Button>
        </div>
        {items.length > 0 &&
            <div className="p-6 pt-3">
                <Button
                    onClick={onClearOrder}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                    disabled={items.length === 0}
                >
                    مسح الطلب
                </Button>
            </div>
        }
        </div>
    )
}
