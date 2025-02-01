import { Tabs, TabsProps } from "antd";

import DepartmentSelector from "@/app/components/DepartmentSelector";
import UsersTab from "@/app/components/users/UsersTab";
import { Suspense } from "react";

export default function Users() {
  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: '使用者列表',
      children: <UsersTab />,
    },
    {
      key: '2',
      label: '部門',
      children: 'Content of Tab Pane 2',
    }
  ];

  return (
    <div className="w-[90%] flex flex-col grow overflow-auto py-5">
      <div>
        使用者權限管理

        <DepartmentSelector />
      </div>
      <Tabs
        defaultActiveKey="1"
        items={tabItems}
      />
    </div>
  );
}
