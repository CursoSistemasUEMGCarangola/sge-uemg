import { prisma } from "@/lib/prisma"
import { getCurrentUserRole, createClient } from "@/lib/auth"

export async function getOfertasAtivas(periodo?: number) {
    const whereClause: any = { ativo: true }

    if (periodo) {
        whereClause.curso = {
            periodoVinculado: periodo
        }
    }

    const ofertas = await prisma.ofertaEstagio.findMany({
        where: whereClause,
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
            oferta: {
                include: {
                    curso: true
                }
            },
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
                    curso: {
                        include: {
                            curso: {
                                include: {
                                    unidade: true
                                }
                            }
                        }
                    },
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

export async function getInformacoesGerais() {
    return await prisma.informacoesGeraisEstagio.findMany({
        where: { ativo: true },
        orderBy: { descricao: 'asc' }
    })
}

export async function getAdminDashboardData() {
    const role = await getCurrentUserRole()
    if (!role) return { contratos: [], ofertas: [] }

    let whereClause: any = {}

    if (role === 'PROFESSOR') {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const professor = await prisma.professor.findUnique({
                where: { profileId: user.id }
            })
            if (professor) {
                whereClause.oferta = {
                    professorOrientadorId: professor.id
                }
            } else {
                return { contratos: [], ofertas: [] } // Professor profile not found
            }
        }
    } else if (role !== 'ADMIN') {
        return { contratos: [], ofertas: [] } // Aluno shouldn't call this
    }

    const contratos = await prisma.contratoEstagio.findMany({
        where: whereClause,
        include: {
            aluno: {
                include: {
                    profile: true
                }
            },
            campo: true,
            oferta: {
                include: {
                    curso: {
                        include: {
                            curso: {
                                include: {
                                    unidade: true
                                }
                            }
                        }
                    }
                }
            },
            acompanhamentos: {
                orderBy: { idEtapaDef: 'asc' },
                include: {
                    etapaDef: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    let ofertas: any[] = []
    if (role === 'PROFESSOR' && whereClause.oferta) {
        ofertas = await prisma.ofertaEstagio.findMany({
            where: {
                professorOrientadorId: whereClause.oferta.professorOrientadorId,
                ativo: true
            },
            include: {
                curso: {
                    include: {
                        curso: {
                            include: {
                                unidade: true
                            }
                        }
                    }
                }
            }
        })
    }

    return { contratos, ofertas }
}

export async function getFeriados() {
    return await prisma.feriadoRecesso.findMany({
        orderBy: { data: 'asc' }
    })
}
