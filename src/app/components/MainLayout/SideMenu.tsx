'use client';

import React, { useCallback, useState } from 'react';
import {
  CommentOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Menu, message } from 'antd';
import { DepartmentLabel, Routes } from 'src/constants';
import { useRouter, usePathname } from 'next/navigation';
import styles from './mainLayout.module.scss';
import Image from 'next/image';
import logo from 'public/logo.png';
import logoIcon from 'public/logo-icon.svg';
import { logout } from '@/app/actions/auth';
import { useUserStore } from 'src/stores';
import useProfile from '@/app/hooks/useProfile';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  { key: Routes.Chat, icon: <CommentOutlined />, label: '與 AI 對話' },
  { key: Routes.Documents, icon: <DatabaseOutlined />, label: '知識文件管理' },
  { key: Routes.Users, icon: <DeploymentUnitOutlined />, label: '使用者權限管理' }
];

interface SideMenuProps {
  isCollapsed: boolean;
}

const SideMenu: React.FC<SideMenuProps> = ({ isCollapsed }) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useUserStore();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const onMenuClick: MenuProps['onClick'] = (e) => {
    router.push(e.key as string);
  };

  const onLogout = async () => {
    try {
      await logout();
      message.success('登出成功');
      router.push(Routes.Login);
    } catch (error) {
      message.error('登出失敗');
    }
  };

  useProfile((profile) => {
    console.log('[SideMenu] useProfile', profile)
  })

  return (
    <div className={styles.sideMenu}>
      {/* <Button type="primary" onClick={toggleCollapsed} style={{ marginBottom: 16 }}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button> */}
      <div className={styles.logo}>
        <Image
          src={isCollapsed ? logoIcon : logo}
          alt="logo"
        />
      </div>
      <Menu
        defaultSelectedKeys={[pathname]}
        mode="inline"
        theme="dark"
        // inlineCollapsed={collapsed}
        items={items}
        onClick={onMenuClick}
      />

      <div className={styles.bottom}>
        {profile && (
          <div className={styles.profile}>
            <div>
              Hi, {profile?.name ?? 'Guest'} [{profile?.department ? DepartmentLabel[profile.department] : 'N/A'}]
            </div>
          </div>
        )}

        <Button
          className={styles.logoutButton}
          type="primary"
          onClick={onLogout}
        >
          登出
        </Button>
      </div>
    </div>
  );
};

export default SideMenu;