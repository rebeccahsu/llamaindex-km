'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, register } from '@/app/actions/auth' 
import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form] = useForm();

  async function handleSubmit(values: any) {
    console.log('Received values of form: ', values);
    setLoading(true)

    const { email, password, name } = values;

    const result = await register({ email, password, name })

    if (result.success) {
      router.push('/login')
      message.success('註冊成功')
    } else {
      message.error('註冊失敗')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            註冊
          </h2>
        </div>
        <Form
          form={form}
          name="signUp"
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              註冊
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}