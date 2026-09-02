// ข้อมูลหมู่บ้าน
export const villages = [
  { id: 1, name: 'หมู่บ้านสวนสุข' },
  { id: 2, name: 'หมู่บ้านร่มเย็น' },
  { id: 3, name: 'หมู่บ้านทุ่งทอง' },
  { id: 4, name: 'หมู่บ้านป่าตอง' },
  { id: 5, name: 'หมู่บ้านน้ำใส' },
  { id: 6, name: 'หมู่บ้านภูผา' },
  { id: 7, name: 'หมู่บ้านริมธาร' },
  { id: 8, name: 'หมู่บ้านเขียวขจี' },
];

// ข้อมูลโซน
export const zones = [
  'โซน A - ด้านหน้า',
  'โซน B - ด้านหลัง',
  'โซน C - ด้านข้างซ้าย',
  'โซน D - ด้านข้างขวา',
  'โซน E - ตรงกลาง',
  'โซน F - มุมบ้าน',
];

// เดือนภาษาไทย
export const thaiMonths = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

// Format เลขบัตรประชาชน: X-XXXX-XXXXX-XX-X
export function formatIdCard(value) {
  const cleaned = value.replace(/[^0-9]/g, '');
  if (cleaned.length <= 1) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 1)}-${cleaned.slice(1)}`;
  if (cleaned.length <= 10)
    return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 5)}-${cleaned.slice(5)}`;
  if (cleaned.length <= 12)
    return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10)}`;
  return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10, 12)}-${cleaned.slice(12, 13)}`;
}

// Format เบอร์โทรศัพท์: 0XX-XXX-XXXX
export function formatPhone(value) {
  const cleaned = value.replace(/[^0-9]/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
}
