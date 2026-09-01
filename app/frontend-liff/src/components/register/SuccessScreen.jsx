import { villages } from '../../constants/registerData';

export default function SuccessScreen({ data, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 animate-fade-in-up">
      <div className="w-full max-w-sm text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-[#4ade80] to-[#16a34a] rounded-full flex items-center justify-center shadow-xl shadow-green-200">
          <i className="fas fa-check text-white text-4xl"></i>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          ลงทะเบียนสำเร็จ!
        </h1>
        <p className="text-slate-500 text-base leading-relaxed mb-8">
          ข้อมูลของคุณถูกส่งเรียบร้อยแล้ว
          <br />
          กรุณารอการอนุมัติจากผู้ดูแลระบบ
        </p>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200 mb-8 text-left">
          <h3 className="font-semibold text-slate-800 mb-4 text-center">
            สรุปข้อมูลที่ลงทะเบียน
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-400">ชื่อ-นามสกุล</span>
              <span className="text-sm font-medium text-slate-800">
                {data.firstName} {data.lastName}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-400">เลขบัตรประชาชน</span>
              <span className="text-sm font-medium text-slate-800 font-mono">
                {data.idCard}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-400">เบอร์โทรศัพท์</span>
              <span className="text-sm font-medium text-slate-800">
                {data.phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">ที่อยู่</span>
              <span className="text-sm font-medium text-slate-800 text-right">
                {villages.find((v) => v.id === data.village)?.name}
                <br />
                บ้านเลขที่ {data.houseNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Processing Time Info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-8 border border-blue-100">
          <div className="flex items-start gap-3">
            <i className="fas fa-clock text-[#2563eb] mt-0.5"></i>
            <div className="text-left">
              <p className="text-sm font-medium text-[#1e3a8a]">ระยะเวลาดำเนินการ</p>
              <p className="text-xs text-[#1e40af] mt-1">
                การอนุมัติใช้เวลาประมาณ 1-2 วันทำการ
                คุณจะได้รับการแจ้งเตือนผ่าน LINE เมื่ออนุมัติเสร็จสิ้น
              </p>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="w-full bg-white border-2 border-slate-200 text-slate-600 font-semibold py-4 rounded-2xl hover:border-[#60a5fa] hover:text-[#1e40af] active:scale-[0.98] transition-all duration-200 text-lg cursor-pointer"
        >
          ลงทะเบียนใหม่
        </button>
      </div>
    </div>
  );
}
