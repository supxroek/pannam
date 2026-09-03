import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { villages, zones } from "../../constants/registerData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Balloon } from "lucide-react";

export default function SuccessScreen({ data, user }) {
  const getVillageName = (id) =>
    villages.find((v) => v.id === id)?.name || '-';
  const getZoneName = (id) => zones[id] || '-';
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-6 animate-fade-in-up">
      <div className="w-full max-w-sm text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-[#4ade80] to-[#16a34a] rounded-full flex items-center justify-center shadow-lg shadow-green-200">
          <FontAwesomeIcon
            icon={faCheck}
            className="text-white text-4xl"
          ></FontAwesomeIcon>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          ลงทะเบียนสำเร็จ!
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
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
            {user && (
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-400">บัญชี LINE</span>
                <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                  {user.pictureUrl && (
                    <img
                      src={user.pictureUrl}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover border border-emerald-500"
                    />
                  )}
                  <span>{user.displayName}</span>
                </span>
              </div>
            )}
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
              <span className="text-sm font-medium text-slate-800 text-right  text-balance">
                บ้านเลขที่ {data.houseNumber}
                &nbsp; โซน {getZoneName(data.zone)}
                &nbsp;
                {getVillageName(data.village)}
              </span>
            </div>
          </div>
        </div>

        {/* Processing Time Info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-8 border border-blue-100">
          <div className="flex items-start gap-3">
            <Balloon className="text-[#2563eb] mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-medium text-[#1e3a8a]">
                ยินดีต้อนรับสู่ครอบครัวปันน้ำค่ะ! 🎉
              </p>
              <p className="text-xs text-[#1e40af] mt-1">
                บัญชีของคุณพร้อมใช้งานแล้ว
                สามารถปิดหน้าจอนี้เพื่อไปเพลิดเพลินกับบริการปันน้ำได้ทันทีเลยนะคะ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
