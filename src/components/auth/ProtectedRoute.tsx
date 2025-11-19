import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';

export const UserProtectedRoute = () => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  return currentUser ? <Outlet /> : <Navigate to="/signin" />;
};

export const OrganizerProtectedRoute = () => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const isOrganizer = currentUser?.roles?.includes('ROLE_ORGANIZER');

  if (!currentUser) {
    return <Navigate to="/signin" />;
  }

  return isOrganizer ? <Outlet /> : <Navigate to="/unauthorized" />;
};