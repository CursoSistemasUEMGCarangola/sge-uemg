import { NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // 1. Verificar autenticação e role ADMIN
        const role = await getCurrentUserRole()
        if (role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Acesso não autorizado. Apenas administradores podem realizar backups.' },
                { status: 401 }
            )
        }

        // 2. Consultar todas as tabelas em paralelo + auth.users
        const supabaseAdmin = createAdminClient()

        const [
            profiles,
            alunos,
            professores,
            unidadesAcademicas,
            cursos,
            cursosEstagio,
            camposEstagio,
            ofertasEstagio,
            contratosEstagio,
            etapasDefinicao,
            acompanhamentosEtapa,
            diariosAtividade,
            feriadosRecesso,
            documentosModelo,
            informacoesGeraisEstagio,
            systemConfig,
            authUsersResponse,
        ] = await Promise.all([
            prisma.profile.findMany(),
            prisma.aluno.findMany(),
            prisma.professor.findMany(),
            prisma.unidadeAcademica.findMany(),
            prisma.curso.findMany(),
            prisma.cursoEstagio.findMany(),
            prisma.campoEstagio.findMany(),
            prisma.ofertaEstagio.findMany(),
            prisma.contratoEstagio.findMany(),
            prisma.etapaDefinicao.findMany(),
            prisma.acompanhamentoEtapa.findMany(),
            prisma.diarioAtividade.findMany(),
            prisma.feriadoRecesso.findMany(),
            prisma.documentoModelo.findMany(),
            prisma.informacoesGeraisEstagio.findMany(),
            prisma.systemConfig.findMany(),
            supabaseAdmin.auth.admin.listUsers(),
        ])

        // Extrair dados dos auth.users (email, id, metadados — sem senhas)
        const authUsers = (authUsersResponse.data?.users ?? []).map(user => ({
            id: user.id,
            email: user.email,
            email_confirmed_at: user.email_confirmed_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
            last_sign_in_at: user.last_sign_in_at,
            app_metadata: user.app_metadata,
            user_metadata: user.user_metadata,
        }))

        // 3. Montar objeto de backup com metadados
        const data = {
            authUsers,
            profiles,
            alunos,
            professores,
            unidadesAcademicas,
            cursos,
            cursosEstagio,
            camposEstagio,
            ofertasEstagio,
            contratosEstagio,
            etapasDefinicao,
            acompanhamentosEtapa,
            diariosAtividade,
            feriadosRecesso,
            documentosModelo,
            informacoesGeraisEstagio,
            systemConfig,
        }

        const totalRecords = Object.values(data).reduce(
            (sum, table) => sum + (table as unknown[]).length, 0
        )

        const backup = {
            metadata: {
                exportDate: new Date().toISOString(),
                version: '2.0',
                tables: Object.keys(data).length,
                totalRecords,
                includesAuthUsers: true,
            },
            data,
        }

        // 4. Retornar como download JSON
        const jsonString = JSON.stringify(backup, null, 2)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        const filename = `sge-backup-${timestamp}.json`

        return new NextResponse(jsonString, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error('[BACKUP] Erro ao gerar backup:', error)
        return NextResponse.json(
            { error: 'Erro interno ao gerar backup do banco de dados.' },
            { status: 500 }
        )
    }
}
