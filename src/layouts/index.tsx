import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="w-full min-h-dvh flex flex-col">
      <Outlet />
    </div>
  );
}
