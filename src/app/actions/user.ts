'use server'

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

import { UserModel } from 'db/models'
import { SECRET_KEY, TOKEN_KEY } from 'src/constants'
import { CError } from 'src/common/error'

export async function getProfile() {
  const cookieStore = cookies()

  const token = cookieStore.get(TOKEN_KEY)?.value

  if (!token) {
    throw new Error('Not authenticated')
  }

  let decoded: jwt.JwtPayload
  try {
    const decodedToken = jwt.verify(token, SECRET_KEY)
    if (typeof decodedToken === 'string') {
      throw new Error('Invalid token')
    }
    decoded = decodedToken
  } catch (error) {
    throw new Error('Invalid token')
  }

  const user = await UserModel.findById(decoded.id)
  console.log('found user', user)

  if (!user) {
    throw new Error('User not found')
  }

  return {
    status: 200,
    profile: {
      id: `${user._id}`,
      email: user.email,
      name: user.name,
      department: user.department
    }
  }
}

export async function updateDepartment(id: string, department: string) {
  const doc = await UserModel.findById(id)
  if (!doc) throw new CError(404, 'user not found')

  const user = await UserModel.findByIdAndUpdate(
    id,
    { $set: { department } },
    { new: true, select: '_id email name department' }
  )

  return {
    id: `${user._id}`,
    email: user.email,
    name: user.name,
    department: user.department
  }
}