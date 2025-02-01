'use client';

import { Button, Space, Spin, Table, TableProps, Tag } from "antd";
import { useEffect, useState } from "react";
import { useClientConfig } from "../../../ui/chat/hooks/use-config";
import styles from '../userstab.module.scss';
import { DepartmentLabel } from "src/constants";
import { DocumentFileDocument } from "db/models";
import useAnchorAPI from "@/app/hooks/useAnchorAPI";

export default function UsersTable({  }) {
  const { backend } = useClientConfig();

  const [limit, setLimit] = useState(20);
  const [totalCount, setTotalCount] = useState(20);

  const fetchUsers = async (anchor: string | null) => {
    const response = await fetch(`${backend}/api/users?limit=${limit}${anchor ? `&anchor=${anchor}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    return {
      list: data.list,
      anchor: data.anchor,
    };
  };

  const { list, next, loading } = useAnchorAPI<DocumentFileDocument>(fetchUsers);


  const getTotalCount = async () => {
    const response = await fetch(`${backend}/api/users/count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    setTotalCount(data.count);
    return data.count;
  }

  const refetchList = async () => {
    await Promise.all([
      next(true),
      getTotalCount()
    ])
  }
  
  useEffect(() => {
    refetchList();
  }, []);

  const columns: TableProps<DocumentFileDocument>['columns'] = [
    {
      title: 'No #',
      key: 'number',
      render: (_, __, index) => index + 1
    },
    {
      title: 'ID',
      key: 'string',
      dataIndex: 'id'
    },
    {
      title: '使用者名稱',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '部門',
      dataIndex: 'department',
      key: 'department',
      render: (department: string) => DepartmentLabel[department] || '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            className={styles.actionButton}
            disabled
          >
            編輯
          </Button>
          <div>|</div>
          <Button
            type="link"
            danger
            className={styles.actionButton}
            disabled
            // onClick={}
          >
            取消
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-[100%]">
      <div className="flex flex-col gap-4 items-start">

        {loading
          ? (
            <div className="w-full flex justify-center items-center" style={{ minHeight: 300 }}>
              <Spin />
            </div>
          )
          : (
            <Table<DocumentFileDocument>
              columns={columns}
              dataSource={list}
              rowKey="id"
              pagination={{
                pageSize: limit,
                total: totalCount,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                onChange: (page, pageSize) => {
                  console.log('page:', page, pageSize);
                  if (pageSize !== limit) {
                    next(true);
                    setLimit(pageSize || 20);
                  } else {
                    next();
                  }
                }
              }}
              className={styles.usersTable}
            />
          )
        }
      </div>
    </div>
  )
}