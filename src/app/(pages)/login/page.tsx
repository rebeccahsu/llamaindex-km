'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions/auth' 
import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/es/form/Form'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form] = useForm();

  async function handleSubmit(values: any) {
    console.log('Received values of form: ', values);
    setLoading(true)

    const { email, password } = values;

    const result = await login({ email, password })

    if (result.success) {
      router.push('/chat')
      message.success('登入成功')
    } else {
      message.error('登入失敗')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            登入
          </h2>
        </div>
        <Form
          form={form}
          name="login"
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

          <Form.Item className="flex justify-center">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="mt-5"
            >
              登入
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}