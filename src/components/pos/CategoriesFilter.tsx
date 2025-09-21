import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Category {
    id: number;
    name: string;
}

interface CategoriesFilterProps {
    selected: number | null;
    onSelect: (categoryId: number | null) => void;
}

export default function CategoriesFilter({selected, onSelect}: CategoriesFilterProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCategories() {
        try {
            const res = await invoke<Category[]>("fetch_categories_cmd");
            setCategories(res);
        } catch (err) {
            console.error(err);
            setError("فشل تحميل التصنيفات");
        } finally {
            setLoading(false);
        }
        }
        fetchCategories();
    }, []);

    if (loading) return <p className="text-sm text-gray-500">جاري التحميل...</p>;
    if (error) return <p className="text-sm text-red-600">{error}</p>;

    return (
        <div className="flex gap-2 my-4 flex-wrap">
        <button
            className={`px-3 py-1 rounded ${
            selected === null ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => onSelect(null)}
        >
            الكل
        </button>
        {categories.map((cat) => (
            <button
            key={cat.id}
            className={`px-3 py-1 rounded ${
                selected === cat.id ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => onSelect(cat.id)}
            >
            {cat.name}
            </button>
        ))}
        </div>
    );
}
