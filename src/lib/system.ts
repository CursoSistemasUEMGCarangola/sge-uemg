import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function isJanelaCadastroAberta(): Promise<boolean> {
    const config = await prisma.systemConfig.findUnique({
        where: { key: 'janela_cadastro_aberta' },
    })

    return config?.value === 'true'
}

export async function setJanelaCadastro(aberta: boolean): Promise<void> {
    await prisma.systemConfig.upsert({
        where: { key: 'janela_cadastro_aberta' },
        update: { value: String(aberta) },
        create: {
            key: 'janela_cadastro_aberta',
            value: String(aberta)
        }
    })
}
