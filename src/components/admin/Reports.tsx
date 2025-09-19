import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import toast from "react-hot-toast";

type SaleDetail = {
    product_name: string;
    quantity: number;
    employee_name: string;
    total_price: number;
    timestamp: string;
};

type SalesReport = {
    total_sales: number;
    total_transactions: number;
    sales: SaleDetail[];
};

export default function ReportPage() {
    const [sales, setSales] = useState<SaleDetail[]>([]);
    const [totalSales, setTotalSales] = useState<number>(0);
    const [totalTransactions, setTotalTransactions] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    useEffect(() => {
        applyPreset("daily");
    }, []);

    const fetchReport = async (start?: string, end?: string) => {
        try {
        const result = await invoke<SalesReport>("get_report_cmd", {
            startDate: start || startDate || null,
            endDate: end || endDate || null,
        });

        if (result) {
            setSales(result.sales || []);
            setTotalSales(result.total_sales || 0);
            setTotalTransactions(result.total_transactions || 0);
        }
        } catch (err) {
        console.error("فشل في جلب التقرير:", err);
        toast.error("فشل في جلب التقرير");
        }
    };

    const formatCairoDateTime = (utcLike: string) => {
        try {
        const iso =
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(utcLike)
            ? utcLike.replace(" ", "T") + "Z"
            : utcLike;

        const d = new Date(iso);
        return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Africa/Cairo",
        }).format(d);
        } catch {
        return utcLike;
        }
    };

    const applyPreset = (type: "daily" | "weekly" | "monthly") => {
        const today = new Date();
        let start: Date;
        let end = new Date(today);

        if (type === "daily") {
        start = new Date(today);
        } else if (type === "weekly") {
        start = new Date(today);
        start.setDate(start.getDate() - 6);
        } else {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        }

        const startStr = start.toISOString().split("T")[0];
        const endStr = end.toISOString().split("T")[0];

        setStartDate(startStr);
        setEndDate(endStr);
        fetchReport(startStr, endStr);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto" dir="rtl">
        <Card className="shadow-md border border-gray-200 rounded-xl">
            <CardContent className="p-6 space-y-6">
            <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
                تقرير المبيعات
            </CardTitle>

            {/* Preset Filters */}
            <div className="flex flex-wrap gap-3">
                <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-blue-600 hover:text-white"
                onClick={() => applyPreset("daily")}
                >
                يومي
                </Button>
                <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-blue-600 hover:text-white"
                onClick={() => applyPreset("weekly")}
                >
                أسبوعي
                </Button>
                <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-blue-600 hover:text-white"
                onClick={() => applyPreset("monthly")}
                >
                شهري
                </Button>
            </div>

            {/* Specific Date Filter */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                عرض التقرير بتاريخ محدد
                </h3>
                <div className="flex flex-col md:flex-row items-center gap-4">
                <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                    setStartDate(e.target.value);
                    setEndDate(e.target.value);
                    }}
                    className="flex-1 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <Button
                    onClick={() => fetchReport(startDate, startDate)}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
                    disabled={!startDate}
                >
                    عرض التقرير
                </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                اختر تاريخًا محددًا لعرض تقرير المبيعات الخاص به.
                </p>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">
                    تاريخ البداية
                </label>
                <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                </div>
                <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">
                    تاريخ النهاية
                </label>
                <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                </div>
                <Button
                onClick={() => fetchReport()}
                className="bg-blue-600 hover:bg-blue-700 text-white self-end"
                >
                تطبيق
                </Button>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                <p className="text-lg font-semibold text-gray-800">
                إجمالي المبيعات: {totalSales} ج.م
                </p>
                <p className="text-lg font-semibold text-gray-800">
                إجمالي العمليات: {totalTransactions}
                </p>
            </div>

            {/* Table with ScrollArea */}
            <div className="overflow-hidden">
                <ScrollArea className="h-64 w-full rounded-md border border-gray-200">
                <Table>
                    <TableHeader>
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                        <TableHead className="text-gray-700 font-semibold">
                        المنتج
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                        الكمية
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                        الموظف
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                        الإجمالي
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                        التاريخ والوقت
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {sales.length > 0 ? (
                        sales.map((sale, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                            <TableCell>{sale.product_name}</TableCell>
                            <TableCell>{sale.quantity}</TableCell>
                            <TableCell>{sale.employee_name}</TableCell>
                            <TableCell>{sale.total_price} ج.م</TableCell>
                            <TableCell>{formatCairoDateTime(sale.timestamp)}</TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell
                            colSpan={5}
                            className="text-center text-gray-500 p-4"
                        >
                            لا توجد بيانات متاحة حاليًا
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
    );
}
