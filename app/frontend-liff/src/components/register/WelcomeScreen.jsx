import PANNAM_ICON from "../../assets/PANNAM-LOGO.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faUser,
  faIdCard,
  faPhone,
  faShieldHalved,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";

export default function WelcomeScreen({ onStart, user }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-6 animate-fade-in-up">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="h-38 w-auto mx-auto rounded-3xl flex items-center justify-center">
            <img src={PANNAM_ICON} className="w-56 h-56 " alt="PANNAM" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">
            ยินดีต้อนรับสู่
            <br />
            <span className="text-[#2563eb]">PANNAM</span>
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            ระบบจัดการน้ำสำหรับชุมชน
            <br />
            ลงทะเบียนเพื่อเริ่มใช้งาน
          </p>
        </div>

        {/* LINE User Profile Badge */}
        {user && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex items-center gap-3">
            {user.pictureUrl ? (
              <img
                src={user.pictureUrl}
                alt={user.displayName}
                className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base shrink-0">
                {user.displayName?.charAt(0) || 'L'}
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] text-slate-400 font-medium">
                  เข้าสู่ระบบ LINE แล้ว
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user.displayName || 'ผู้ใช้งาน LINE'}
              </p>
            </div>
          </div>
        )}

        {/* Preparation Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200 mb-8">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FontAwesomeIcon
              icon={faClipboardList}
              className="text-[#2563eb]"
            />
            ข้อมูลที่ต้องเตรียม
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-[#2563eb] text-sm"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  ข้อมูลส่วนตัว
                </p>
                <p className="text-xs text-slate-400">
                  ชื่อ-นามสกุล และวันเกิด
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                <FontAwesomeIcon
                  icon={faIdCard}
                  className="text-sky-500 text-sm"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  ข้อมูลบัตรประชาชน
                </p>
                <p className="text-xs text-slate-400">เลขบัตรประชาชน 13 หลัก</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-amber-500 text-sm"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  เบอร์โทรศัพท์
                </p>
                <p className="text-xs text-slate-400">
                  สำหรับติดต่อและยืนยันตัวตน
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-violet-500 text-sm"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  ข้อมูลที่อยู่
                </p>
                <p className="text-xs text-slate-400">
                  หมู่บ้าน บ้านเลขที่ และโซน
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-blue-50 rounded-xl p-4 mb-8 border border-blue-100">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon
              icon={faShieldHalved}
              className="text-[#2563eb] mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-[#1e3a8a]">
                ข้อมูลของคุณปลอดภัย
              </p>
              <p className="text-xs text-[#1e40af] mt-1">
                ข้อมูลทั้งหมดถูกเก็บเป็นความลับและใช้เฉพาะภายในระบบ PANNAM
                เท่านั้น
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={onStart}
          className="w-full text-white font-semibold py-6 rounded-2xl shadow-lg hover:scale-98 hover:ring-2 hover:ring-blue-900 text-lg flex items-center justify-center gap-2"
        >
          <span>เริ่มลงทะเบียน</span>
          <FontAwesomeIcon icon={faArrowRight} className="text-white text-sm" />
        </Button>
        <p className="text-center text-xs text-slate-400 mt-4">
          ใช้เวลาประมาณ 2-3 นาที
        </p>
      </div>
    </div>
  );
}
