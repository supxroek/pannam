import { villages, zones, thaiMonths } from '../../constants/registerData';

export default function Step4Review({ data, onBack, onSubmit, loading }) {
  const getVillageName = (id) =>
    villages.find((v) => v.id === id)?.name || '-';
  const getZoneName = (id) => zones[id] || '-';
  const getMonthName = (idx) => thaiMonths[idx] || '-';

  return (
    <div className="animate-slide-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">ตรวจสอบข้อมูล</h2>
        <p className="text-slate-500 text-sm">กรุณาตรวจสอบความถูกต้องก่อนยืนยัน</p>
      </div>
      <div className="space-y-4">
        {/* Personal Info Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <i className="fas fa-user text-[#2563eb]"></i>
              ข้อมูลส่วนตัว
            </h3>
            <button
              onClick={() => onBack(0)}
              className="text-sm text-[#2563eb] font-medium hover:text-[#1e40af] flex items-center gap-1 cursor-pointer"
            >
              <i className="fas fa-pen text-xs"></i>
              แก้ไข
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">ชื่อ-นามสกุล</span>
              <span className="text-sm font-medium text-slate-800">
                {data.firstName || '-'} {data.lastName || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">วันเกิด</span>
              <span className="text-sm font-medium text-slate-800">
                {data.birthDay
                  ? `${data.birthDay} ${getMonthName(parseInt(data.birthMonth))} ${parseInt(data.birthYear) + 543}`
                  : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <i className="fas fa-id-card text-sky-500"></i>
              ข้อมูลติดต่อ
            </h3>
            <button
              onClick={() => onBack(1)}
              className="text-sm text-[#2563eb] font-medium hover:text-[#1e40af] flex items-center gap-1 cursor-pointer"
            >
              <i className="fas fa-pen text-xs"></i>
              แก้ไข
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">เลขบัตรประชาชน</span>
              <span className="text-sm font-medium text-slate-800 font-mono">
                {data.idCard || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">เบอร์โทรศัพท์</span>
              <span className="text-sm font-medium text-slate-800">
                {data.phone || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Address Info Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <i className="fas fa-location-dot text-violet-500"></i>
              ข้อมูลที่อยู่
            </h3>
            <button
              onClick={() => onBack(2)}
              className="text-sm text-[#2563eb] font-medium hover:text-[#1e40af] flex items-center gap-1 cursor-pointer"
            >
              <i className="fas fa-pen text-xs"></i>
              แก้ไข
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">หมู่บ้าน</span>
              <span className="text-sm font-medium text-slate-800">
                {getVillageName(data.village)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">บ้านเลขที่</span>
              <span className="text-sm font-medium text-slate-800">
                {data.houseNumber || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">โซน</span>
              <span className="text-sm font-medium text-slate-800">
                {getZoneName(data.zone)}
              </span>
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <i className="fas fa-circle-info text-[#2563eb] mt-0.5"></i>
            <p className="text-sm text-[#1e3a8a]">
              เมื่อกดยืนยัน ข้อมูลของคุณจะถูกส่งไปยังระบบ PANNAM
              เพื่อตรวจสอบและอนุมัติการใช้งาน
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full bg-linear-to-r from-[#3b82f6] to-[#1e40af] text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 active:scale-[0.98] transition-all duration-200 text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <i className="fas fa-circle-notch animate-spin"></i>
              <span>กำลังดำเนินการ...</span>
            </>
          ) : (
            <>
              <span>ยืนยันการลงทะเบียน</span>
              <i className="fas fa-check"></i>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
