// Format เบอร์โทรศัพท์: 0XX-XXX-XXXX
export default function formatPhone(value) {
  const cleaned = value.replace(/[^0-9]/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
}
