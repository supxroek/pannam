import PANNAM_ICON from '../../assets/PANNAM-LOGO.png';
import { Loader2, ShieldCheck, MessageCircle } from 'lucide-react';

export default function LiffLoadingScreen({ loading = false }) {
  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center animate-fade-in-up flex flex-col items-center">
        {/* Logo with Soft Pulse */}
        <div className='flex flex-col items-center mb-6'>
          <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center">
            <img
              src={PANNAM_ICON}
              alt="PANNAM"
              className="w-38 h-38 object-cover drop-shadow-md animate-pulse-soft"
            />
          </div>
          {/* Status Badge */}
          {/* bg-emerald-500 text-white text-[11px] font-semibold w-fit px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 */}
          <div className="bg-emerald-500 text-white text-[11px] font-semibold w-fit px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <MessageCircle className="size-3" />
            <span>LINE LIFF</span>
          </div>
        </div>

        {/* Dynamic Title & Description */}
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {loading
            ? 'กำลังนำท่านไปยังหน้า Login LINE'
            : 'กำลังเชื่อมต่อระบบ PANNAM'}
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-8 px-2">
          {loading
            ? 'กรุณารอสักครู่ ระบบกำลังพาคุณไปยืนยันตัวตนผ่านบัญชี LINE...'
            : 'กำลังตรวจสอบสิทธิ์การเข้าใช้งานผ่าน LINE...'}
        </p>

        {/* Loading Spinner & Progress bar */}
        <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span>
              {loading ? 'กำลังเปลี่ยนเส้นทาง...' : 'กำลังประมวลผลข้อมูล...'}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
          <span>เชื่อมต่ออย่างปลอดภัยตามมาตรฐาน LINE</span>
        </div>
      </div>
    </div>
  );
}
