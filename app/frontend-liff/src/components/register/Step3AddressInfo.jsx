import { villages, zones } from '../../constants/registerData';
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
import { Hash } from 'lucide-react';

export default function Step3AddressInfo({ data, onChange, errors }) {
  const selectedVillageName = villages.find((v) => v.id === data.village)?.name;
  const selectedZoneName = data.zone !== undefined && data.zone !== '' ? zones[data.zone] : undefined;

  return (
    <div className="animate-slide-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">ข้อมูลที่อยู่</h2>
        <p className="text-muted-foreground text-sm">เลือกหมู่บ้านและระบุที่อยู่ของคุณ</p>
      </div>

      <FieldGroup>
        {/* หมู่บ้าน */}
        <Field data-invalid={!!errors.village || undefined}>
          <FieldLabel>หมู่บ้าน</FieldLabel>
          <Select
            value={data.village ? String(data.village) : undefined}
            onValueChange={(v) => onChange('village', parseInt(v))}
          >
            <SelectTrigger className="w-full h-10!" aria-invalid={!!errors.village || undefined}>
              <SelectValue placeholder="เลือกหมู่บ้าน">{selectedVillageName}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {villages.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)} className='px-2.5 py-2.5'>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.village && (
            <FieldDescription className="text-destructive">
              {errors.village}
            </FieldDescription>
          )}
        </Field>

        {/* บ้านเลขที่ */}
        <Field data-invalid={!!errors.houseNumber || undefined}>
          <FieldLabel htmlFor="houseNumber">บ้านเลขที่</FieldLabel>
          <InputGroup className="h-10">
            <InputGroupAddon align="inline-start">
              <Hash className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id="houseNumber"
              placeholder="กรอกบ้านเลขที่"
              value={data.houseNumber || ''}
              onChange={(e) => onChange('houseNumber', e.target.value)}
              maxLength={20}
              aria-invalid={!!errors.houseNumber || undefined}
            />
          </InputGroup>
          {errors.houseNumber ? (
            <FieldDescription className="text-destructive">
              {errors.houseNumber}
            </FieldDescription>
          ) : (
            <FieldDescription>เช่น 123/4, 56 หรือ 789</FieldDescription>
          )}
        </Field>

        {/* โซน */}
        <Field data-invalid={!!errors.zone || undefined}>
          <FieldLabel>โซน (ไม่จำเป็นต้องระบุ)</FieldLabel>
          <Select
            value={data.zone !== undefined && data.zone !== '' ? String(data.zone) : undefined}
            onValueChange={(v) => onChange('zone', v ? parseInt(v) : undefined)}
          >
            <SelectTrigger className="w-full h-10!" aria-invalid={!!errors.zone || undefined}>
              <SelectValue placeholder="เลือกโซน (ระบุหรือไม่ระบุก็ได้)">
                {data.zone !== undefined && data.zone !== null && data.zone !== '' ? selectedZoneName : "ไม่ได้เลือก"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="" className='px-2.5 py-2.5 text-muted-foreground'>
                  -- ไม่ระบุโซน --
                </SelectItem>
                {zones.map((z, i) => (
                  <SelectItem key={i} value={String(i)} className='px-2.5 py-2.5'>
                    {z}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.zone && (
            <FieldDescription className="text-destructive">
              {errors.zone}
            </FieldDescription>
          )}
        </Field>
      </FieldGroup>
    </div>
  );
}
