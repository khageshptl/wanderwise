"use client";
import React, { useEffect, useState } from 'react'
import Header from './_components/Header';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { UserDetailsContext } from '@/context/UserDetailsContext';
import { TripContextType, TripDetailContext } from '@/context/TripDetailContex';
import { TripInfo } from './create-new-trip/_components/ChatBox';

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const CreateUser = useMutation(api.user.CreateNewUser);

  const [userDetails, setUserDetails] = useState<any>();
  
  const [tripDetailInfo, setTripDetailInfo] = useState<TripInfo | null>(null);

  const { user } = useUser();

  useEffect(() => {
    user && CreateNewUser();
  }, [user])

  const CreateNewUser = async () => {
    if (user) {
      // sva new user if not exist
      const result = await CreateUser({
        name: user?.fullName ?? 'Wanderer',
        email: user?.primaryEmailAddress?.emailAddress ?? '',
        imageUrl: user?.imageUrl,
      });
      setUserDetails(result);
    }
  }
  return (
    <UserDetailsContext.Provider value={{userDetails, setUserDetails}}>
      <TripDetailContext.Provider value={{tripDetailInfo, setTripDetailInfo}}>
      <div>
        <Header />
        {children}
      </div>
      </TripDetailContext.Provider>
    </UserDetailsContext.Provider>
  )
}

export default Provider

export const useUserDetails = () => React.useContext(UserDetailsContext);

export const useTripDetails = ():TripContextType | undefined => React.useContext(TripDetailContext);