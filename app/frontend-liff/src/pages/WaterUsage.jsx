// src/pages/WaterUsage.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLiffAuth } from "@/hooks/useLiffAuth";
import { LINE_LIFF_ID_WATER_USAGE } from "@/constants/line-liff";
import { fetchMyProperties, fetchCurrentBill, submitPaymentSlipApi } from "@/services/api";
import { compressImage } from "@/utils/image-compressor";
import { getSafeIdToken } from "@/lib/liff";
import Navbar from "@/components/layout/Navbar";
import { toast } from "@/components/ui/toast";
import {
  Droplets,
  Home,
  CreditCard,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  X,
  RefreshCw,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

// สำหรับทดสอบ useLiffAuth เพื่อไม่ให้หน้าเว็บทำการ Login จริง
import { TEST_useLiffAuth } from '@/constants/registerData';

export default function WaterUsage() {
  const { user, loading: authLoading, error: authError } = useLiffAuth(LINE_LIFF_ID_WATER_USAGE);

  // สำหรับการพัฒนาใน Local (Mock LIFF):
  // =========================================================================
  // const { users: user, loading: authLoading, error: authError } = TEST_useLiffAuth();

  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);

  // อัปโหลดสลิป
  const [slipPreview, setSlipPreview] = useState(null);
  const [slipDataUrl, setSlipDataUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // โหลดรายการบ้าน
  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const idToken = getSafeIdToken(user);
        if (!idToken) return;

        const myProps = await fetchMyProperties(idToken);
        setProperties(myProps || []);
        if (myProps?.length > 0) {
          setSelectedPropertyId(myProps[0].id);
        }
      } catch (err) {
        console.error("Load properties error:", err);
        toast.error(err.message || "ไม่สามารถดึงข้อมูลบ้านได้");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadProperties();
    }
  }, [user]);

  // โหลดบิลของบ้านที่เลือก
  const loadBill = async (propertyId) => {
    if (!propertyId) return;
    try {
      setLoading(true);
      const idToken = getSafeIdToken(user);
      const data = await fetchCurrentBill(propertyId, idToken);
      setBillData(data);
      setSlipPreview(null);
      setSlipDataUrl(null);
    } catch (err) {
      console.error("Load bill error:", err);
      toast.error(err.message || "ไม่สามารถดึงข้อมูลค่าน้ำได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPropertyId && user) {
      loadBill(selectedPropertyId);
    }
  }, [selectedPropertyId, user]);

  // คัดลอกเลขบัญชี
  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("คัดลอกลงคลิปบอร์ดแล้ว");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // จัดการอัปโหลดสลิป
  const handleSlipChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.7,
      });
      setSlipPreview(compressed);
      setSlipDataUrl(compressed);
      toast.success("ประมวลผลรูปสลิปเรียบร้อย");
    } catch (err) {
      console.error("Slip compression error:", err);
      toast.error("ไม่สามารถประมวลผลรูปภาพได้: " + err.message);
    }
  };

  // ส่งสลิป
  const handleSubmitSlip = async () => {
    if (!billData?.invoice?.id || !slipDataUrl) {
      toast.error("กรุณาเลือกรูปภาพสลิป");
      return;
    }

    try {
      setUploading(true);
      const idToken = getSafeIdToken(user);
      await submitPaymentSlipApi(billData.invoice.id, slipDataUrl, idToken);
      toast.success("แนบสลิปเรียบร้อยแล้ว รอเจ้าหน้าที่ตรวจสอบ");
      loadBill(selectedPropertyId);
    } catch (err) {
      console.error("Submit slip error:", err);
      toast.error(err.message || "เกิดข้อผิดพลาดในการแนบสลิป");
    } finally {
      setUploading(false);
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

  const invoice = billData?.invoice;
  const reading = billData?.reading;
  const paymentInfo = billData?.paymentInfo;

  const isPaid = invoice?.paymentStatus === "PAID_CASH" || invoice?.paymentStatus === "PAID_ONLINE";
  const isVerifying = invoice?.paymentStatus === "VERIFYING";

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar title="ข้อมูลการใช้น้ำ (ลูกบ้าน)" user={user} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* ตัวเลือกสลับบ้าน (กรณีมีหลายหลัง) */}
        {properties.length > 1 && (
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Home className="w-4 h-4 text-blue-600 shrink-0" />
              <span>เลือกบ้าน:</span>
            </div>
            <select
              value={selectedPropertyId || ""}
              onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  บ้านเลขที่ {p.houseNumber} {p.zone ? `(โซน ${p.zone})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">กำลังโหลดข้อมูลค่าน้ำ...</p>
          </div>
        ) : !invoice ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 space-y-3">
            <Droplets className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">ยังไม่มีข้อมูลบิลค่าน้ำ</h4>
            <p className="text-xs text-slate-500">
              เจ้าหน้าที่ยังไม่ได้บันทึกการอ่านมิเตอร์น้ำสำหรับรอบบิลปัจจุบัน
            </p>
          </div>
        ) : (
          <>
            {/* กล่องสรุปบิลค่าน้ำ */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">บิลประจำรอบเดือน</span>
                  <h2 className="text-lg font-bold text-slate-800">{reading?.readingMonth}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    บ้านเลขที่ {billData?.property?.houseNumber} {billData?.property?.zone ? `(โซน ${billData.property.zone})` : ""}
                  </p>
                </div>

                {isPaid ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ชำระแล้ว
                  </span>
                ) : isVerifying ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <Clock className="w-3.5 h-3.5" />
                    รอตรวจสอบ
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    <AlertCircle className="w-3.5 h-3.5" />
                    รอชำระเงิน
                  </span>
                )}
              </div>

              {/* ยอดเงินสุทธิ */}
              <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                <span className="text-xs text-slate-400 block mb-1">ยอดเงินที่ต้องชำระ</span>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  ฿{invoice.totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  ครบกำหนดชำระ: <span className="font-semibold text-slate-700">{invoice.dueDateFormatted}</span>
                </p>
              </div>

              {/* รายละเอียดการใช้น้ำ */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>เลขมิเตอร์ครั้งก่อน:</span>
                  <span className="font-semibold text-slate-800">{reading?.previousReading} หน่วย</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>เลขมิเตอร์ปัจจุบัน:</span>
                  <span className="font-semibold text-slate-800">{reading?.currentReading} หน่วย</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ปริมาณน้ำที่ใช้:</span>
                  <span className="font-bold text-blue-600">{reading?.consumption} หน่วย</span>
                </div>

                <div className="border-t border-dashed border-slate-200 my-2 pt-2 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>ค่าน้ำประปา:</span>
                    <span>฿{invoice.waterAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {invoice.serviceFee > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>ค่าบริการทั่วไป:</span>
                      <span>฿{invoice.serviceFee.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {invoice.fineAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>ค่าปรับล่าช้า:</span>
                      <span>฿{invoice.fineAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ช่องทางชำระเงิน & แนบสลิป (เฉพาะบิลที่ยังไม่ชำระ) */}
            {!isPaid && (
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-sm">ช่องทางและวิธีการชำระเงิน</h3>
                </div>

                {/* โอนธนาคาร */}
                {paymentInfo?.bankProvider && paymentInfo?.bankNumber && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">🏦 โอนผ่านบัญชีธนาคาร</span>
                      <span className="text-slate-500">{paymentInfo.bankProvider}</span>
                    </div>

                    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {paymentInfo.bankNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(paymentInfo.bankNumber, "bank")}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium text-xs cursor-pointer"
                      >
                        {copiedField === "bank" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedField === "bank" ? "คัดลอกแล้ว" : "คัดลอก"}
                      </button>
                    </div>

                    {paymentInfo.bankPayeeName && (
                      <p className="text-[11px] text-slate-500">
                        ชื่อบัญชี: <span className="font-medium text-slate-700">{paymentInfo.bankPayeeName}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* พร้อมเพย์ QR */}
                {paymentInfo?.enablePromptpay && paymentInfo?.promptpayNo && (
                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900">📱 พร้อมเพย์ (PromptPay)</span>
                      <span className="text-emerald-700 font-mono font-semibold">{paymentInfo.promptpayNo}</span>
                    </div>

                    {paymentInfo.promptpayImage && (
                      <div className="bg-white p-3 rounded-xl border border-emerald-100 text-center max-w-50 mx-auto">
                        <img
                          src={paymentInfo.promptpayImage}
                          alt="PromptPay QR"
                          className="w-full aspect-square object-contain mx-auto"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">สแกนเพื่อจ่ายเงิน</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ฟอร์มแนบสลิป */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    แนบหลักฐานการโอนเงิน (สลิป)
                  </label>

                  {slipPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200">
                      <img src={slipPreview} alt="Slip Preview" className="w-full h-48 object-cover" />
                      <button
                        onClick={() => { setSlipPreview(null); setSlipDataUrl(null); }}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-1.5 transition-colors" />
                      <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">
                        แตะเพื่อเลือกรูปภาพสลิป
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        ระบบจะปรับขนาดภาพให้อัตโนมัติ
                      </span>
                      <input type="file" accept="image/*" onChange={handleSlipChange} className="hidden" />
                    </label>
                  )}

                  <button
                    onClick={handleSubmitSlip}
                    disabled={uploading || !slipDataUrl}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        กำลังส่งสลิป...
                      </>
                    ) : (
                      "ส่งสลิปแจ้งชำระเงิน"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ลิงก์ไปหน้าประวัติ */}
            <Link
              to={`/water-history${selectedPropertyId ? `?propertyId=${selectedPropertyId}` : ""}`}
              className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex items-center justify-between hover:border-blue-200 transition-colors text-slate-700 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-800 block">ดูประวัติการใช้น้ำ & กราฟ</span>
                  <span className="text-[11px] text-slate-400">สถิติย้อนหลังและแนวโน้มการใช้น้ำ</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
