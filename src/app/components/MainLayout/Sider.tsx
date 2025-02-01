'use client';

import React, { useEffect, useState } from "react";
import { Layout } from "antd";
import SideMenu from "./SideMenu";
import { useAppStore, useUserStore } from "src/stores";
import { logout } from "@/app/actions/auth";
import useDidMount from "@/app/hooks/useDidMount";
import { getProfile } from "@/app/actions/user";

const Sider: React.FC =  () => {
   const [collapsed, setCollapsed] = useState(false);
   const { Sider } = Layout;

   useDidMount(
    () => {
      console.log('[Sider] useDidMount, try to get profile')

      const updateProfile = async () => {
        const { setProfile, setLoaded } = useUserStore.getState()
        const { setDepartment } = useAppStore.getState()
        try {
          const { profile } = await getProfile()
          setProfile(profile)
          setDepartment(profile.department)
        } catch (err) {
          await logout();
          setProfile(null)
        }
        setLoaded(true)
       }

      updateProfile()
    }
  )
  
   return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
    >
      <SideMenu isCollapsed={collapsed} />
    </Sider>
   )
};

export default Sider;