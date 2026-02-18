import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isDev = process.env.NODE_ENV === 'development'

// NextAuth v4 세션 쿠키 이름
// HTTPS(production)에서는 __Secure- prefix 사용
const SECURE_SESSION_COOKIE = '__Secure-next-auth.session-token'
const SESSION_COOKIE = 'next-auth.session-token'

function hasSessionCookie(request: NextRequest): boolean {
  return (
    request.cookies.has(SECURE_SESSION_COOKIE) ||
    request.cookies.has(SESSION_COOKIE)
  )
}

export function proxy(request: NextRequest) {
  // 개발 모드: 인증 우회
  if (isDev) {
    return NextResponse.next()
  }

  // 세션 쿠키 미존재 시 로그인 페이지로 리다이렉트
  if (!hasSessionCookie(request)) {
    // API 요청은 401 반환
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 페이지 요청은 로그인으로 리다이렉트
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/chat/:path*', '/settings/:path*', '/api/chat/:path*', '/api/conversations/:path*', '/api/settings/:path*'],
}
