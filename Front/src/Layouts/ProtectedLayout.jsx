import React, { useEffect } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function SetUserData({ me }) {
  const { userData, setUserData } = useUser();
  useEffect(() => {
    // Only initialize context from the loader when there is no existing userData in context.
    // This avoids overwriting client-side updates (e.g. after messaging actions) with loader data
    // that may be stale during navigation.
    if (!userData) {
      setUserData(me);
    }
    // Intentionally do not overwrite userData on subsequent loader runs to preserve local updates.
  }, [me, userData, setUserData]);
  return <Outlet />;
}

export default function ProtectedLayout() {
  const { me } = useLoaderData();
  return <SetUserData me={me} />;
}
