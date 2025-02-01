import FileTab from "@/app/components/documents/FileTab";
import { Tabs, TabsProps } from "antd";

export default function Documents() {
  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: '檔案',
      children: <FileTab />,
    },
    {
      key: '2',
      label: '類別與標籤',
      children: 'Content of Tab Pane 2',
    }
  ];

  return (
    <div className="w-[90%] flex flex-col grow overflow-auto py-5">
      <Tabs
        defaultActiveKey="1"
        items={tabItems}
      />
    </div>
  );
}
