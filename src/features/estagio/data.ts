import { prisma } from "@/lib/prisma"

export async function getOfertasAtivas() {
    const ofertas = await prisma.ofertaEstagio.findMany({
        where: { ativo: true },
        include: {
            curso: true,
            professor: {
                include: {
                    profile: true
                }
            }
        }
    })

    return ofertas
}

export async function getStudentDashboardData(profileId: string) {
    const aluno = await prisma.aluno.findUnique({
        where: { profileId }
    })

    if (!aluno) return { contratos: [] }

    const contratos = await prisma.contratoEstagio.findMany({
        where: { idAluno: aluno.id },
        include: {
            campo: true,
            oferta: true,
            acompanhamentos: {
                orderBy: { idEtapaDef: 'asc' },
                include: {
                    etapaDef: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return { contratos }
}

export async function getAllContratos() {
    const contratos = await prisma.contratoEstagio.findMany({
        include: {
            aluno: {
                include: {
                    profile: true
                }
            },
            campo: true,
            oferta: {
                include: {
                    curso: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return contratos
}

export async function getContratoById(id: number) {
    return await prisma.contratoEstagio.findUnique({
        where: { id },
        include: {
            aluno: {
                include: { profile: true }
            },
            campo: true,
            oferta: {
                include: {
                    curso: true,
                    professor: {
                        include: { profile: true }
                    }
                }
            },
            acompanhamentos: {
                orderBy: { idEtapaDef: 'asc' },
                include: {
                    etapaDef: true
                }
            }
        }
    })
}

export async function getDiarioAtividades(contratoId: number) {
    return await prisma.diarioAtividade.findMany({
        where: { idContrato: contratoId },
        orderBy: { dataAtividade: 'asc' }
    })
}
