// ทดสอบ LIFF Login
export function TEST_useLiffAuth() {
  const users = {
    userId: "U457895...TEST_USERID",
    displayName: "USER_TEST",
    pictureUrl:
      "https://profile.line-scdn.net/0hMa6AtcDTEk4LOA3AmqptGXZ9HCN8FhQGc11aeH49G31zC1IdMFkJICY6TS51DQZNMl4IfXptGysmFxFoSlwNclFoETp5FFxEXyMLXVJdNHcmfSkaSgIFT1hfUCN9bzdxNwgNLGhYJzoiYRBxaBoOLypeCQkhSBNnMVg",
    statusMessage: "Development",
    idToken:
      "eyJraWQiOiI5MjkxZTZiNmEzOGM3ZDhhZjY4YzUyNjZmYWEyODIwOGQ2ZGQ1OTg0NWZhYTAyNGU1NDFiZGIzOWZlMTM1ZDRiIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2FjY2Vzcy5saW5lLm1lIiwic3ViIjoiVTI1MGNkZGYxNmIxOGYzYmYzYmVhOGUxMzNjYzk5ZTg0IiwiYXVkIjoiMjAxMTE3MDE3NSIsImV4cCI6MTc4ODQ0NTI2NCwiaWF0IjoxNzg4NDQxNjY0LCJhbXIiOlsibGluZXNzbyJdLCJuYW1lIjoiX3N1cGFyb2VrIiwicGljdHVyZSI6Imh0dHBzOi8vcHJvZmlsZS5saW5lLXNjZG4ubmV0LzBoTWE2QXRjRFRFazRMT0EzQW1xcHRHWFo5SENOOEZoUUdjMTFhZUg0OUczMXpDMUlkTUZrSklDWTZUUzUxRFFaTk1sNElmWHB0R3lzbUZ4Rm9TbHdOY2xGb0VUcDVGRnhFWHlNTFhWSmROSGNtZlNrYVNnSUZUMWhmVUNOOWJ6ZHhOd2dOTEdoWUp6b2lZUkJ4YUJvT0x5cGVDUWtoU0JObk1WZyJ9.6wRcY9KLW0dvDuHp3Co19nUOSCPF_NrfkwnqW2pUboPFwR3RHwwnGq6Xb2T9S1NQ3KqU9hvlhnENjPC1W62kzQ",
  };

  const loading = false;
  const error = null;

  return { users, loading, error };
}

// ข้อมูลหมู่บ้าน
export const villages = [
  { id: 1, name: "หมู่บ้านสวนสุข" },
  { id: 2, name: "หมู่บ้านคลองไคร" },
  { id: 3, name: "หมู่บ้านทุ่งทอง" },
  { id: 4, name: "หมู่บ้านป่าตอง" },
  { id: 5, name: "หมู่บ้านน้ำใส" },
  { id: 6, name: "หมู่บ้านภูผา" },
  { id: 7, name: "หมู่บ้านริมธาร" },
  { id: 8, name: "หมู่บ้านเขียวขจี" },
];

// ข้อมูลโซน
export const zones = ["A", "B", "C", "D", "E", "F"];

// เดือนภาษาไทย
export const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];
