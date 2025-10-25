import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '../Components/Student/NavBar';
import TrainerSideBar from '../Components/Trainer/sideBar';

export default function TrainerLayout() {
  const location = useLocation();
  // Normalize pathname (remove trailing slash) and detect the index route for userPanel.
  const pathname = location.pathname.replace(/\/$/, '');
  const isUserPanelIndex = pathname === '/trainer';
  const isMessagesRoute = pathname.startsWith('/trainer') && pathname.includes('/messages');

  // TrainerLayout always shows the TrainerSideBar
  const SideBarComponent = TrainerSideBar;

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-100">
        <div className={`max-w-screen-xl w-full mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 px-4 sm:px-6 md:px-8 py-6 md:py-8 ${isUserPanelIndex ? 'justify-center' : ''}`}>
          {/* Render SideBar for all userPanel child routes except the index (`/userPanel`) */}
          {!isUserPanelIndex && (
            <div className={(isMessagesRoute ? 'hidden lg:block ' : '') + 'lg:mt-10 lg:sticky lg:top-24 lg:self-start'}>
              <SideBarComponent />
            </div>
          )}

          {/* When sidebar is hidden (index) constrain and center main content; otherwise let it fill the remaining space */}
          <main className={`flex-1 min-w-0 ${isUserPanelIndex ? 'max-w-4xl' : ''}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
