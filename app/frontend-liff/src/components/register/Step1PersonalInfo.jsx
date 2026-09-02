import { useState, useEffect } from 'react';
import { thaiMonths } from '../../constants/registerData';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { UserRound } from 'lucide-react';

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

  const selectedMonthName = month !== '' && month !== undefined ? thaiMonths[parseInt(month)] : undefined;

  const hasFirstNameError = !!errors.firstName;
  const hasLastNameError = !!errors.lastName;
  const hasBirthError = !!(errors.birthDay || errors.birthMonth || errors.birthYear);

  return (
    <div className="animate-slide-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">ข้อมูลส่วนตัว</h2>
        <p className="text-muted-foreground text-sm">กรอกชื่อ-นามสกุล และวันเกิดของคุณ</p>
      </div>

      <FieldGroup>
        {/* ชื่อจริง */}
        <Field data-invalid={hasFirstNameError || undefined}>
          <FieldLabel htmlFor="firstName">ชื่อจริง</FieldLabel>
          <InputGroup className="h-10">
            <InputGroupAddon align="inline-start">
              <UserRound className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id="firstName"
              placeholder="กรอกชื่อจริง"
              value={data.firstName || ''}
              onChange={(e) => onChange('firstName', e.target.value)}
              maxLength={50}
              aria-invalid={hasFirstNameError || undefined}
            />
          </InputGroup>
          {hasFirstNameError && (
            <FieldDescription className="text-destructive">
              {errors.firstName}
            </FieldDescription>
          )}
        </Field>

        {/* นามสกุล */}
        <Field data-invalid={hasLastNameError || undefined}>
          <FieldLabel htmlFor="lastName">นามสกุล</FieldLabel>
          <InputGroup className="h-10">
            <InputGroupAddon align="inline-start">
              <UserRound className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id="lastName"
              placeholder="กรอกนามสกุล"
              value={data.lastName || ''}
              onChange={(e) => onChange('lastName', e.target.value)}
              maxLength={50}
              aria-invalid={hasLastNameError || undefined}
            />
          </InputGroup>
          {hasLastNameError && (
            <FieldDescription className="text-destructive">
              {errors.lastName}
            </FieldDescription>
          )}
        </Field>

        {/* วัน/เดือน/ปี เกิด */}
        <Field data-invalid={hasBirthError || undefined}>
          <FieldLabel>วัน/เดือน/ปี เกิด</FieldLabel>
          <div className="grid grid-cols-3 gap-3">
            {/* วัน */}
            <Select
              value={day ? String(day) : undefined}
              onValueChange={(v) => setDay(v)}
            >
              <SelectTrigger className="w-full h-10!" aria-invalid={!!errors.birthDay || undefined}>
                <SelectValue placeholder="วัน" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {days.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* เดือน */}
            <Select
              value={month !== '' ? String(month) : undefined}
              onValueChange={(v) => setMonth(v)}
            >
              <SelectTrigger className="w-full h-10!" aria-invalid={!!errors.birthMonth || undefined}>
                <SelectValue placeholder="เดือน">{selectedMonthName}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {thaiMonths.map((m, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* ปี */}
            <Select
              value={year ? String(year) : undefined}
              onValueChange={(v) => setYear(v)}
            >
              <SelectTrigger className="w-full h-10!" aria-invalid={!!errors.birthYear || undefined}>
                <SelectValue placeholder="ปี ค.ศ." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {hasBirthError && (
            <FieldDescription className="text-destructive">
              กรุณาระบุวันเดือนปีเกิดให้ครบถ้วน
            </FieldDescription>
          )}
        </Field>
      </FieldGroup>
    </div>
  );
}
