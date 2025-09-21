import { useState, useEffect } from "react"
import { invoke } from "@tauri-apps/api/core"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, User, Phone, MapPin } from "lucide-react"
import CategoriesFilter from "@/components/pos/CategoriesFilter"
import SearchBar from "@/components/SearchBar"
import Cart from "@/components/pos/Cart"
import ProductList from "@/components/pos/ProductList"
import Header from "@/components/Header"
import { ProductSize, ProductWithSizes } from "@/types"
import { useAuth } from "@/context/AuthContext"
import toast from "react-hot-toast"



interface CartItem {
    product: ProductWithSizes
    size: ProductSize
    quantity: number
    extraAmount?: number
}

interface Client {
    id?: number
    name: string
    phone: string
    secondPhone?: string
    address: string
}

export default function PosPage() {
    const { employeeId, employeeName } = useAuth();
    const [orderType, setOrderType] = useState<"local" | "delivery">("local")
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [products, setProducts] = useState<ProductWithSizes[]>([])
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Delivery-specific states
    const [clientPhone, setClientPhone] = useState("")
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [newClient, setNewClient] = useState<Client>({
        name: "",
        phone: "",
        secondPhone: "",
        address: "",
    })
    const [showNewClientForm, setShowNewClientForm] = useState(false)


    useEffect(() => {
        const fetchProducts = async () => {
        setLoading(true)
        try {
            const res: ProductWithSizes[] = await invoke("get_products_with_sizes_cmd")
            setProducts(res)
        } catch (err: any) {
            setError("فشل في تحميل المنتجات")
        } finally {
            setLoading(false)
        }
        }
        fetchProducts()
    }, [])

    const handleAddToCart = (product: ProductWithSizes, size: ProductSize) => {
        const existingItem = cartItems.find(
        (item) => item.product.id === product.id && item.size.id === size.id,
        )
        if (existingItem) {
        setCartItems(
            cartItems.map((item) =>
            item.product.id === product.id && item.size.id === size.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
        )
        } else {
        setCartItems([...cartItems, { product, size, quantity: 1, extraAmount: 0 }])
        }
    }

    const handleUpdateQuantity = (productId: number, sizeId: number, quantity: number) => {
        if (quantity <= 0) {
        setCartItems(
            cartItems.filter((item) => !(item.product.id === productId && item.size.id === sizeId)),
        )
        } else {
        setCartItems(
            cartItems.map((item) =>
            item.product.id === productId && item.size.id === sizeId
                ? { ...item, quantity }
                : item,
            ),
        )
        }
    }

    const handleRemoveFromCart = (productId: number, sizeId: number) => {
        setCartItems(
        cartItems.filter((item) => !(item.product.id === productId && item.size.id === sizeId)),
        )
    }

    const handleUpdateExtra = (productId: number, sizeId: number, extra: number) => {
        setCartItems(
        cartItems.map((item) =>
            item.product.id === productId && item.size.id === sizeId
            ? { ...item, extraAmount: extra }
            : item,
        ),
        )
    }

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
        return total + item.size.price * item.quantity + (item.extraAmount || 0)
        }, 0)
    }

    const handleSearchClient = async () => {
        try {
        const res: Client | null = await invoke("get_client_by_phone_cmd", { phone: clientPhone })
        if (res) {
            setSelectedClient(res)
            setShowNewClientForm(false)
        } else {
            setSelectedClient(null)
            setShowNewClientForm(true)
            setNewClient({ ...newClient, phone: clientPhone })
        }
        } catch {
        setError("فشل في البحث عن العميل")
        }
    }

    const handleSaveClient = async () => {
        try {
        const saved: Client = await invoke("create_client_cmd", { client: newClient })
        setSelectedClient(saved)
        setShowNewClientForm(false)
        } catch {
        setError("فشل في حفظ العميل")
        }
    }

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            toast.error("السلة فارغة");
            return;
        }

        if (!employeeId) {
            toast.error("لا يوجد موظف مسجل الدخول");
            return;
        }

        setLoading(true);
        try {
            const saleId = await invoke<number>("start_sale_cmd", {
                employeeId,
                clientId: selectedClient ?? null,
                orderType: "local",
            });

            for (const item of cartItems) {
                await invoke("add_sale_item_cmd", {
                    saleId,
                    productId: item.product.id,
                    sizeId: item.size.id,
                    quantity: item.quantity,
                    price: item.size.price,
                    extraAmount: item.extraAmount || 0,
                    productName: item.product.name,
                });
            }

            toast.success("تمت عملية البيع بنجاح!");
            setCartItems([]);
        } catch (err) {
            console.error("Checkout failed:", err);
            toast.error("فشل إتمام العملية. يرجى المحاولة مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };


    const handleClearOrder = () => {
        setCartItems([])
        if (orderType === "delivery") {
        setSelectedClient(null)
        setClientPhone("")
        setShowNewClientForm(false)
        }
    }

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.includes(searchQuery)
        const matchesCategory =
        selectedCategory === null || product.category_id === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
            <Header />
        <div className="max-w-7xl mx-auto mt-5">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">نظام نقاط البيع</h1>
                <p className="mb-4 text-right flex items-center gap-1.5">
                    <span>
                        الموظف:{" "}
                    </span>
                    <span className="font-semibold capitalize text-gray-900">
                        {employeeName || "غير معروف"}
                    </span>
                </p>

                {/* <div className="flex gap-2 mb-4">
                    <Button
                        onClick={() => setOrderType("local")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                            orderType === "local"
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                        }`}
                    >
                        طلب محلي
                    </Button>
                    <Button
                        onClick={() => setOrderType("delivery")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                            orderType === "delivery"
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                        }`}
                    >
                        طلب توصيل
                    </Button>
                </div> */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Products */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Delivery Client Info Section */}
                    {orderType === "delivery" && (
                    <Card className="bg-white shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <User className="text-blue-600" size={24} />
                                معلومات العميل
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Phone Search */}
                            <div className="flex gap-2">
                                <Input
                                    type="tel"
                                    placeholder="رقم الهاتف"
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleSearchClient}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                                >
                                    <Search size={16} className="ml-2" />
                                    بحث
                                </Button>
                            </div>

                            {/* Existing Client Info */}
                            {selectedClient && !showNewClientForm && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-green-600" />
                                            <span className="font-semibold">{selectedClient.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-green-600" />
                                            <span>{selectedClient.phone}</span>
                                            {selectedClient.secondPhone && (
                                                <span className="text-gray-500">/ {selectedClient.secondPhone}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-green-600" />
                                            <span>{selectedClient.address}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* New Client Form */}
                            {showNewClientForm && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                    <h3 className="font-semibold text-blue-800">عميل جديد</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <Input
                                        placeholder="الاسم"
                                        value={newClient.name}
                                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                        />
                                        <Input
                                        placeholder="هاتف ثاني (اختياري)"
                                        value={newClient.secondPhone}
                                        onChange={(e) => setNewClient({ ...newClient, secondPhone: e.target.value })}
                                        />
                                    </div>
                                    <Input
                                        placeholder="العنوان"
                                        value={newClient.address}
                                        onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                                    />
                                    <Button
                                        onClick={handleSaveClient}
                                        disabled={!newClient.name || !newClient.address}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        حفظ العميل
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    )}

                    {/* Products Section */}
                    <Card className="bg-white shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-800">المنتجات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SearchBar value={searchQuery} onChange={setSearchQuery} />

                            <CategoriesFilter selected={selectedCategory} onSelect={setSelectedCategory} />

                            <ProductList
                                products={filteredProducts}
                                onAddToCart={handleAddToCart}
                                loading={loading}
                                error={error}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel - Cart */}
                <div className="lg:col-span-1">
                    <Card className="bg-white shadow-lg border-0 h-fit">
                        <CardContent className="p-0">
                            <Cart
                                items={cartItems}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemove={handleRemoveFromCart}
                                onUpdateExtra={handleUpdateExtra}
                                total={calculateTotal()}
                                onCheckout={handleCheckout}
                                onClearOrder={handleClearOrder}
                                loading={loading}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        </div>
    )
}
