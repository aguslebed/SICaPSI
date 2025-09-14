import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '../Components/Student/NavBar';
import SideBar from '../Components/Student/SideBar';

export default function StudentLayout() {
  const location = useLocation();
  // Normalize pathname (remove trailing slash) and detect the index route for userPanel.
  const pathname = location.pathname.replace(/\/$/, '');
  const isUserPanelIndex = pathname === '/userPanel';

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-100">
        <div className={`max-w-screen-xl w-full mx-auto flex px-4 sm:px-6 md:px-8 py-6 md:py-8 ${isUserPanelIndex ? 'justify-center' : ''}`}>
          {/* Render SideBar for all userPanel child routes except the index (`/userPanel`) */}
          {!isUserPanelIndex && <SideBar />}

          {/* When sidebar is hidden (index) constrain and center main content; otherwise let it fill the remaining space */}
          <main className={`flex-1 min-w-0 ${isUserPanelIndex ? 'max-w-4xl' : ''}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
