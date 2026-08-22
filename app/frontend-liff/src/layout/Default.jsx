import { Outlet } from "react-router-dom";

export default function Default() {
  return (
    <>
      <div className="mx-auto min-h-screen max-w-md bg-transparent font-sans flex flex-col justify-center">
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}
