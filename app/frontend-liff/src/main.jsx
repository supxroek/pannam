import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Default from "./layout/Default.jsx";

import Register from "./pages/Register.jsx";
import RecordWater from "./pages/RecordWater.jsx";
import RecordPayment from "./pages/RecordPayment.jsx";
import WaterUsage from "./pages/WaterUsage.jsx";
import WaterHistory from "./pages/WaterHistory.jsx";
import Profile from "./pages/Profile.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Default />,
    children: [
      {
        index: true,
        element: <WaterUsage />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      // ผู้จดน้ำ (Meter Reader)
      {
        path: "/record-water",
        element: <RecordWater />,
      },
      {
        path: "/record-payment",
        element: <RecordPayment />,
      },
      // ลูกบ้าน (Resident)
      {
        path: "/water-usage",
        element: <WaterUsage />,
      },
      {
        path: "/water-history",
        element: <WaterHistory />,
      },
      // โปรไฟล์ส่วนตัว
      {
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
