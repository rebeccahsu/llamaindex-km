import { useState } from "react";
import { Form, Input, Modal } from "antd";
import { useRouter } from "next/navigation";

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
  handleCreateNewChat: (name: string) => Promise<void>;
}

const NewChatModal = ({ open, onClose, handleCreateNewChat }: NewChatModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onCreateNewChat = async () => {
    try {
      setLoading(true);
      const isValid = await form.validateFields();
      console.log(isValid);
      await _createNewChat();
    } catch (error) {
      console.error('onCreateNewChat', error);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  const _createNewChat = async () => {
    const values = form.getFieldsValue();
    console.log('Creating new chat', values.name);
    await handleCreateNewChat(values.name);
    
    onClose();
  }

  return (
    <Modal
      title="New Chat"
      open={open}
      onOk={onCreateNewChat}
      onCancel={onClose}
      okButtonProps={{ loading }}
    >
      <Form
        form={form}
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Please input chat name!' }]}
        >
          <Input
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.keyCode !== 229 && !e.shiftKey) {
                e.preventDefault();
                onCreateNewChat();
              }
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default NewChatModal;