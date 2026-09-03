import { useState } from 'react';
import formatIdCard from '@/utils/formatIdCard';
import formatPhone from '@/utils/formatPhone';

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
import { IdCard, Phone, LockKeyhole } from 'lucide-react';

export default function Step2ContactInfo({ data, onChange, errors }) {
  const [phoneError, setPhoneError] = useState('');
  const [idError, setIdError] = useState('');

  const validatePhone = (value) => {
    if (!value) return '';
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.length > 0 && cleaned.length < 9)
      return 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 9 หลัก';
    if (cleaned.length > 10) return 'เบอร์โทรศัพท์ต้องไม่เกิน 10 หลัก';
    return '';
  };

  const validateIdCard = (value) => {
    if (!value) return '';
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.length > 0 && cleaned.length < 13)
      return 'เลขบัตรประชาชนต้องมี 13 หลัก';
    if (cleaned.length > 13) return 'เลขบัตรประชาชนต้องมีไม่เกิน 13 หลัก';
    return '';
  };

  const idCardError = errors.idCard || idError;
  const phoneErr = errors.phone || phoneError;

  return (
    <div className="animate-slide-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">ข้อมูลติดต่อ</h2>
        <p className="text-muted-foreground text-sm">กรอกเลขบัตรประชาชนและเบอร์โทรศัพท์</p>
      </div>

      <FieldGroup>
        {/* เลขบัตรประชาชน */}
        <Field data-invalid={!!idCardError || undefined}>
          <FieldLabel htmlFor="idCard">หมายเลขบัตรประชาชน</FieldLabel>
          <InputGroup className="h-10">
            <InputGroupAddon align="inline-start">
              <IdCard className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id="idCard"
              placeholder="X-XXXX-XXXXX-XX-X"
              value={data.idCard || ''}
              onChange={(e) => {
                const formatted = formatIdCard(e.target.value);
                onChange('idCard', formatted);
                setIdError(validateIdCard(formatted));
              }}
              onBlur={() => setIdError(validateIdCard(data.idCard || ''))}
              maxLength={17}
              inputMode="numeric"
              aria-invalid={!!idCardError || undefined}
            />
          </InputGroup>
          {idCardError ? (
            <FieldDescription className="text-destructive">
              {idCardError}
            </FieldDescription>
          ) : (
            <FieldDescription>กรอกเลข 13 หลัก ไม่ต้องใส่ขีด</FieldDescription>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LockKeyhole className="size-3 text-primary" />
            <span>ข้อมูลถูกเข้ารหัสและเก็บเป็นความลับ</span>
          </div>
        </Field>

        {/* เบอร์โทรศัพท์ */}
        <Field data-invalid={!!phoneErr || undefined}>
          <FieldLabel htmlFor="phone">เบอร์โทรศัพท์มือถือ</FieldLabel>
          <InputGroup className="h-10">
            <InputGroupAddon align="inline-start">
              <Phone className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id="phone"
              placeholder="0XX-XXX-XXXX"
              value={data.phone || ''}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value);
                onChange('phone', formatted);
                setPhoneError(validatePhone(formatted));
              }}
              onBlur={() => setPhoneError(validatePhone(data.phone || ''))}
              maxLength={12}
              inputMode="tel"
              aria-invalid={!!phoneErr || undefined}
            />
          </InputGroup>
          {phoneErr ? (
            <FieldDescription className="text-destructive">
              {phoneErr}
            </FieldDescription>
          ) : (
            <FieldDescription>กรอกเบอร์มือถือ 10 หลัก</FieldDescription>
          )}
        </Field>
      </FieldGroup>
    </div>
  );
}
