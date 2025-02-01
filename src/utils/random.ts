import { Random } from 'random-js'

const random = new Random()

export const Normal = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

// no '1', 'l', 'i', 'I', '0', 'O', 'o'
export const Readable = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz'
export const LowerReadable = '23456789abcdefghjkmnpqrstuvwxyz'
export const UpperReadable = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

export const Lower = 'abcdefghijklmnopqrstuvwxyz'
export const Upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const Numeric = '1234567890'

export default random
