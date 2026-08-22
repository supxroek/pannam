import { useState } from "react";
import PANNAM from "../assets/PANNAM.png";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    houseNumber: "",
    zone: "",
    village: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `ลงทะเบียนสำเร็จ!\nชื่อ: ${formData.fullName}\nบ้านเลขที่: ${formData.houseNumber}`,
    );
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 font-sans antialiased text-slate-800">
      {/* การ์ดหลัก */}
      <div className="bg-white rounded-3xl px-6 pb-6 shadow-sm border border-slate-100 transition-all">
        {/* ส่วนหัวข้อ (Header Section) */}
        <div className="text-center mb-7">
          <div className="flex justify-center">
            <img src={PANNAM} alt="PANNAM" className="w-32 h-32" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            ลงทะเบียน PANNAM
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 leading-normal">
            กรอกข้อมูลเพื่อเชื่อมต่อระบบเช็คค่าน้ำประปา
          </p>
        </div>

        {/* แบบฟอร์มลงทะเบียน */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* หมวดที่ 1: ข้อมูลผู้ใช้งาน */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ข้อมูลส่วนตัว
              </h2>
            </div>

            {/* 1.1 ชื่อ-นามสกุล */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-slate-700"
              >
                ชื่อ - นามสกุล <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
                  👤
                </span>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="เช่น สมชาย ใจดี"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-base focus:bg-white focus:border-[#06C755] focus:ring-4 focus:ring-emerald-50 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* 1.2 เบอร์โทรศัพท์ */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-slate-700"
              >
                เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
                  📞
                </span>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="เช่น 0812345678"
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-base focus:bg-white focus:border-[#06C755] focus:ring-4 focus:ring-emerald-50 outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* หมวดที่ 2: ข้อมูลที่อยู่ / มิเตอร์ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ข้อมูลที่พักอาศัย
              </h2>
            </div>

            {/* 2.1 หมู่บ้าน / ชุมชน */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="village"
                className="text-sm font-medium text-slate-700"
              >
                หมู่บ้าน / ชุมชน <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
                  🏢
                </span>
                <input
                  id="village"
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="เช่น หมู่บ้านสุขใจ"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-base focus:bg-white focus:border-[#06C755] focus:ring-4 focus:ring-emerald-50 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* จัด Layout แนวนอนสำหรับ บ้านเลขที่ และ โซน */}
            <div className="grid grid-cols-2 gap-3">
              {/* 2.2 บ้านเลขที่ */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="houseNumber"
                  className="text-sm font-medium text-slate-700"
                >
                  บ้านเลขที่ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
                    🏠
                  </span>
                  <input
                    id="houseNumber"
                    type="text"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleChange}
                    placeholder="เช่น 99/1"
                    required
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-base focus:bg-white focus:border-[#06C755] focus:ring-4 focus:ring-emerald-50 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* 2.3 โซน */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="zone"
                  className="text-sm font-medium text-slate-700"
                >
                  โซน / เขต <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="zone"
                    name="zone"
                    value={formData.zone}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base focus:bg-white focus:border-[#06C755] focus:ring-4 focus:ring-emerald-50 outline-none transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      เลือกโซน
                    </option>
                    <option value="A">โซน A (เหนือ)</option>
                    <option value="B">โซน B (ใต้)</option>
                    <option value="C">โซน C (ออก)</option>
                    <option value="D">โซน D (ตก)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ปุ่ม Submit และ ข้อความ Security */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#06C755] hover:bg-[#05b34c] active:scale-[0.99] text-white font-semibold rounded-2xl text-base shadow-sm shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ยืนยันการลงทะเบียน</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <p className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mt-3.5">
              <span>🔒</span> ข้อมูลปลอดภัยและเชื่อมต่อกับระบบน้ำประปาปันน้ำ
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
