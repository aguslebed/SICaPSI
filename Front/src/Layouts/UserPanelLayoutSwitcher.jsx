import React from 'react';
import { useUser } from '../context/UserContext';
import StudentLayout from './StudentLayout';
import TrainerLayout from './TrainerLayout';

/**
 * Chooses the appropriate layout for /userPanel routes based on user role.
 * - If role === 'Capacitador' -> TrainerLayout
 * - Otherwise -> StudentLayout
 */
export default function UserPanelLayoutSwitcher({ children }) {
  const { userData } = useUser();
  const role = userData?.user?.role;

  const Layout = role === 'Capacitador' ? TrainerLayout : StudentLayout;
  return <Layout>{children}</Layout>;
}
