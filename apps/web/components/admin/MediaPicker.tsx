"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { API_URL, assetUrl } from "@/lib/api";

interface Asset {
  id: string;
  urlOrKey: string;
  altText: string | null;
}

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    const loadAssets = async () => {
      try {
        const res = await fetch(`${API_URL}/public/media/list`, {
          credentials: "include",
        });
        if (res.ok && isMounted) {
          const json = await res.json();
          setAssets(json.data);
        } else if (isMounted) {
          setError("دریافت کتابخانه رسانه ناموفق بود.");
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("ارتباط با سرور برقرار نشد.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadAssets();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/public/media/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.data?.urlOrKey) {
        onSelect(json.data.urlOrKey);
      } else {
        setError(json?.error?.message || "آپلود تصویر انجام نشد.");
      }
    } catch (err) {
      console.error(err);
      setError("آپلود تصویر انجام نشد.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-[800px] shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-primary">انتخاب تصویر</h2>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              آپلود عکس جدید
            </Button>
            <button
              onClick={onClose}
              className="text-foreground-muted hover:text-primary p-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-accent" size={40} />
            </div>
          ) : assets.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => onSelect(asset.urlOrKey)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-border cursor-pointer hover:border-accent transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" decoding="async"
                    src={assetUrl(asset.urlOrKey)}
                    alt={asset.altText || "تصویر"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle2 size={32} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <ImageIcon size={48} className="mx-auto text-border mb-4" />
              <p className="text-foreground-muted">
                هیچ عکسی یافت نشد. یک عکس جدید آپلود کنید.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
