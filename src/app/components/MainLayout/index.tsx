import React from "react";
import Layout from "antd/es/layout/layout"
import Sider from "./Sider";
import CurrentCollection from "./CurrentCollection";
import styles from './mainLayout.module.scss';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout
      style={{ height: '100vh' }}
    >
      <Sider />

      <main className={styles.mainContainer}>
        {/* <CurrentCollection /> */}
        {children}
      </main>
    </Layout>
  )
}