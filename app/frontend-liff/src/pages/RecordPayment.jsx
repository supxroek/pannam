// src/pages/RecordPayment.jsx

import { useState, useEffect, useMemo } from "react";
import { useLiffAuth } from "@/hooks/useLiffAuth";
import { LINE_LIFF_ID_RECORD_PAYMENT } from "@/constants/line-liff";
import { fetchUnpaidBills, recordCashPaymentApi } from "@/services/api";
import { getSafeIdToken } from "@/lib/liff";
import Navbar from "@/components/layout/Navbar";
import { toast } from "@/components/ui/toast";
import {
  Search,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  Wallet,
} from "lucide-react";

export default function RecordPayment() {
  const { user, loading: authLoading, error: authError } = useLiffAuth(LINE_LIFF_ID_RECORD_PAYMENT);

  const [unpaidBills, setUnpaidBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");

  // State ยืนยันรับเงิน
  const [confirmInvoice, setConfirmInvoice] = useState(null);
  const [processing, setProcessing] = useState(false);

  // ดึงรายการบิลค้างชำระ
  const loadUnpaidBills = async () => {
    try {
      setLoading(true);
      const idToken = getSafeIdToken(user);
      if (!idToken) return;

      const data = await fetchUnpaidBills(idToken);
      setUnpaidBills(data || []);
    } catch (err) {
      console.error("Failed to load unpaid bills:", err);
      toast.error(err.message || "ไม่สามารถโหลดรายการค้างชำระได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUnpaidBills();
    }
  }, [user]);

  // รายการโซน
  const zones = useMemo(() => {
    const set = new Set();
    unpaidBills.forEach((b) => {
      if (b.zone) set.add(b.zone);
    });
    return Array.from(set);
  }, [unpaidBills]);

  // กรองรายการบิล
  const filteredBills = useMemo(() => {
    return unpaidBills.filter((b) => {
      const matchSearch =
        b.houseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.meterCode?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchZone = selectedZone === "all" || b.zone === selectedZone;
      return matchSearch && matchZone;
    });
  }, [unpaidBills, searchTerm, selectedZone]);

  // ยอดรวมค้างชำระ
  const totalSummary = useMemo(() => {
    const totalAmount = unpaidBills.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const houseSet = new Set(unpaidBills.map((b) => b.propertyId));
    return {
      totalAmount,
      totalHouses: houseSet.size,
      totalBills: unpaidBills.length,
    };
  }, [unpaidBills]);

  // บันทึกรับเงินสด
  const handleConfirmPayment = async () => {
    if (!confirmInvoice) return;

    try {
      setProcessing(true);
      const idToken = getSafeIdToken(user);

      await recordCashPaymentApi(confirmInvoice.invoiceId, idToken);
      toast.success(`บันทึกรับเงินสดบ้าน ${confirmInvoice.houseNumber} สำเร็จ`);
      setConfirmInvoice(null);

      // โหลดรายการใหม่
      loadUnpaidBills();
    } catch (err) {
      console.error("Record cash error:", err);
      toast.error(err.message || "เกิดข้อผิดพลาดในการบันทึกการจ่าย");
    } finally {
      setProcessing(false);
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
      <Navbar title="บันทึกการรับชำระเงิน (ผู้จดมิเตอร์)" user={user} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* สรุปยอดค้างชำระรวม */}
        <div className="bg-linear-to-br from-red-500 to-rose-600 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 opacity-90">
            <Wallet className="w-4 h-4" />
            <span className="text-xs font-semibold">ยอดค้างชำระที่ต้องติดตามเก็บ</span>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-black tracking-tight">
              ฿{totalSummary.totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2 text-xs opacity-90 border-t border-white/20 mt-3">
            <span>🏠 ทั้งหมด {totalSummary.totalHouses} หลังคาเรือน</span>
            <span>•</span>
            <span>📄 {totalSummary.totalBills} บิลรอชำระ</span>
          </div>
        </div>

        {/* ค้นหา & ตัวกรอง */}
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

          {zones.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedZone("all")}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedZone === "all"
                    ? "bg-slate-800 text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                ทุกโซน ({unpaidBills.length})
              </button>
              {zones.map((zone) => {
                const count = unpaidBills.filter((b) => b.zone === zone).length;
                return (
                  <button
                    key={zone}
                    onClick={() => setSelectedZone(zone)}
                    className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                      selectedZone === zone
                        ? "bg-slate-800 text-white shadow-2xs"
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

        {/* รายการบิลค้างชำระ */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>รายการบิลรอเก็บเงิน ({filteredBills.length})</span>
            <button
              onClick={loadUnpaidBills}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> รีเฟรช
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">กำลังโหลดรายการ...</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">ยอดเยี่ยม! ไม่มีรายการค้างชำระ</h4>
              <p className="text-xs text-slate-500">ลูกบ้านในหมู่บ้านชำระค่าน้ำครบถ้วนแล้ว</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredBills.map((bill) => (
                <div
                  key={bill.invoiceId}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-slate-200 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-base">
                          บ้านเลขที่ {bill.houseNumber}
                        </span>
                        {bill.zone && (
                          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            โซน {bill.zone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>รอบเดือน: {bill.readingMonth}</span>
                        <span>•</span>
                        <span>{bill.consumption} หน่วย</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-red-600 block">
                        ฿{bill.totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ครบกำหนด: {bill.dueDateFormatted}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                      {bill.paymentStatus === "VERIFYING" ? "รอตรวจสอบสลิป" : "ค้างชำระ"}
                    </span>

                    <button
                      onClick={() => setConfirmInvoice(bill)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      บันทึกรับเงินสด
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Dialog ยืนยันการรับเงินสด */}
      {confirmInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <DollarSign className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-800 text-lg">ยืนยันการรับชำระเงินสด</h3>
              <p className="text-xs text-slate-500">
                คุณได้รับเงินสดเต็มจำนวนจากลูกบ้านเรียบร้อยแล้วใช่หรือไม่?
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>บ้านเลขที่:</span>
                <span className="font-bold text-slate-800">
                  {confirmInvoice.houseNumber} {confirmInvoice.zone ? `(โซน ${confirmInvoice.zone})` : ""}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ประจำเดือน:</span>
                <span className="font-bold text-slate-800">{confirmInvoice.readingMonth}</span>
              </div>
              <div className="flex justify-between text-slate-600 border-t border-slate-200/60 pt-2">
                <span>ยอดเงินที่ได้รับ:</span>
                <span className="font-extrabold text-green-700 text-sm">
                  ฿{confirmInvoice.totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmInvoice(null)}
                disabled={processing}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-medium text-xs transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={processing}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {processing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "ยืนยันรับเงิน"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
