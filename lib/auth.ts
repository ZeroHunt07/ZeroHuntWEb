import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'zero-hunt-dev-secret-change-in-prod')

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload
  } catch {
    return null
  }
}

export async function getUserFromRequest(req: Request) {
  // Check Authorization header first
  const authHeader = req.headers.get('authorization')
  let token = ''
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }

  // If not in header, check cookies
  if (!token) {
    const cookieHeader = req.headers.get('cookie') || ''
    const match = cookieHeader.match(/zh_user_token=([^;]+)/)
    if (match) token = match[1]
  }

  if (!token) return null
  return await verifyToken(token)
}

export async function getAdminFromRequest(req: Request) {
  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.match(/zh_admin=([^;]+)/)
  if (!match) return null
  return await verifyToken(match[1])
}
