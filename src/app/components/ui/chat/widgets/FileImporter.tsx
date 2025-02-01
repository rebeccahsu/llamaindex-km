'use client';

import { useState } from "react";
import { Input, message, Button, Drawer, Select, Upload, Form, Space, InputProps } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { useClientConfig } from "../hooks/use-config";
import { useAppStore } from "src/stores";
import { Collections, DepartmentNames, DepartmentOptions, FileSources } from "src/constants";
import { useFile } from "../hooks/use-file";
import { UploadChangeParam, UploadFile } from "antd/es/upload";
import PermissionFlags, { Department } from "src/models/PermissionFlags";
import { ValidateStatus } from "antd/es/form/FormItem";

const { Dragger } = Upload;

export default function FileImporter({ className, refetchList }: { className?: string, refetchList?: (collectionName: string) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {collectionName, setCollectionName} = useAppStore();
  const [isImporting, setIsImporting] = useState(false);
  const [localFileList, setLocalFileList] = useState<File[]>([]);

  const { backend } = useClientConfig();

  const [form] = Form.useForm();

  const onOpenModal = () => {
    setIsModalOpen(true);
  }

  const onCloseModal = () => {
    setIsModalOpen(false);
  }

  const {
    uploadFile,
    files,
    removeDoc
  } = useFile();

  const onChangeLocalFiles = (info: UploadChangeParam<UploadFile<any>>) => {
    console.log('onChangeLocalFiles', info);
    if (info.file.status === 'done' && info.file.originFileObj) {
      console.log('done', info.file.originFileObj);
      setLocalFileList((prev) => [
        ...prev,
        info.file.originFileObj!].filter((file): file is File => file !== undefined));
      console.log('setLocalFiles', localFileList);
    } else if (info.file.status === 'removed') {
      setLocalFileList((prev) => prev.filter((f) => Object.values(f)[0] !== Object.values(info.file)[0]));
      console.log('setLocalFiles', localFileList);
    }
  }

  const onSubmit = async (values: any) => {
    console.log('Received values of form: ', values);

    const {
      fileSource,
      departments,
      customFileName,
      fileUrl
    } = values;

    const perms = new PermissionFlags({
      [Department.HR]: departments.includes(DepartmentNames.HR),
      [Department.RD]: departments.includes(DepartmentNames.RD),
      [Department.LEGAL]: departments.includes(DepartmentNames.Legal),
      [Department.A]: departments.includes(DepartmentNames.A),
      [Department.B]: departments.includes(DepartmentNames.B),
      [Department.C]: departments.includes(DepartmentNames.C),
      [Department.D]: departments.includes(DepartmentNames.D),
      [Department.E]: departments.includes(DepartmentNames.E),
      [Department.F]: departments.includes(DepartmentNames.F),
      [Department.G]: departments.includes(DepartmentNames.G),
      [Department.H]: departments.includes(DepartmentNames.H)
    })

    console.log('permission', perms.stringify());

    let timerId;

    try {
      setIsImporting(true);

      let res;
      
      if (fileSource === FileSources.GoogleDrive) {
        // TODO: refactor this part, figure out a better way to handle pending document
        timerId = setTimeout(() => {
          console.log('importing... refetch list');
          refetchList && refetchList(collectionName);
        }, 3000);

        res = await fetch(`${backend}/api/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collectionName,
            urls: [fileUrl],
            permission: perms.stringify(),
            ...customFileName && { customFileName },
          }),
        });
  
        console.log('[Import API response]', res);
        
        if (!res.ok) {
          const { message } = await res.json();
          throw new Error(`檔案匯入失敗：${message}`);
        }
      
      } else {
        timerId = setTimeout(() => {
          console.log('importing... refetch list');
          refetchList && refetchList(collectionName);
        }, 1500);
        
        await Promise.all(localFileList.map(async (file: File) => {
          try {
            const metadata = {
              permission: perms.stringify(),
              ...customFileName && { customFileName },
            }
            const res = await uploadFile(file, metadata);
            console.log('upload file response:', res);
            setLocalFileList((prev) => prev.filter((f) => Object.values(f)[0] !== Object.values(file)[0]));
          } catch (error: any) {
            throw new Error(`檔案匯入失敗：${error.message}`);
          }
        }));
      }

      message.success('檔案已成功匯入');
      form.resetFields();
      
    } catch (err) {
      console.log('import error:', err);
      message.error(`${(err as Error).message}`);
    } finally {
      setIsImporting(false);
      clearTimeout(timerId);
      onCloseModal();

      refetchList && refetchList(collectionName);
    }
  }

  const validateMessages = {
    required: "此欄位必填",
    // ...
  };

  const validateUrl = (
    url: string,
  ): {
    validateStatus: ValidateStatus;
    errorMsg: string | null;
  } => {
    if (url.startsWith('https://drive.google.com')) {
      return {
        validateStatus: 'success',
        errorMsg: null,
      };
    }
    return {
      validateStatus: 'error',
      errorMsg: 'Invalid URL',
    };
  };

  const [url, setUrl] = useState<{
    value: string;
    validateStatus?: ValidateStatus;
    errorMsg?: string | null;
  }>({ value: '' });

  const onUrlChange: InputProps['onChange'] = (e) => {
    setUrl({
      ...validateUrl((e.target as HTMLInputElement).value),
      value: (e.target as HTMLInputElement).value,
    });
  };

  const normFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <>
      <Button
        onClick={onOpenModal}
        className={className}
        icon={<UploadOutlined />}
        type="primary"
      >
        上傳檔案
      </Button>
      
      <Drawer
        title="Import File"
        placement="right"
        closable={true}
        onClose={onCloseModal}
        open={isModalOpen}
        width="min(600px, 80%)"
      >
        <Form
          form={form}
          name="import-files"
          onFinish={onSubmit}
          validateMessages={validateMessages}
          className="flex flex-col gap-1"
        >
          <Form.Item
            name="fileSource"
            label="上傳方式："
            initialValue={FileSources.GoogleDrive}
            rules={[{ required: true }]}
          >
            <Select
              options={[
                {
                  label: '上傳連結',
                  value: FileSources.GoogleDrive
                },
                {
                  label: '上傳檔案',
                  value: FileSources.LocalFile
                }
              ]}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.fileSource !== currentValues.fileSource}
          >
            {({ getFieldValue }) =>
              getFieldValue('fileSource') === FileSources.GoogleDrive
              ? (
                <>
                  <Form.Item
                    name="fileUrl"
                    label=""
                    rules={[{ required: true, message: 'Please input your username!' }]}
                    validateStatus={url.validateStatus}
                    help={url.errorMsg}
                  >
                    <Input
                      placeholder="google drive file url"
                      value={url.value} onChange={onUrlChange}
                    />
                  </Form.Item>
                </>
              )
              : (
                <Form.Item>
                  <Form.Item
                    name="localFiles"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    noStyle
                    rules={[{ required: true }]}
                  >
                    <Dragger
                      name="file"
                      multiple
                      onChange={onChangeLocalFiles}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">Click or drag file to this area to upload</p>
                      <p className="ant-upload-hint">
                        Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                        banned files.
                      </p>
                    </Dragger>
                  </Form.Item>
                </Form.Item>
              )
            }
          </Form.Item>
          <div>
            <span>Collection Name: </span>
            <span>{Collections[collectionName]?.label || collectionName}</span>
          </div>

          <Form.Item name="departments" label="檔案權限：" rules={[{ required: true }]}>
            <Select
              options={DepartmentOptions}
              mode="multiple"
            />
          </Form.Item>

          <Form.Item
            name="customFileName"
            label="檔案名稱："
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button htmlType="button" onClick={onCloseModal}>
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isImporting}
              >
                送出
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  )
}