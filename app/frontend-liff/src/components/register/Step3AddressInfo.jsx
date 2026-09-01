import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import { villages, zones } from '../../constants/registerData';

export default function Step3AddressInfo({ data, onChange, errors }) {
  return (
    <div className="animate-slide-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">ข้อมูลที่อยู่</h2>
        <p className="text-slate-500 text-sm">เลือกหมู่บ้านและระบุที่อยู่ของคุณ</p>
      </div>
      <div className="space-y-5">
        <SelectField
          label="หมู่บ้าน"
          placeholder="เลือกหมู่บ้าน"
          options={villages}
          value={data.village || ''}
          onChange={(v) => onChange('village', v)}
          error={errors.village}
        />
        <InputField
          label="บ้านเลขที่"
          placeholder="กรอกบ้านเลขที่"
          value={data.houseNumber || ''}
          onChange={(e) => onChange('houseNumber', e.target.value)}
          error={errors.houseNumber}
          icon="fa-hashtag"
          maxLength={20}
          helpText="เช่น 123/4, 56 หรือ 789"
        />
        <SelectField
          label="โซน"
          placeholder="เลือกโซน"
          options={zones.map((z, i) => ({ id: i, name: z }))}
          value={data.zone !== undefined && data.zone !== '' ? data.zone : ''}
          onChange={(v) => onChange('zone', v)}
          error={errors.zone}
        />
      </div>
    </div>
  );
}
