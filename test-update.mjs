import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('Finding profile...')
    const profile = await prisma.profile.findFirst({ where: { role: 'ALUNO' } })
    console.log('Found profile:', profile)
    if (profile) {
        console.log('Updating profile...')
        const updated = await prisma.profile.update({
            where: { id: profile.id },
            data: { emailAlternativo: 'teste-teste@gmail.com' }
        })
        console.log('Updated profile:', updated)
        
        // Re-fetch to confirm
        const refetch = await prisma.profile.findUnique({ where: { id: profile.id } })
        console.log('Re-fetched profile:', refetch)
    }
}

main().catch(console.error).finally(() => prisma.$disconnect())
