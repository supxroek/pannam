// src/components/layout/Navbar.jsx

import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";

/**
 * Navigation Bar ด้านบนสำหรับหน้าเว็บแอปพลิเคชัน LIFF
 *
 * @param {Object} props
 * @param {string} props.title - หัวข้อหน้าปัจจุบัน
 * @param {string} [props.backTo] - เส้นทางย้อนกลับ (หากไม่ระบุจะใช้ history.back)
 * @param {boolean} [props.hideBack=false] - ซ่อนปุ่มย้อนกลับ
 * @param {Object} [props.user] - ข้อมูลผู้ใช้สำหรับแสดงรูปโปรไฟล์
 */
export default function Navbar({ title, backTo, hideBack = false, user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const isProfilePage = location.pathname === "/profile";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 shadow-xs">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-2">
          {!hideBack && (
            <button
              onClick={handleBack}
              className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              aria-label="ย้อนกลับ"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-800 text-base line-clamp-1">
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isProfilePage && (
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-1.5 p-1 rounded-full text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              title="ข้อมูลส่วนตัว"
            >
              {user?.pictureUrl ? (
                <img
                  src={user.pictureUrl}
                  alt={user.displayName || "Profile"}
                  className="w-7 h-7 rounded-full object-cover border border-blue-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <User className="w-4 h-4" />
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
