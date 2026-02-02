import { PrismaClient, Role, StatusEtapa } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Iniciando o Seed do Banco de Dados...')

    // 1. Limpeza (Opcional)
    // Para dev local, pode ser útil
    /*
    await prisma.diarioAtividade.deleteMany()
    await prisma.acompanhamentoEtapa.deleteMany()
    await prisma.contratoEstagio.deleteMany()
    await prisma.ofertaEstagio.deleteMany()
    await prisma.campoEstagio.deleteMany()
    await prisma.cursoEstagio.deleteMany()
    await prisma.etapaDefinicao.deleteMany()
    await prisma.aluno.deleteMany()
    await prisma.professor.deleteMany()
    await prisma.profile.deleteMany()
    await prisma.systemConfig.deleteMany()
    */

    // 2. Criar as 8 Etapas Obrigatórias
    console.log('📋 Criando Definições de Etapas...')
    const etapasData = [
        {
            numeroEtapa: 1,
            descricao: "Entrega de Documentos Físicos",
            orientacaoTextual: "Protocole a entrega dos documentos físicos (TCE) no setor de protocolos da Instituição.",
            systemAction: "GENERATE_DOC_CAPA"
        },
        {
            numeroEtapa: 2,
            descricao: "Conferência de Dados",
            orientacaoTextual: "Aguarde a conferência dos dados informados nos documentos entregues."
        },
        {
            numeroEtapa: 3,
            descricao: "Assinaturas Institucionais",
            orientacaoTextual: "Aguarde a validação e assinaturas necessárias da instituição."
        },
        {
            numeroEtapa: 4,
            descricao: "Entrega do Plano de Atividades",
            orientacaoTextual: "Preencha, imprima e protocole o Plano de Atividades no setor de protocolos."
        },
        {
            numeroEtapa: 5,
            descricao: "Conferência do Plano",
            orientacaoTextual: "Aguarde a conferência e aprovação do seu Plano de Atividades."
        },
        {
            numeroEtapa: 6,
            descricao: "Entrega do Relatório Final",
            orientacaoTextual: "Ao fim do estágio, preencha, imprima e protocole o Relatório de Avaliação.",
            systemAction: "FILL_FINAL_REPORT"
        },
        {
            numeroEtapa: 7,
            descricao: "Conferência do Relatório",
            orientacaoTextual: "Aguarde a conferência do seu Relatório de Avaliação."
        },
        {
            numeroEtapa: 8,
            descricao: "Verificação Final",
            orientacaoTextual: "Aguarde a verificação final de pendências para conclusão do estágio."
        }
    ]

    for (const etapa of etapasData) {
        // Usando o numeroEtapa como ID já que no seed anterior assumimos isso.
        // No schema atual, EtapaDefinicao.id é Int @default(autoincrement()) mas sem autoincrement implicito no CREATE se passarmos ID.
        // O seed original fazia upsert no ID.
        await prisma.etapaDefinicao.upsert({
            where: { id: etapa.numeroEtapa },
            update: {},
            create: {
                id: etapa.numeroEtapa,
                numeroEtapa: etapa.numeroEtapa,
                descricao: etapa.descricao,
                orientacaoTextual: etapa.orientacaoTextual,
                systemAction: (etapa as any).systemAction // Add logic to handle optional property safely or update interface above
            },
        })
    }

    // 3. Criar Cursos
    console.log('📚 Criando Cursos...')
    // Precisamos salvar a referencia para usar o ID autogerado
    const curso1 = await prisma.cursoEstagio.create({
        data: {
            nome: "Estágio Supervisionado I",
            periodoVinculado: 7,
            cargaHorariaTotal: 150
        }
    })

    // 4. Criar Usuários (Profiles + Roles)
    console.log('👥 Criando Usuários (Professor e Aluno)...')

    const professorUuid = uuidv4()
    const professor = await prisma.professor.create({
        data: {
            masp: "123456-7",
            profile: {
                create: {
                    id: professorUuid,
                    email: "professor@uemg.br",
                    nomeCompleto: "Dr. Orientador Socrático",
                    role: Role.PROFESSOR
                }
            }
        }
    })

    const alunoUuid = uuidv4()
    const aluno = await prisma.aluno.create({
        data: {
            matricula: "2026001",
            periodoAtual: 7,
            profile: {
                create: {
                    id: alunoUuid,
                    email: "aluno@uemg.br",
                    nomeCompleto: "João Estagiário da Silva",
                    role: Role.ALUNO
                }
            }
        }
    })

    // 5. Criar Campo de Estágio
    console.log('🏢 Criando Campo de Estágio...')
    const campo = await prisma.campoEstagio.create({
        data: {
            razaoSocial: "Tech Solutions Ltda",
            nomeFantasia: "TechSol",
            telefoneContato: "(32) 99999-9999",
            emailContato: "rh@techsol.com",
            supervisorNome: "Maria Supervisora",
            supervisorCargo: "Tech Lead",
            supervisorAreaFormacao: "Sistemas de Informação",
            supervisorTitulacao: "Especialista",
            supervisorTelefone: "(32) 98888-8888",
            supervisorEmail: "maria@techsol.com"
        }
    })

    // 6. Criar Oferta de Estágio
    console.log('📅 Criando Oferta de Estágio...')
    const oferta = await prisma.ofertaEstagio.create({
        data: {
            semestreLetivo: "2026-1",
            // Campos renomeados no schema
            cursoEstagioId: curso1.id,
            professorOrientadorId: professor.id,
            ativo: true,
            dataInicio: new Date("2026-02-01"),
            dataFim: new Date("2026-07-01")
        }
    })

    // 7. Criar Contrato de Estágio
    console.log('📝 Criando Contrato de Estágio...')
    const contrato = await prisma.contratoEstagio.create({
        data: {
            // IDs renomeados
            idAluno: aluno.id,
            idOferta: oferta.id,
            idCampo: campo.id,

            modalidade: 'HIBRIDO',
            tipoDocumentacao: 'TCE',
            atribuicoes: "Desenvolvimento de software full-stack utilizando React e Node.js",
            dataInicioPrevista: new Date("2026-02-01"),
            cargaHorariaDiaria: 6,
            statusAprovacao: "ATIVO",

            acompanhamentos: {
                create: etapasData.map(e => ({
                    idEtapaDef: e.numeroEtapa, // Campo renomeado
                    status: StatusEtapa.PENDENTE
                }))
            }
        }
    })

    // 8. Config do Sistema
    console.log('⚙️ Criando Configurações do Sistema...')
    await prisma.systemConfig.upsert({
        where: { key: 'janela_cadastro_aberta' },
        update: {},
        create: {
            key: 'janela_cadastro_aberta',
            value: 'true'
        }
    })

    console.log(`✅ Seed concluído com sucesso!`)
    console.log(`🔑 Professor UUID (Simulado): ${professorUuid}`)
    console.log(`🔑 Aluno UUID (Simulado): ${alunoUuid}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })