import { headers } from 'next/headers'

export async function getServerBaseUrl() {
    const headersList = await headers()
    const host = headersList.get('host')
    const proto = headersList.get('x-forwarded-proto') || 'https'

    if (host && !host.includes('localhost')) {
        return `${proto}://${host}/`
    }
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/`
    return 'http://localhost:3000/' // Fallback
}
