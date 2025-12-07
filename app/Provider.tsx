"use client";
import React, { useEffect, useState } from 'react'
import Header from './_components/Header';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { UserDetailsContext } from '@/context/UserDetailsContext';
import { TripContextType, TripDetailContext } from '@/context/TripDetailContex';
import { TripInfo } from './create-new-trip/_components/ChatBox';
import { usePathname } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const CreateUser = useMutation(api.user.CreateNewUser);

  const [userDetails, setUserDetails] = useState<any>();

  const [tripDetailInfo, setTripDetailInfo] = useState<TripInfo | null>(null);

  const { user } = useUser();
  const path = usePathname();

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
      toast.success('Logged in successfully!');
    }
  }
  return (
    <UserDetailsContext.Provider value={{ userDetails, setUserDetails }}>
      <TripDetailContext.Provider value={{ tripDetailInfo, setTripDetailInfo }}>
        {/* <div> */}
        <div className="relative">
          <Header />
          <div className={path == '/' ? '' : 'mt-20 md:mt-24'}>
            {children}
          </div>
          <Toaster />
        </div>
        {/* </div> */}
      </TripDetailContext.Provider>
    </UserDetailsContext.Provider>
  )
}

export default Provider

export const useUserDetails = () => React.useContext(UserDetailsContext);

export const useTripDetails = (): TripContextType | undefined => React.useContext(TripDetailContext);