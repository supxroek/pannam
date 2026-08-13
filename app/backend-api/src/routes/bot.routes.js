// src/routes/bot.routes.js

import eventHandlers from "../utils/events-handler.js";

// ฟังก์ชันสำหรับจับข้อผิดพลาดในฟังก์ชันแบบอะซิงโครนัส (Asynchronous Function Error Catcher)
function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

class Webhook {
  // ฟังก์ชันสำหรับจัดการ webhook events จาก LINE
  handleEvent(req, res, next) {
    return catchAsync(async () => {
      const events = req.body.events;

      for (const event of events) {
        switch (event.type) {
          case "message":
            await eventHandlers.handleMessage(event);
            break;
          case "follow":
            await eventHandlers.handleFollow(event);
            break;
          case "postback":
            // handle postback if needed in future
            break;
          default:
            console.log("Unhandled event type:", event.type);
        }
      }

      res.status(200).json({ message: "Events processed" });
    })(req, res, next);
  }
}

export default new Webhook();
