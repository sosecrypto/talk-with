import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 개발 모드에서는 인증 우회
const isDev = process.env.NODE_ENV === 'development'

export default isDev
  ? function middleware(request: NextRequest) {
      // 개발 모드: 모든 요청 통과
      return NextResponse.next()
    }
  : withAuth({
      pages: {
        signIn: '/login',
      },
    })

export const config = {
  matcher: ['/chat/:path*', '/api/chat/:path*', '/api/conversations/:path*'],
}
