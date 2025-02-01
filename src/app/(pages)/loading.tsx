import { Spin } from "antd"

export default function Loading() {
  return (
    <div className="h-screen flex justify-center items-center">
      <Spin />
    </div>
  )
}