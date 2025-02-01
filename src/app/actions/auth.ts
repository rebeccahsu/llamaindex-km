'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Crypto from 'crypto'
import jwt from 'jsonwebtoken'

import { UserModel } from 'db/models'
import Random from 'src/utils/random'
import { SECRET_KEY, TOKEN_KEY } from 'src/constants'

type LoginFormData = {
  email: string
  password: string
}

type RegisterFormData = {
  email: string
  password: string
  name?: string
}

export async function login(formData: LoginFormData) {
  const cookieStore = cookies()
  
  try {
    const { email, password } = formData;
    const user = await UserModel.findOne({
      email
    })

    console.log('-----login find user-----', user)

    if (!user) {
      throw new Error('Wrong email')
    }

    const hash = Crypto.createHash('sha256').update(`${password}.${user.salt}`).digest('hex')
    if (user.password !== hash) {
      throw new Error('Password is incorrect')
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, {
      issuer: 'https://www.km.com.tw',
      audience: 'web',
      expiresIn: 60 * 60 * 24 * 6.5
    })

    // Set the session cookie
    cookieStore.set(TOKEN_KEY, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return { success: true }
  
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Login failed' 
    }
  }
}

export async function logout() {
  const cookieStore = cookies()

  cookieStore.set(TOKEN_KEY, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0
  })

  return redirect('/login')
}

export async function register(formData: RegisterFormData) {
  try {
    const { email, password, name } = formData;

    const salt = Random.hex(32)
    const user = await UserModel.create({
      email,
      salt,
      password: Crypto.createHash('sha256').update(`${password}.${salt}`).digest('hex'),
      name
    })

    console.log('-----registered-----', user)

    return { success: true }
  
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Register failed' 
    }
  }
}