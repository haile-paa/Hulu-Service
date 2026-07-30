import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Scene3D from "./Scene3D";

export default function Layout() {
  return (
    <div className='bg-base-950 relative min-h-screen'>
      <Scene3D variant='dashboard' />
      <div
        className='pointer-events-none fixed inset-0 -z-10'
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139,92,246,0.15), transparent)",
        }}
      />
      <Sidebar />
      <main className='relative ml-64 min-h-screen px-8 py-8'>
        <div className='mx-auto max-w-7xl'>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
