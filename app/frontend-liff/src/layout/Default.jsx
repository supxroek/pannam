import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toast";

export default function Default() {
  return (
    <>
      <div className="mx-auto min-h-screen max-w-md bg-transparent font-sans flex flex-col justify-center">
        <main>
          <Outlet />
        </main>
      </div>
      <Toaster />
    </>
  );
}
