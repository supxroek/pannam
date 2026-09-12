// src/pages/WaterHistory.jsx

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useLiffAuth } from "@/hooks/useLiffAuth";
import { LINE_LIFF_ID_RECORD_WATER } from "@/constants/line-liff";
import { fetchMyProperties, fetchHistoryChart } from "@/services/api";
import { getSafeIdToken } from "@/lib/liff";
import Navbar from "@/components/layout/Navbar";
import { toast } from "@/components/ui/toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  Home,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Droplets,
} from "lucide-react";

export default function WaterHistory() {
  const { user, loading: authLoading, error: authError } = useLiffAuth(LINE_LIFF_ID_RECORD_WATER);
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    searchParams.get("propertyId") ? Number(searchParams.get("propertyId")) : null
  );
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // โหลดรายชื่อบ้าน
  useEffect(() => {
    async function loadProperties() {
      try {
        const idToken = getSafeIdToken(user);
        if (!idToken) return;

        const myProps = await fetchMyProperties(idToken);
        setProperties(myProps || []);
        if (!selectedPropertyId && myProps?.length > 0) {
          setSelectedPropertyId(myProps[0].id);
        }
      } catch (err) {
        console.error("Load properties error:", err);
      }
    }

    if (user) {
      loadProperties();
    }
  }, [user]);

  // โหลดประวัติของบ้านที่เลือก
  useEffect(() => {
    async function loadHistory() {
      if (!selectedPropertyId || !user) return;
      try {
        setLoading(true);
        const idToken = getSafeIdToken(user);
        const data = await fetchHistoryChart(selectedPropertyId, idToken);
        setHistoryData(data || []);
      } catch (err) {
        console.error("Load history error:", err);
        toast.error(err.message || "ไม่สามารถโหลดประวัติการใช้น้ำได้");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [selectedPropertyId, user]);

  const handlePropertyChange = (newId) => {
    setSelectedPropertyId(newId);
    setSearchParams({ propertyId: String(newId) });
  };

  // ค่าสถิติเฉลี่ย
  const stats = useMemo(() => {
    if (historyData.length === 0) return { avg: 0, total: 0, max: 0 };
    const total = historyData.reduce((sum, h) => sum + h.consumption, 0);
    const avg = Math.round((total / historyData.length) * 10) / 10;
    const max = Math.max(...historyData.map((h) => h.consumption));
    return { avg, total, max };
  }, [historyData]);

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
      <Navbar title="ประวัติการใช้น้ำ & กราฟ" user={user} backTo="/water-usage" />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* ตัวเลือกสลับบ้าน */}
        {properties.length > 1 && (
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Home className="w-4 h-4 text-blue-600 shrink-0" />
              <span>เลือกบ้าน:</span>
            </div>
            <select
              value={selectedPropertyId || ""}
              onChange={(e) => handlePropertyChange(Number(e.target.value))}
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
            <p className="text-xs text-slate-500">กำลังโหลดประวัติการใช้น้ำ...</p>
          </div>
        ) : historyData.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 space-y-2">
            <Droplets className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">ยังไม่มีประวัติการใช้น้ำ</h4>
            <p className="text-xs text-slate-500">
              ประวัติจะปรากฏเมื่อเจ้าหน้าที่เริ่มบันทึกมิเตอร์น้ำ
            </p>
          </div>
        ) : (
          <>
            {/* กราฟแท่งแสดงแนวโน้มการใช้น้ำ */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    แนวโน้มการใช้น้ำ (หน่วย)
                  </h3>
                  <span className="text-[11px] text-slate-400">ย้อนหลังตามรอบบันทึก</span>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  เฉลี่ย {stats.avg} หน่วย/ด.
                </span>
              </div>

              <div className="h-48 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="monthLabel"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val) => [`${val} หน่วย`, "ปริมาณน้ำ"]}
                      labelFormatter={(label) => `รอบเดือน ${label}`}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                      }}
                    />
                    <Bar
                      dataKey="consumption"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* รายการประวัติย้อนหลัง */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>ประวัติย้อนหลัง ({historyData.length} รอบเดือน)</span>
                <span>ล่าสุดอยู่บน</span>
              </div>

              <div className="space-y-2">
                {[...historyData].reverse().map((record) => {
                  const isPaid =
                    record.paymentStatus === "PAID_CASH" ||
                    record.paymentStatus === "PAID_ONLINE";
                  const isVerifying = record.paymentStatus === "VERIFYING";

                  return (
                    <div
                      key={record.readingId}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 text-sm block">
                          {record.fullMonthLabel}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{record.consumption} หน่วย</span>
                          <span>•</span>
                          <span>(เลข {record.previousReading} → {record.currentReading})</span>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="text-sm font-extrabold text-slate-900 block">
                          ฿{record.totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </span>
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> ชำระแล้ว
                          </span>
                        ) : isVerifying ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" /> รอตรวจสอบ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                            <AlertCircle className="w-3 h-3" /> ค้างชำระ
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
