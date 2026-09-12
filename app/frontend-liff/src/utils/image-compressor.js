// src/utils/image-compressor.js

/**
 * บีบอัดและปรับขนาดรูปภาพผ่าน HTML5 Canvas เพื่อลดขนาด Payload ก่อนส่งขึ้น Server
 *
 * @param {File|Blob} file - ไฟล์รูปภาพต้นฉบับ
 * @param {Object} options - ตัวเลือกการบีบอัด
 * @param {number} [options.maxWidth=800] - ความกว้างสูงสุด (px)
 * @param {number} [options.maxHeight=800] - ความสูงสูงสุด (px)
 * @param {number} [options.quality=0.7] - คุณภาพของ JPEG (0.1 - 1.0)
 * @returns {Promise<string>} Base64 Data URL ของรูปที่บีบอัดแล้ว
 */
export async function compressImage(file, options = {}) {
  const { maxWidth = 800, maxHeight = 800, quality = 0.7 } = options;

  if (!file) {
    throw new Error("ไม่พบไฟล์รูปภาพ");
  }

  // ตรวจสอบว่าเป็นไฟล์รูปภาพ
  if (!file.type.startsWith("image/")) {
    throw new Error("ไฟล์ที่เลือกต้องเป็นรูปภาพเท่านั้น");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // คำนวณขนาดใหม่โดยรักษาสัดส่วนภาพ (Aspect Ratio)
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // วาดลงบน Canvas เพื่อทำการ Resize & Compress
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("ไม่สามารถสร้าง Canvas context ได้"));
          return;
        }

        // ล้างพื้นหลังให้เป็นสีขาว (กรณีมี Alpha channel เช่น PNG)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // แปลงเป็น JPEG Data URL พร้อมระบุระดับคุณภาพ
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };

      img.onerror = (err) => {
        console.error(err);
        reject(new Error("ไม่สามารถโหลดรูปภาพเพื่อทำการประมวลผลได้"));
      };

      img.src = event.target.result;
    };

    reader.onerror = (err) => {
      console.error(err);
      reject(new Error("เกิดข้อผิดพลาดในการอ่านไฟล์รูปภาพ"));
    };

    reader.readAsDataURL(file);
  });
}

export default compressImage;
