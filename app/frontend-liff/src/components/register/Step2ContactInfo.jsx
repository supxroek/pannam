import { useState } from 'react';
import InputField from '../ui/InputField.jsx';
import formatIdCard from '../../utils/formatIdCard.js';
import formatPhone from '../../utils/formatIdCard.js';

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

  return (
    <div className="animate-slide-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">ข้อมูลติดต่อ</h2>
        <p className="text-slate-500 text-sm">กรอกเลขบัตรประชาชนและเบอร์โทรศัพท์</p>
      </div>
      <div className="space-y-5">
        <div>
          <InputField
            label="หมายเลขบัตรประชาชน"
            placeholder="X-XXXX-XXXXX-XX-X"
            value={data.idCard || ''}
            onChange={(e) => {
              const formatted = formatIdCard(e.target.value);
              onChange('idCard', formatted);
              setIdError(validateIdCard(formatted));
            }}
            onBlur={() => setIdError(validateIdCard(data.idCard || ''))}
            error={errors.idCard || idError}
            icon="fa-id-card"
            maxLength={17}
            helpText="กรอกเลข 13 หลัก ไม่ต้องใส่ขีด"
            inputMode="numeric"
          />
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <i className="fas fa-lock text-[#2563eb]"></i>
            <span>ข้อมูลถูกเข้ารหัสและเก็บเป็นความลับ</span>
          </div>
        </div>
        <InputField
          label="เบอร์โทรศัพท์มือถือ"
          placeholder="0XX-XXX-XXXX"
          value={data.phone || ''}
          onChange={(e) => {
            const formatted = formatPhone(e.target.value);
            onChange('phone', formatted);
            setPhoneError(validatePhone(formatted));
          }}
          onBlur={() => setPhoneError(validatePhone(data.phone || ''))}
          error={errors.phone || phoneError}
          icon="fa-phone"
          maxLength={12}
          helpText="กรอกเบอร์มือถือ 10 หลัก"
          inputMode="tel"
        />
      </div>
    </div>
  );
}
