// src/pages/RecordWater.jsx

import { useState, useEffect, useMemo } from "react";
import { useLiffAuth } from "@/hooks/useLiffAuth";
import { LINE_LIFF_ID_RECORD_WATER } from "@/constants/line-liff";
import { fetchPropertiesForReading, recordMeterReadingApi } from "@/services/api";
import { compressImage } from "@/utils/image-compressor";
import { getSafeIdToken } from "@/lib/liff";
import Navbar from "@/components/layout/Navbar";
import { toast } from "@/components/ui/toast";
import {
  Search,
  Camera,
  CheckCircle2,
  Clock,
  Droplets,
  X,
  RefreshCw,
  Home,
  Check,
} from "lucide-react";

// สำหรับทดสอบ useLiffAuth เพื่อไม่ให้หน้าเว็บทำการ Login จริง
import { TEST_useLiffAuth } from '@/constants/registerData';

export default function RecordWater() {
  const { user, loading: authLoading, error: authError } = useLiffAuth(LINE_LIFF_ID_RECORD_WATER);

  // สำหรับการพัฒนาใน Local (Mock LIFF):
  // =========================================================================
  // const { users: user, loading: authLoading, error: authError } = TEST_useLiffAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");

  // ฟอร์มบันทึก
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentReading, setCurrentReading] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // ดึงรายชื่อบ้าน
  const loadProperties = async () => {
    try {
      setLoading(true);
      const idToken = getSafeIdToken(user);
      if (!idToken) return;

      const data = await fetchPropertiesForReading(idToken);
      setProperties(data || []);
    } catch (err) {
      console.error("Failed to load properties:", err);
      toast.error(err.message || "ไม่สามารถโหลดรายชื่อบ้านได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [loadProperties]);

  // รายการโซนที่ไม่ซ้ำกัน
  const zones = useMemo(() => {
    const set = new Set();
    properties.forEach((p) => {
      if (p.zone) set.add(p.zone);
    });
    return Array.from(set);
  }, [properties]);

  // กรองบ้านตามคำค้นหาและโซน
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch =
        p.houseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.meterCode?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchZone = selectedZone === "all" || p.zone === selectedZone;
      return matchSearch && matchZone;
    });
  }, [properties, searchTerm, selectedZone]);

  // สถิติภาพรวม
  const stats = useMemo(() => {
    const total = properties.length;
    const read = properties.filter((p) => p.isReadThisMonth).length;
    const unread = total - read;
    return { total, read, unread };
  }, [properties]);

  // เมื่อเลือกบ้าน
  const handleSelectProperty = (prop) => {
    setSelectedProperty(prop);
    setCurrentReading(prop.isReadThisMonth ? String(prop.latestReading?.currentReading || "") : "");
    setImagePreview(prop.latestReading?.imageUrl || null);
    setImageDataUrl(prop.latestReading?.imageUrl || null);
    setSuccessData(null);
  };

  // การคำนวณหน่วยน้ำ
  const previousVal = selectedProperty ? Number(selectedProperty.previousReading || 0) : 0;
  const currentVal = Number(currentReading);
  const calculatedConsumption =
    !isNaN(currentVal) && currentVal >= previousVal ? currentVal - previousVal : 0;

  // จัดการอัปโหลด/ถ่ายรูป
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.7,
      });
      setImagePreview(compressedDataUrl);
      setImageDataUrl(compressedDataUrl);
      toast.success("ประมวลผลรูปภาพเรียบร้อย");
    } catch (err) {
      console.error("Image compression error:", err);
      toast.error("ไม่สามารถประมวลผลรูปภาพได้: " + err.message);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageDataUrl(null);
  };

  // ส่งบันทึกข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProperty) return;

    if (isNaN(currentVal) || currentVal < previousVal) {
      toast.error(`เลขมิเตอร์ปัจจุบันต้องไม่น้อยกว่าเลขครั้งก่อน (${previousVal})`);
      return;
    }

    try {
      setSubmitting(true);
      const idToken = getSafeIdToken(user);

      const payload = {
        propertyId: selectedProperty.id,
        currentReading: currentVal,
        imageUrl: imageDataUrl || "",
      };

      const result = await recordMeterReadingApi(payload, idToken);
      setSuccessData(result);
      toast.success("บันทึกค่าน้ำเรียบร้อยแล้ว");

      // โหลดข้อมูลใหม่ในเบื้องหลัง
      loadProperties();
    } catch (err) {
      console.error("Submit meter reading error:", err);
      toast.error(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar title="บันทึกการใช้น้ำ (ผู้จดมิเตอร์)" user={user} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* สรุปภาพรวมความคืบหน้า */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">ความคืบหน้ารอบเดือนนี้</span>
            <span className="text-xs font-bold text-blue-600">
              {stats.total > 0 ? Math.round((stats.read / stats.total) * 100) : 0}%
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.total > 0 ? (stats.read / stats.total) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">ทั้งหมด</span>
              <span className="font-bold text-slate-800 text-sm">{stats.total} หลัง</span>
            </div>
            <div className="bg-green-50 p-2 rounded-xl border border-green-100">
              <span className="text-green-600 block mb-0.5">จดแล้ว</span>
              <span className="font-bold text-green-700 text-sm">{stats.read} หลัง</span>
            </div>
            <div className="bg-orange-50 p-2 rounded-xl border border-orange-100">
              <span className="text-orange-600 block mb-0.5">คงเหลือ</span>
              <span className="font-bold text-orange-700 text-sm">{stats.unread} หลัง</span>
            </div>
          </div>
        </div>

        {/* กล่องบันทึกข้อมูล (เมื่อเลือกบ้าน) */}
        {selectedProperty ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-lg">
                    บ้านเลขที่ {selectedProperty.houseNumber}
                  </h3>
                  {selectedProperty.zone && (
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      โซน {selectedProperty.zone}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  รหัสมิเตอร์: {selectedProperty.meterCode || "-"}
                </p>
              </div>

              <button
                onClick={() => setSelectedProperty(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                title="เปลี่ยนบ้าน"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successData ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">บันทึกค่าน้ำเรียบร้อยแล้ว</h4>
                <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600 max-w-xs mx-auto">
                  <p>หน่วยน้ำที่ใช้: <span className="font-bold text-slate-800">{successData.consumption} หน่วย</span></p>
                  <p>ยอดสุทธิ: <span className="font-bold text-blue-600">฿{Number(successData.totalAmount || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span></p>
                </div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium text-sm transition-colors mt-4"
                >
                  จดบ้านหลังถัดไป
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* เลขมิเตอร์ครั้งก่อน */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">เลขมิเตอร์ครั้งก่อน</span>
                  <span className="font-bold text-slate-700 text-base">
                    {previousVal.toLocaleString("th-TH", { minimumFractionDigits: 0 })}
                  </span>
                </div>

                {/* กรอกเลขมิเตอร์ปัจจุบัน */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    เลขมิเตอร์ปัจจุบัน (จดวันนี้) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      min={previousVal}
                      value={currentReading}
                      onChange={(e) => setCurrentReading(e.target.value)}
                      placeholder={`ต้องไม่น้อยกว่า ${previousVal}`}
                      className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold text-base transition-all"
                    />
                    <span className="absolute right-3.5 top-3 text-xs text-slate-400">หน่วย</span>
                  </div>
                </div>

                {/* คำนวณจำนวนหน่วย */}
                <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-900">หน่วยที่ใช้รอบนี้</span>
                  </div>
                  <span className="text-base font-bold text-blue-700">
                    {calculatedConsumption.toLocaleString("th-TH")} หน่วย
                  </span>
                </div>

                {/* ถ่ายภาพมิเตอร์น้ำ */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    รูปถ่ายหน้าปัดมิเตอร์ (ไม่บังคับ)
                  </label>

                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={imagePreview}
                        alt="Meter Preview"
                        className="w-full h-44 object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                      <Camera className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-1.5 transition-colors" />
                      <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">
                        แตะเพื่อถ่ายรูปหรือเลือกภาพมิเตอร์
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        ระบบจะบีบอัดรูปภาพให้อัตโนมัติ
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* ปุ่มบันทึก */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || isNaN(currentVal) || currentVal < previousVal}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-3 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        กำลังบันทึกและคำนวณเงิน...
                      </>
                    ) : (
                      "ยืนยันบันทึกค่าน้ำ & ออกบิล"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : null}

        {/* ค้นหาและตัวกรองโซน */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาบ้านเลขที่ หรือรหัสมิเตอร์..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
          </div>

          {/* ปุ่มสลับโซน */}
          {zones.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedZone("all")}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedZone === "all"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                ทุกโซน ({properties.length})
              </button>
              {zones.map((zone) => {
                const count = properties.filter((p) => p.zone === zone).length;
                return (
                  <button
                    key={zone}
                    onClick={() => setSelectedZone(zone)}
                    className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                      selectedZone === zone
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    โซน {zone} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* รายการบ้าน */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>รายการบ้าน ({filteredProperties.length})</span>
            <span>แตะเพื่อเลือกจดมิเตอร์</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">กำลังโหลดรายชื่อบ้าน...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
              <Home className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">ไม่พบบ้านที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredProperties.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => handleSelectProperty(prop)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedProperty?.id === prop.id
                      ? "bg-blue-50/60 border-blue-300 shadow-xs"
                      : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-2xs"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">
                        บ้าน {prop.houseNumber}
                      </span>
                      {prop.zone && (
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          โซน {prop.zone}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      เลขครั้งก่อน: {prop.previousReading} หน่วย
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {prop.isReadThisMonth ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        จดแล้ว
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                        <Clock className="w-3.5 h-3.5" />
                        รอจด
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
