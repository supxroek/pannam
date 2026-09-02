import { villages, zones, thaiMonths } from '../../constants/registerData';
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  UserRound,
  IdCard,
  MapPin,
  PenLine,
  Check,
  Info,
} from 'lucide-react';

export default function Step4Review({ data, onBack, onSubmit, loading }) {
  const getVillageName = (id) =>
    villages.find((v) => v.id === id)?.name || '-';
  const getZoneName = (id) => zones[id] || '-';
  const getMonthName = (idx) => thaiMonths[idx] || '-';

  return (
    <div className="animate-slide-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">ตรวจสอบข้อมูล</h2>
        <p className="text-muted-foreground text-sm">กรุณาตรวจสอบความถูกต้องก่อนยืนยัน</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* ข้อมูลส่วนตัว */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="text-primary" />
              ข้อมูลส่วนตัว
            </CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" onClick={() => onBack(0)} className="text-blue-500 font-semibold">
                <PenLine data-icon="inline-start" />
                แก้ไข
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ชื่อ-นามสกุล</span>
                <span className="text-sm font-medium">
                  {data.firstName || '-'} {data.lastName || '-'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">วันเกิด</span>
                <span className="text-sm font-medium">
                  {data.birthDay
                    ? `${data.birthDay} ${getMonthName(parseInt(data.birthMonth))} ${parseInt(data.birthYear) + 543}`
                    : '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ข้อมูลติดต่อ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="text-sky-500" />
              ข้อมูลติดต่อ
            </CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" onClick={() => onBack(1)} className="text-blue-500 font-semibold">
                <PenLine data-icon="inline-start" />
                แก้ไข
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">เลขบัตรประชาชน</span>
                <span className="text-sm font-medium font-mono">
                  {data.idCard || '-'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">เบอร์โทรศัพท์</span>
                <span className="text-sm font-medium">
                  {data.phone || '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ข้อมูลที่อยู่ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="text-violet-500" />
              ข้อมูลที่อยู่
            </CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" onClick={() => onBack(2)} className="text-blue-500 font-semibold">
                <PenLine data-icon="inline-start" />
                แก้ไข
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">หมู่บ้าน</span>
                <span className="text-sm font-medium">
                  {getVillageName(data.village)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">บ้านเลขที่</span>
                <span className="text-sm font-medium">
                  {data.houseNumber || '-'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">โซน</span>
                <span className="text-sm font-medium">
                  {getZoneName(data.zone)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Notice */}
        <Alert className="bg-amber-50 rounded-xl p-4 mb-8 border border-amber-100">
          <Info className='text-amber-500!' />
          <AlertTitle>โปรดทราบ</AlertTitle>
          <AlertDescription>
            เมื่อกดยืนยัน ข้อมูลของคุณจะถูกส่งไปยังระบบ PANNAM
            เพื่อตรวจสอบและอนุมัติการใช้งาน
          </AlertDescription>
        </Alert>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="w-full text-white font-semibold py-6 rounded-2xl shadow-lg hover:scale-98 hover:ring-2 hover:ring-blue-900 text-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Spinner data-icon="inline-start" />
              <span>กำลังดำเนินการ...</span>
            </>
          ) : (
            <>
              <span>ยืนยันการลงทะเบียน</span>
              <Check data-icon="inline-end" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
