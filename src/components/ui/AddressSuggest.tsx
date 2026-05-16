import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, X, Loader2 } from "lucide-react";

interface SuggestResult {
  title: { text: string };
  subtitle?: { text: string };
}

interface AddressSuggestProps {
  value: string;
  onChange: (value: string, validated: boolean) => void;
  placeholder?: string;
  inputClassName?: string;
  error?: boolean;
}

const API_KEY = (import.meta as any).env?.VITE_YMAPS_KEY ?? "";

export function AddressSuggest({
  value,
  onChange,
  placeholder = "Улица, дом, квартира",
  inputClassName,
  error,
}: AddressSuggestProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = useCallback((query: string) => {
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (query.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const url = new URL("https://suggest-maps.yandex.ru/v1/suggest");
        url.searchParams.set("apikey", API_KEY);
        url.searchParams.set("text", query);
        url.searchParams.set("lang", "ru_RU");
        url.searchParams.set("types", "geo");
        url.searchParams.set("results", "6");
        url.searchParams.set("highlight", "0");

        const res = await fetch(url.toString(), { signal: controller.signal });
        const data = await res.json() as { results?: SuggestResult[] };

        const names = (data.results ?? []).map((r) => {
          const title = r.title?.text ?? "";
          const sub = r.subtitle?.text ? `, ${r.subtitle.text}` : "";
          return `${title}${sub}`;
        }).filter(Boolean);

        setSuggestions(names);
        setOpen(names.length > 0);
      } catch {
        // aborted or network error — ignore
      } finally {
        setLoading(false);
      }
    }, 320);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v, false);
    fetchSuggestions(v);
  };

  const handleSelect = (suggestion: string) => {
    onChange(suggestion, true);
    setSuggestions([]);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("", false);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={
            inputClassName ??
            `w-full px-5 py-4 rounded-2xl border-2 text-lg outline-none transition-colors pr-12 ${
              error ? "border-red-400" : "border-gray-100 focus:border-black"
            }`
          }
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 size={16} className="text-gray-300 animate-spin" />}
          {value && !loading && (
            <button type="button" onClick={handleClear} className="text-gray-300 hover:text-gray-500 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => handleSelect(s)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-800 leading-snug">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
