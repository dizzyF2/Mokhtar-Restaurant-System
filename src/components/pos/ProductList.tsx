import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ProductSize, ProductWithSizes } from "@/types"

interface ProductListProps {
    products: ProductWithSizes[]
    onAddToCart: (product: ProductWithSizes, size: ProductSize) => void
    loading: boolean
    error: string | null
}

export default function ProductList({ products, onAddToCart, loading, error }: ProductListProps) {
    if (loading) return <p className="text-center text-blue-700 font-medium">جارٍ تحميل المنتجات...</p>
    if (error) return <p className="text-red-600 text-center">{error}</p>
    if (products.length === 0) return <p className="text-gray-500 text-center">لم يتم العثور على منتجات.</p>

    return (
        <ScrollArea className="h-[50vh] pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-3" dir="rtl">
            {products.map((p) => (
            <Card
                key={p.id}
                className="bg-white border border-blue-200 shadow-sm rounded-lg hover:shadow-md hover:border-blue-300 transition-all duration-200 group overflow-hidden"
            >
                <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base font-semibold text-gray-900">
                    {p.name}
                </CardTitle>
                {p.sizes.length > 0 && (
                    <Badge variant="secondary" className="w-fit text-xs bg-blue-50 text-blue-700">
                    {p.sizes.length} حجم متاح
                    </Badge>
                )}
                </CardHeader>

                <CardContent className="p-4 pt-0">
                {p.sizes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                    {p.sizes.map((s) => (
                        <Button
                            key={s.id}
                            variant="outline"
                            size="sm"
                            className="h-auto py-2 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 text-gray-900 hover:text-blue-900 transition-all duration-200"
                            onClick={() => onAddToCart(p, s)}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="font-medium text-sm">{s.size}</span>
                                <div className="flex items-center gap-1">
                                <span className="font-bold text-blue-700">{s.price}</span>
                                <span className="text-xs text-gray-500">ج.م</span>
                                </div>
                            </div>
                        </Button>
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-4">
                    <p className="text-sm text-gray-400">لا توجد أحجام متاحة</p>
                    </div>
                )}
                </CardContent>
            </Card>
            ))}
        </div>
        </ScrollArea>
    )
}
