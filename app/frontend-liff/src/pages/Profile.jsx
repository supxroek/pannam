// src/pages/Profile.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLiffAuth } from "@/hooks/useLiffAuth";
import { LINE_LIFF_ID_RECORD_WATER } from "@/constants/line-liff";
import { fetchUserProfile, updateUserProfile } from "@/services/api";
import { getSafeIdToken, liffLogout } from "@/lib/liff";
import Navbar from "@/components/layout/Navbar";
import { toast } from "@/components/ui/toast";
import {
  User,
  Phone,
  CreditCard,
  Building,
  Home,
  ShieldCheck,
  Edit2,
  Check,
  X,
  RefreshCw,
  LogOut,
  Droplets,
  Receipt,
} from "lucide-react";

export default function Profile() {
  const { user, loading: authLoading, error: authError } = useLiffAuth(LINE_LIFF_ID_RECORD_WATER);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // แก้ไขเบอร์โทร
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  // ดึงข้อมูลโปรไฟล์
  const loadProfile = async () => {
    try {
      setLoading(true);
      const idToken = getSafeIdToken(user);
      if (!idToken) return;

      const data = await fetchUserProfile(idToken);
      setProfile(data);
      setPhoneInput(data?.phoneNumber || "");
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error(err.message || "ไม่สามารถดึงข้อมูลโปรไฟล์ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [loadProfile]);

  // บันทึกแก้ไขเบอร์โทร
  const handleSavePhone = async (e) => {
    e.preventDefault();
    const cleaned = String(phoneInput).replace(/[^0-9]/g, "");
    if (cleaned.length < 9 || cleaned.length > 10) {
      toast.error("เบอร์โทรศัพท์ต้องมีความยาว 9-10 หลัก");
      return;
    }

    try {
      setSavingPhone(true);
      const idToken = getSafeIdToken(user);
      await updateUserProfile({ phoneNumber: cleaned }, idToken);
      toast.success("อัปเดตเบอร์โทรศัพท์เรียบร้อย");
      setIsEditingPhone(false);
      loadProfile();
    } catch (err) {
      console.error("Update phone error:", err);
      toast.error(err.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    } finally {
      setSavingPhone(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-slate-600 font-medium">กำลังยืนยันตัวตน LINE...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 font-semibold mb-2">ไม่สามารถเข้าสู่ระบบ LINE ได้</p>
        <p className="text-slate-500 text-sm">{authError.message}</p>
      </div>
    );
  }

  const isReader = profile?.role === "METER_READER" || profile?.role === "VILLAGE_ADMIN";

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar title="ข้อมูลส่วนตัว" user={user} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">กำลังโหลดข้อมูลส่วนตัว...</p>
          </div>
        ) : !profile ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
            <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">ไม่พบข้อมูลโปรไฟล์</h4>
            <p className="text-xs text-slate-500">กรุณาลงทะเบียนหรือติดต่อผู้ดูแลระบบ</p>
          </div>
        ) : (
          <>
            {/* กล่องหัวโปรไฟล์ */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-xs border border-slate-100 space-y-3">
              <div className="relative w-20 h-20 mx-auto">
                {user?.pictureUrl ? (
                  <img
                    src={user.pictureUrl}
                    alt={profile.fullName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-200 shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600">
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">{profile.fullName}</h2>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-0.5 rounded-full ${
                      isReader
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {profile.role === "VILLAGE_ADMIN"
                      ? "ผู้ดูแลระบบหมู่บ้าน"
                      : profile.role === "METER_READER"
                      ? "ผู้จดมิเตอร์น้ำ"
                      : "ลูกบ้าน (สมาชิก)"}
                  </span>
                </div>
              </div>
            </div>

            {/* ข้อมูลประจำตัว */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 space-y-3.5 text-xs">
              <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
                รายละเอียดสมาชิก
              </h3>

              {/* บัตรประชาชน */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span>เลขบัตรประชาชน:</span>
                </div>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {profile.maskedNationalId}
                </span>
              </div>

              {/* เบอร์โทรศัพท์ */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>เบอร์โทรศัพท์:</span>
                </div>

                {isEditingPhone ? (
                  <form onSubmit={handleSavePhone} className="flex items-center gap-1.5">
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      maxLength={10}
                      className="border border-blue-300 rounded-lg px-2 py-1 text-xs w-28 text-slate-800 focus:outline-hidden"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={savingPhone}
                      className="p-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingPhone(false)}
                      className="p-1 bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">
                      {profile.formattedPhone}
                    </span>
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="text-blue-600 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                      title="แก้ไขเบอร์โทรศัพท์"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* หมู่บ้าน */}
              <div className="flex items-start justify-between py-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span>หมู่บ้าน:</span>
                </div>
                <span className="font-semibold text-slate-800 text-right max-w-50">
                  {profile.village?.address || "-"}
                </span>
              </div>
            </div>

            {/* รายการบ้านที่ผูกไว้ */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 space-y-3">
              <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>บ้านในความครอบครอง</span>
                <span className="text-xs text-slate-400 font-normal">
                  {profile.properties?.length || 0} หลัง
                </span>
              </h3>

              {profile.properties?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">ไม่มีข้อมูลบ้านที่ผูกกับบัญชี</p>
              ) : (
                <div className="space-y-2">
                  {profile.properties?.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="font-bold text-slate-800">บ้านเลขที่ {p.houseNumber}</span>
                          {p.zone && (
                            <span className="text-slate-500 ml-1.5">(โซน {p.zone})</span>
                          )}
                        </div>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        มิเตอร์: {p.meterCode || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* เมนูลัดตามสิทธิ์ */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 px-1 mb-2">เมนูการใช้งาน</h4>

              {isReader ? (
                <>
                  <Link
                    to="/record-water"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <span>เปิดหน้าบันทึกการจดมิเตอร์น้ำ</span>
                    </div>
                  </Link>

                  <Link
                    to="/record-payment"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-4 h-4 text-green-600" />
                      <span>เปิดหน้าบันทึกการรับเงินสด</span>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/water-usage"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <span>ดูข้อมูลการใช้น้ำ & สแกนจ่าย</span>
                    </div>
                  </Link>

                  <Link
                    to="/water-history"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      <span>ดูประวัติการใช้น้ำ & กราฟ</span>
                    </div>
                  </Link>
                </>
              )}
            </div>

            {/* ปุ่มออกจากระบบ */}
            <div className="pt-2">
              <button
                onClick={liffLogout}
                className="w-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ LINE
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
