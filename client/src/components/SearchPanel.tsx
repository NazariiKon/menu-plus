import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface SearchPanelProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    debounceMs?: number;
    initialValue?: string;
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function SearchPanel({
    onSearch,
    placeholder = 'Search...',
    debounceMs = 300,
    initialValue = '',
}: SearchPanelProps) {
    const [query, setQuery] = useState(initialValue);

    const debouncedQuery = useDebounce(query, debounceMs);

    useEffect(() => {
        if (debouncedQuery.trim()) {
            onSearch(debouncedQuery.trim());
        } else {
            onSearch('');
        }
    }, [debouncedQuery, onSearch]);

    return (
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder}
                className="w-full pl-10"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                }}
            />
        </div>
    );
}
