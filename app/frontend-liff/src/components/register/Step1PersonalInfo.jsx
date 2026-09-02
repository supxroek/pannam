import { useState, useEffect } from 'react';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import { thaiMonths } from '../../constants/registerData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

export default function Step1PersonalInfo({ data, onChange, errors }) {
  const [day, setDay] = useState(data.birthDay || '');
  const [month, setMonth] = useState(
    data.birthMonth !== undefined && data.birthMonth !== '' ? data.birthMonth : ''
  );
  const [year, setYear] = useState(data.birthYear || '');

  useEffect(() => {
    if (day && month !== '' && year) {
      onChange('birthDate', `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
      onChange('birthDay', day);
      onChange('birthMonth', month);
      onChange('birthYear', year);
    }
  }, [day, month, onChange, year]);

  useEffect(() => {
    if (data.birthDay) setDay(data.birthDay);
    if (data.birthMonth !== undefined && data.birthMonth !== '') setMonth(data.birthMonth);
    if (data.birthYear) setYear(data.birthYear);
  }, [data.birthDay, data.birthMonth, data.birthYear]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="animate-slide-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">ข้อมูลส่วนตัว</h2>
        <p className="text-slate-500 text-sm">กรอกชื่อ-นามสกุล และวันเกิดของคุณ</p>
      </div>

      <Field>
        <FieldLabel htmlFor="firtname">ชื่อจริง</FieldLabel>
        {/* <Input id="input-invalid" placeholder="Error" aria-invalid />*/}
        <InputGroup>
          <InputGroupInput id="firtname" placeholder="ชื่อจริง"  />
          <InputGroupAddon align="inline-start">
            <UserRound className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription className="hidden text-amber-700">
          กรอกชื่อจริง
        </FieldDescription>
      </Field>

      {/* <div className="space-y-5">
        <InputField
          label="ชื่อจริง"
          placeholder="กรอกชื่อจริง"
          value={data.firstName || ''}
          onChange={(e) => onChange('firstName', e.target.value)}
          error={errors.firstName}
          icon="fa-user"
          maxLength={50}
        />
        <InputField
          label="นามสกุล"
          placeholder="กรอกนามสกุล"
          value={data.lastName || ''}
          onChange={(e) => onChange('lastName', e.target.value)}
          error={errors.lastName}
          icon="fa-user"
          maxLength={50}
        />
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            วัน/เดือน/ปี เกิด
          </label>
          <div className="grid grid-cols-3 gap-3">
            <SelectField
              placeholder="วัน"
              options={days.map((d) => ({ id: d, name: String(d) }))}
              value={day ? parseInt(day) : ''}
              onChange={(v) => setDay(String(v))}
              error={errors.birthDay}
            />
            <SelectField
              placeholder="เดือน"
              options={thaiMonths.map((m, i) => ({ id: i, name: m }))}
              value={month !== '' ? parseInt(month) : ''}
              onChange={(v) => setMonth(String(v))}
              error={errors.birthMonth}
            />
            <SelectField
              placeholder="ปี พ.ศ."
              options={years.map((y) => ({ id: y, name: String(y + 543) }))}
              value={year ? parseInt(year) : ''}
              onChange={(v) => setYear(String(v))}
              error={errors.birthYear}
            />
          </div>
          {(errors.birthDay || errors.birthMonth || errors.birthYear) && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <FontAwesomeIcon icon={faCircleExclamation} className="text-xs" />
              กรุณาระบุวันเดือนปีเกิดให้ครบถ้วน
            </p>
          )}
        </div>
      </div>*/}
    </div>
  );
}
