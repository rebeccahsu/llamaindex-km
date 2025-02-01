'use client';

import { Button, Modal, Space, Spin, Table, TableProps, Tag } from "antd";
import { useEffect, useState } from "react";
import moment from 'moment';
import { useAppStore } from "src/stores";
import { useClientConfig } from "../../../ui/chat/hooks/use-config";
import FileImporter from "@/app/components/ui/chat/widgets/FileImporter";
import styles from '../filetab.module.scss';
import { DepartmentLabel } from "src/constants";
import { DocumentFileDocument } from "db/models";
import PermissionFlags from "src/models/PermissionFlags";
import useAnchorAPI from "@/app/hooks/useAnchorAPI";

export default function FilesTable({  }) {
  const { backend } = useClientConfig();
  const { collectionName } = useAppStore();

  const [limit, setLimit] = useState(20);
  const [totalCount, setTotalCount] = useState(20);

  const fetchDocumentFiles = async (anchor: string | null) => {
    const response = await fetch(`${backend}/api/doc-files?limit=${limit}${anchor ? `&anchor=${anchor}` : ''}`, {
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

  const { list, next, loading } = useAnchorAPI<DocumentFileDocument>(fetchDocumentFiles);

  const onDeleteEntry = async (id: string, docIds: string[]) => {
    return new Promise<void>((resolve, reject) => {
      Modal.confirm({
      title: '確認刪除',
      content: '確認要刪除這個檔案嗎？',
      okText: '確認',
      cancelText: '取消',
      onOk: async () => {
        try {
        await handleDeleteEntry(id, docIds);
        resolve();
        } catch (error) {
        reject(error);
        }
      },
      onCancel: () => resolve()
      });
    });
  }

  const handleDeleteEntry = async (id: string, docIds: string[]) => {
    console.log('delete entry', id, docIds);
    await Promise.all([
      _deleteInMongo(id),
      _deleteInMilvus(docIds)
    ]);

    refetchList();
  }

  const _deleteInMilvus = async (docIds: string[]) => {
    console.log('[Milvus] delete entry', docIds);
    try {
      const res = await fetch(`${backend}/api/chunks/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          docIds: docIds,
          collectionName
        })
      });
      const data = await res.json();
      console.log('[Milvus] response:', data);
    } catch (err) {
      console.log(err);
      return
    }
  }

  const _deleteInMongo = async (id: string) => {
    console.log('[Mongo] delete entry', id);
    try {
      const res = await fetch(`${backend}/api/doc-files/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await res.json();
      console.log('[Mongo] response:', data);
    } catch (err) {
      console.log(err);
      return
    }
  }

  const getTotalCount = async () => {
    const response = await fetch(`${backend}/api/doc-files/count`, {
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
      title: '檔案名稱',
      dataIndex: 'name',
      key: 'name',
      render: (value, record, index) => {
        return (
          <a
            href={record.path}
            target="_blank"
          >
            {value}
          </a>
        )
      }
    },
    {
      title: '上傳時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '上次更新時間',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value) => value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (value) => {
        switch (value) {
          case 'indexed':
            return <Tag color="blue">已索引</Tag>;
          case 'failed':
            return <Tag color="red">失敗</Tag>;
          case 'pending':
          default:
            return <Tag color="orange">待處理</Tag>;
        }
      }
    },
    {
      title: '檔案權限',
      dataIndex: 'permission',
      key: 'permission',
      render: (value, record) => {
        const tags = PermissionFlags.permissionsToDepartments(value)

        return (
          <div className="flex">
            {tags?.length > 0
              ? tags.map(tag => (
                <Tag key={tag}>
                  {DepartmentLabel[tag]}
                </Tag>
              ))
              : '-'
            }
          </div>
        )
      }
    },
    {
      title: '標籤',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space size="middle">
          {tags?.length > 0
            ? tags.map(tag => (
              <Tag key={tag} color="blue">{tag}</Tag>
            ))
            : '-'
          }
        </Space>
      )
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
            onClick={() => onDeleteEntry(record.id, record.docIds)}
          >
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-[100%]">
      <div className="flex flex-col gap-4 items-start">
        <FileImporter
          refetchList={refetchList}
        />

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
              className={styles.filesTable}
            />
          )
        }
      </div>
    </div>
  )
}