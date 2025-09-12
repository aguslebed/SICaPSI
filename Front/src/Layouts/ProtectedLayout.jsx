import React, { useEffect } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import { useUser } from '../Context/UserContext';

function SetUserData({ me }) {
  const { setUserData } = useUser();
  useEffect(() => {
    setUserData(me);
  }, [me, setUserData]);
  return <Outlet />;
}

export default function ProtectedLayout() {
  const { me } = useLoaderData();
  return <SetUserData me={me} />;
}
