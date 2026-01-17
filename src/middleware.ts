import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // 1. Redirect unauthenticated users to Login
    if (!user && request.nextUrl.pathname !== '/' && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
        // Allow public assets
        if (request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.startsWith('/static') || request.nextUrl.pathname.includes('.')) {
            return response
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. RBAC (Role Based Access Control)
    // Prereq: We need to know the user's role. 
    // Optimization: In a real scenario, we might store role in metadata or decode a JWT.
    // For now, we will assume strict separation:
    // - /admin/** -> Only PROFESSOR/ADMIN
    // - /aluno/** -> Only ALUNO

    // Note: Fetching Profile from DB in middleware is expensive. 
    // We should ideally use user_metadata or Custom Claims.
    // For this Phase 1 implementation, `getUser` is sufficient to check authentication.
    // We will defer strict DB-based role check to the Layout or Page level (via Server Components) or add it here if performance allows (requires independent supabase client).

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
