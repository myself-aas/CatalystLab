import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // For Firebase, we typically handle auth on the client side 
  // or use session cookies for middleware protection.
  // For now, we'll allow requests to pass through and handle 
  // protection in the components or layout.
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
