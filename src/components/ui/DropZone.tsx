import { useState, useRef, useCallback } from "react";
import { Upload, X, Camera } from "lucide-react";

export interface PhotoFile {
  id: string;
  file: File;
  preview: string;
}

interface DropZoneProps {
  label?: string;
  hint?: string;
  maxFiles?: number;
  disabled?: boolean;
  files: PhotoFile[];
  onChange: (files: PhotoFile[]) => void;
  required?: boolean;
  empty?: boolean;
}

export function DropZone({ label, hint, maxFiles = 5, disabled, files, onChange, required }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((raw: FileList | null) => {
    if (!raw || disabled) return;
    const accepted = Array.from(raw)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, maxFiles - files.length);
    const newFiles: PhotoFile[] = accepted.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    onChange([...files, ...newFiles]);
  }, [files, maxFiles, onChange, disabled]);

  const remove = (id: string) => {
    const f = files.find((f) => f.id === id);
    if (f) URL.revokeObjectURL(f.preview);
    onChange(files.filter((f) => f.id !== id));
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); if (!disabled) setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const canAdd = files.length < maxFiles && !disabled;

  return (
    <div className="flex flex-col gap-2">
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((f) => (
            <div key={f.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
              <img src={f.preview} alt="" className="w-full h-full object-cover" loading="lazy" />
              {!disabled && (
                <button
                  onClick={() => remove(f.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
          {canAdd && (
            <button
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-gray-400 transition-colors text-gray-400"
            >
              <Camera size={18} />
              <span className="text-[10px] font-medium">Добавить</span>
            </button>
          )}
        </div>
      )}

      {files.length === 0 && (
        <button
          type="button"
          onClick={() => canAdd && inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          disabled={!canAdd}
          className={`flex flex-col items-center gap-2 py-7 px-4 rounded-xl border-2 border-dashed transition-colors text-center w-full ${
            dragging
              ? "border-blue-400 bg-blue-50"
              : disabled
              ? "border-gray-100 bg-gray-50 cursor-not-allowed"
              : "border-gray-200 hover:border-gray-400 cursor-pointer"
          }`}
        >
          <Upload size={20} className={dragging ? "text-blue-400" : disabled ? "text-gray-300" : "text-gray-400"} />
          <div>
            {label && (
              <p className="text-sm font-medium text-gray-600">
                {label}
                {required && <span className="text-red-400 ml-0.5">*</span>}
              </p>
            )}
            {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  );
}
