import dayjs from "dayjs";
import "dayjs/locale/th.js";
import buddhistEra from "dayjs/plugin/buddhistEra.js"; // แปลงเป็นปี พ.ศ. อัตโนมัติ

// Set Thai locale as default
dayjs.locale("th");
// Use buddhistEra plugin
dayjs.extend(buddhistEra);

// Extend dayjs with custom methods
Object.assign(dayjs, {
  /**
   * Format date to Thai long format
   * @param {string|Date} date
   * @returns {string} e.g. "2 กรกฎาคม 2568"
   */
  formatDateTH(date) {
    return dayjs(date).locale("th").format("D MMMM BBBB");
  },

  /**
   * Format date to full format
   * @param {string|Date} date
   * @returns {string} e.g. "02/07/2568"
   */
  formatDate(date) {
    return dayjs(date).format("DD/MM/YYYY");
  },

  /**
   * Format date time
   * @param {string|Date} date
   * @returns {string} e.g. "02/07/2568 14:30:00"
   */
  formatDateTime(date) {
    return dayjs(date).format("DD/MM/YYYY HH:mm:ss");
  },

  /**
   * Format date of birth (day/month/year) into individual digits and store in a database (as JavaScript Date).
   * @param {string} dateString
   * @returns {string} e.g. "2568-07-02"
   */
  formatDateToDatabase(day, month, year) {
    let parsedDate;

    // เคสที่ 1: ส่งมาเป็น String ยาวตัวเดียว (เช่น "2026-01-01")
    if (typeof day === "string" && day.includes("-") && !month && !year) {
      parsedDate = dayjs(day);
    }

    // เคสที่ 2: ส่งแยกชิ้น วัน, เดือน, ปี มาตามเดิม
    else if (day !== undefined && month !== undefined && year !== undefined) {
      // แปลง วัน เดือน ปี เป็นตัวเลขจำนวนเต็ม
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      // จัดการเรื่องปี พ.ศ. ให้เป็น ค.ศ. (ปีเกิดในระบบฐานข้อมูลต้องเป็น ค.ศ. เสมอ)
      const adjustedYear = yearNum > 2400 ? yearNum - 543 : yearNum;
      // สร้างวัตถุ Date (สำคัญมาก: เดือนใน JS เริ่มนับจาก 0 เช่น ม.ค. = 0, ธ.ค. = 11 จึงต้อง -1 เสมอ)
      parsedDate = dayjs()
        .year(adjustedYear)
        .month(monthNum)
        .date(dayNum)
        .startOf("day"); // เซ็ตเวลาเป็น 00:00 น. ป้องกันไทม์โซนเคลื่อน
    }

    // ถ้าพารามิเตอร์ไม่ครบหรือไม่ถูกต้อง ให้คืนค่า null
    else {
      return null;
    }

    // ตรวจสอบความถูกต้องว่าวันที่นั้นมีอยู่จริงหรือไม่ (เช่น ไม่มีวันที่ 31 กุมภาพันธ์)
    // และแปลงให้อยู่ในรูป JavaScript Date Object ที่ Prisma ต้องการ
    return parsedDate.isValid() ? parsedDate.toDate() : null;
  },
});

export default dayjs;
