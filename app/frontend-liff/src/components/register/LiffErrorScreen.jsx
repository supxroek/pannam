import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LiffErrorScreen({ error }) {
  const errorMessage =
    error?.message ||
    (typeof error === "string" ? error : "ไม่สามารถเชื่อมต่อกับ LINE ได้");

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center animate-fade-in-up flex flex-col items-center">
        {/* Error Icon */}

        <div className=" bg-red-500 text-white p-2 rounded-full shadow-lg flex items-center justify-center mb-6">
          <AlertCircle className="size-5" />
        </div>

        {/* Error Title & Description */}
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          ไม่สามารถเชื่อมต่อ LINE ได้
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์การเข้าใช้งานผ่าน LINE
          กรุณาลองใหม่อีกครั้ง หรือเปิดใช้งานผ่านแอปพลิเคชัน LINE
        </p>

        {/* Error Detail Callout */}
        <div className="w-full bg-red-50 text-red-700 text-xs rounded-2xl p-4 border border-red-100 text-left mb-6 wrap-break-word font-mono">
          <p className="font-semibold mb-1 text-red-800 font-sans">
            รายละเอียดข้อผิดพลาด:
          </p>
          <p className="opacity-90">{errorMessage}</p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full py-5 rounded-2xl text-slate-600 text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="size-4" />
            <span>รีโหลดหน้าเว็บ</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
