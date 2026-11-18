"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import {
  ArrowRight,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  MessageSquare,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Inquiry {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  type: string;
  subject: string;
  message: string;
  status: string;
  internalNote: string | null;
  createdAt: string;
}

export default function InquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 👇 محو شدن خودکار پیغام‌ها
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const res = await fetch(`${API_URL}/public/inquiries/admin/${id}`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          setInquiry(json.data);
          setStatus(json.data.status);
          setNote(json.data.internalNote || "");
        } else {
          router.push("/admin/inquiries");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchInquiry();
  }, [id, router]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/public/inquiries/admin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internalNote: note }),
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.error?.message || "ذخیرهٔ تغییرات انجام نشد. دوباره تلاش کنید.",
        );
      }

      setSuccessMsg("تغییرات ذخیره شد");
      router.push("/admin/inquiries");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "ذخیرهٔ تغییرات انجام نشد.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching)
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  if (!inquiry) return null;

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/inquiries"
            className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center"
          >
            <ArrowRight size={18} />
          </Link>
          <h1 className="text-2xl font-black text-primary">جزئیات درخواست</h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          variant="primary"
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}{" "}
          ذخیره تغییرات
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2"
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <div className="mb-6 pb-6 border-b border-border">
              <h2 className="text-lg font-bold text-primary mb-2">
                موضوع: {inquiry.subject}
              </h2>
              <div className="flex items-center gap-3 text-xs text-foreground-muted">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />{" "}
                  {new Date(inquiry.createdAt).toLocaleDateString("fa-IR")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />{" "}
                  {new Date(inquiry.createdAt).toLocaleTimeString("fa-IR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="prose prose-slate max-w-none text-foreground-muted leading-[2] text-justify">
              <p>{inquiry.message}</p>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-accent" /> یادداشت داخلی
            </h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="یادداشت..."
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary">اطلاعات فرستنده</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <span className="text-[11px] text-foreground-muted block">
                  نام
                </span>
                <span className="font-bold text-primary">
                  {inquiry.fullName}
                </span>
              </li>
              <li>
                <span className="text-[11px] text-foreground-muted block">
                  نوع درخواست
                </span>
                <span className="font-bold text-primary">{inquiry.type}</span>
              </li>
              {inquiry.phone && (
                <li>
                  <span className="text-[11px] text-foreground-muted block">
                    تلفن
                  </span>
                  <a
                    href={`tel:${inquiry.phone}`}
                    className="font-bold text-primary hover:text-accent"
                    dir="ltr"
                  >
                    <Phone size={14} className="inline mr-1" />
                    {inquiry.phone}
                  </a>
                </li>
              )}
              {inquiry.email && (
                <li>
                  <span className="text-[11px] text-foreground-muted block">
                    ایمیل
                  </span>
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="font-bold text-primary hover:text-accent"
                    dir="ltr"
                  >
                    <Mail size={14} className="inline mr-1" />
                    {inquiry.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <CheckCircle2 size={16} className="text-accent" /> وضعیت پیگیری
            </h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
            >
              <option value="new">جدید</option>
              <option value="in_review">در حال بررسی</option>
              <option value="contacted">تماس گرفته شده</option>
              <option value="closed">بسته شده</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
