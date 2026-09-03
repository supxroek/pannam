// ทดสอบ LIFF Login
export function TEST_useLiffAuth() {
  const users = {
    userId: "U457895...TEST_USERID",
    displayName: "USER_TEST",
    pictureUrl:
      "https://profile.line-scdn.net/0hMa6AtcDTEk4LOA3AmqptGXZ9HCN8FhQGc11aeH49G31zC1IdMFkJICY6TS51DQZNMl4IfXptGysmFxFoSlwNclFoETp5FFxEXyMLXVJdNHcmfSkaSgIFT1hfUCN9bzdxNwgNLGhYJzoiYRBxaBoOLypeCQkhSBNnMVg",
    statusMessage: "Development",
    idToken:
      "eyJraWQiOiJlNmE2OTE5Mzg2MTY5YmE1NGRlOWRkMzM2YjQxNDc5YTAxMDEyZGMwYzQyOGJhYWUyZGUxOGU1OWVlMjE0NmRiIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2FjY2Vzcy5saW5lLm1lIiwic3ViIjoiVTI1MGNkZGYxNmIxOGYzYmYzYmVhOGUxMzNjYzk5ZTg0IiwiYXVkIjoiMjAxMTE3MDE3NSIsImV4cCI6MTc4ODQ1MDMyMywiaWF0IjoxNzg4NDQ2NzIzLCJhbXIiOlsibGluZXNzbyJdLCJuYW1lIjoiX3N1cGFyb2VrIiwicGljdHVyZSI6Imh0dHBzOi8vcHJvZmlsZS5saW5lLXNjZG4ubmV0LzBoTWE2QXRjRFRFazRMT0EzQW1xcHRHWFo5SENOOEZoUUdjMTFhZUg0OUczMXpDMUlkTUZrSklDWTZUUzUxRFFaTk1sNElmWHB0R3lzbUZ4Rm9TbHdOY2xGb0VUcDVGRnhFWHlNTFhWSmROSGNtZlNrYVNnSUZUMWhmVUNOOWJ6ZHhOd2dOTEdoWUp6b2lZUkJ4YUJvT0x5cGVDUWtoU0JObk1WZyJ9.7G5TD0cs1gW8-ttZK6QU6IIL8R1zyyDR3g0wHB4S-z7yWUCdua-3Wnqifk_TDWO3XzI48yASsdzEOVFOUxuzvA",
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

// ข้อมูลบ้านเลขที่ที่มีอยู่ในระบบ (Mock data สำหรับค้นหา)
export const existingHouses = [
  { id: 1, villageId: 1, houseNumber: "12", zone: 0 },
  { id: 2, villageId: 1, houseNumber: "12/1", zone: 0 },
  { id: 3, villageId: 1, houseNumber: "15/3", zone: 1 },
  { id: 4, villageId: 1, houseNumber: "24", zone: 1 },
  { id: 5, villageId: 1, houseNumber: "45/2", zone: 2 },
  { id: 6, villageId: 1, houseNumber: "88", zone: 3 },
  { id: 7, villageId: 1, houseNumber: "102/4", zone: 4 },
  { id: 8, villageId: 2, houseNumber: "5", zone: 0 },
  { id: 9, villageId: 2, houseNumber: "18/2", zone: 1 },
  { id: 10, villageId: 2, houseNumber: "33", zone: 2 },
  { id: 11, villageId: 3, houseNumber: "9", zone: 0 },
  { id: 12, villageId: 3, houseNumber: "14/1", zone: 1 },
  { id: 13, villageId: 3, houseNumber: "55", zone: 2 },
  { id: 14, villageId: 4, houseNumber: "7/1", zone: 0 },
  { id: 15, villageId: 4, houseNumber: "21", zone: 1 },
  { id: 16, villageId: 5, houseNumber: "8", zone: 0 },
  { id: 17, villageId: 5, houseNumber: "19/3", zone: 2 },
  { id: 18, villageId: 6, houseNumber: "3", zone: 0 },
  { id: 19, villageId: 6, houseNumber: "27/1", zone: 1 },
  { id: 20, villageId: 7, houseNumber: "11", zone: 0 },
  { id: 21, villageId: 8, houseNumber: "62/5", zone: 3 },
];

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
