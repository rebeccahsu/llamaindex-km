interface File {
  id?: string
  name: string
  path: string
  totalPages: number

  createdAt?: string
  updatedAt?: string
  status?: string
  category?: string
  tags?: string[]
}

export default File
