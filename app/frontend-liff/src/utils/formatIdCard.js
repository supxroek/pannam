// Format เลขบัตรประชาชน: X-XXXX-XXXXX-XX-X
export default function formatIdCard(value) {
  const cleaned = value.replace(/[^0-9]/g, '');
  if (cleaned.length <= 1) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 1)}-${cleaned.slice(1)}`;
  if (cleaned.length <= 10)
    return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 5)}-${cleaned.slice(5)}`;
  if (cleaned.length <= 12)
    return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10)}`;
  return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10, 12)}-${cleaned.slice(12, 13)}`;
}
