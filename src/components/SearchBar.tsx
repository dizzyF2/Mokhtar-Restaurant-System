import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="relative w-full mb-4" dir="rtl">
            <Search className="absolute right-3 top-2.5 text-blue-600" size={20} />
            <Input
                type="text"
                placeholder="ابحث بالاسم أو الباركود..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pr-10 pl-4 py-2 
                        bg-blue-50 
                        border border-blue-200 
                        rounded-lg shadow-sm 
                        focus:border-blue-600 
                        focus:ring-2 focus:ring-amber-200 
                        text-right 
                        placeholder:text-blue-400 
                        text-black
                        transition"
            />
        </div>
    );
}