'use client';

import React, { useEffect, useState } from "react";
import { Layout, Button, Menu, Spin, Modal } from "antd";
import { CloseOutlined, EditOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import NewChatModal from "../NewChatModal";
import ChatHistory from "src/models/ChatHistory";
import { usePathname, useRouter } from "next/navigation";
import { useClientConfig } from "../ui/chat/hooks/use-config";
import styles from "./ChatHistorySider.module.scss";
import { deleteChatHistoryById } from "@/app/actions/chatHistory";

const { Sider } = Layout;

interface ChatHistorySiderCSRProps {
  
}

const ChatHistorySiderCSR: React.FC<ChatHistorySiderCSRProps> = () => {
  const { backend } = useClientConfig();
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatList, setChatList] = useState<ChatHistory[]>([]);
  const [fetching, setIsFetching] = useState(false);
  const router = useRouter();

  const handleCreateNewChat = async (name: string) => {
    try {
      const res = await fetch(`${backend}/api/chat-history/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
        }),
      });
      const { data } = await res.json();
      setChatList([...chatList, data]);
      router.push(`/chat/${data.id}`);
    } catch (error) {
      console.error('createNewChat', error);
    }
  }

  const getChatHistories = async () => {
    try {
      setIsFetching(true);
      const response = await fetch(`${backend}/api/chat-history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const { list } = await response.json();
      setChatList(list);
    } catch (error) {
      console.error('Failed to fetch chat histories:', error);
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    getChatHistories();
  }, []);

  return collapsed
  ? (
    <div className="relative">
      <Button
        type="text"
        onClick={() => setCollapsed(!collapsed)}
        icon={<MenuUnfoldOutlined />}
        className="!absolute top-1 left-1"
      />
    </div>
  ) : (
    <>
      <Sider
        // collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        collapsedWidth={0}
        className={styles.sider}
      >
        <div className="flex items-center justify-between p-1">
          <div className="flex items-center">
            <Button
              type="text"
              onClick={() => setCollapsed(!collapsed)}
              icon={<MenuFoldOutlined />}
            />
            <div>
              與 AI 對話
            </div>
          </div>

          <Button
            type="text"
            onClick={() => setIsModalOpen(true)}
            icon={<EditOutlined />}
          />
        </div>
        <ChatHistoryMenu
          chatList={chatList}
          isFetching={fetching}
          getChatHistories={getChatHistories}
        />
      </Sider>

      <NewChatModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleCreateNewChat={handleCreateNewChat}
      />
    </>
  );
};

const ChatHistoryMenu: React.FC<{
  chatList: ChatHistory[],
  isFetching: boolean,
  getChatHistories: () => Promise<void>
}> = ({ chatList, isFetching, getChatHistories }) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentChatId = pathname.split('/').pop() || '';

  const onMenuClick = (item: any) => {
    router.push(`/chat/${item.key}`);
  }

  return isFetching
    ? (
      <div className="flex items-center justify-center mt-2.5">
        <Spin />
      </div>
    )
    : (
      <Menu
        selectedKeys={[currentChatId]}
        mode="inline"
        theme="light"
        items={chatList.map((chat) => ({
          key: chat.id,
          label: chat.name,
          extra: (
            <div className={styles.deleteButton}>
              <Button
                size="small"
                type="text"
                onClick={(e) => {
                  e.stopPropagation();
                  return new Promise<void>((resolve, reject) => {
                    Modal.confirm({
                    title: '確認刪除',
                    content: `確認要刪除對話 ${chat.name} 嗎？`,
                    okText: '確認',
                    cancelText: '取消',
                    onOk: async () => {
                      try {
                      const res = await deleteChatHistoryById(chat.id);
                      await getChatHistories();
                      resolve();
                      } catch (error) {
                      reject(error);
                      }
                    },
                    onCancel: () => resolve()
                    });
                  });
                }}
              >
                <CloseOutlined style={{ color: '#9f9f9f' }} />
              </Button>
            </div>
          ),
        }))}
        onClick={onMenuClick}
        className={styles.menu}
      />
    );
}

export default ChatHistorySiderCSR;