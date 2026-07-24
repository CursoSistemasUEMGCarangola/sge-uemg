import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacidadePage() {
    return (
        <div className="min-h-screen bg-background p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para a página inicial
                </Link>

                <h1 className="text-3xl font-bold mb-6 text-foreground">Política de Privacidade</h1>
                
                <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
                    <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Coleta de Dados Pessoais</h2>
                    <p>O Sistema de Gestão de Estágios (SGE) coleta dados pessoais estritamente necessários para o cadastro acadêmico e a formalização do vínculo de estágio. Estes incluem: Nome completo, E-mail Institucional, E-mail Alternativo, Matrícula, CPF, Endereço e Telefones de contato.</p>

                    <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Dados Sensíveis e Armazenamento</h2>
                    <p>Como medida de proteção à privacidade "By Design" descrita no DNA do Projeto, <strong>o SGE não armazena arquivos ou documentos físicos (uploads de imagens, PDFs assinados ou fotos)</strong> no banco de dados ou em serviços de armazenamento em nuvem (Blob Storage). Todo o sistema é focado em <em>metadados</em>: apenas as informações textuais que compõem o registro do estágio são gravadas de forma segura.</p>

                    <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Proteção e Segurança</h2>
                    <p>Utilizamos a funcionalidade Row Level Security (RLS) do banco de dados, configurada de maneira "Zero-Trust", o que garante que: </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Um aluno possui permissão sistêmica apenas para visualizar e editar os dados da sua própria conta e estágios.</li>
                        <li>Nenhum aluno consegue acessar informações de empresas, documentos ou notas de outro discente.</li>
                        <li>Professores e administradores têm acesso restrito e protegido ao panorama geral de alunos que orientam ou gerenciam.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Compartilhamento de Dados</h2>
                    <p>Os dados informados não são vendidos ou repassados a terceiros. Eles circulam exclusivamente entre a aplicação frontend, nossos serviços de banco de dados (Supabase) sob infraestrutura criptografada e o sistema de envios de e-mails transacionais. Partes da informação podem ser processadas pontualmente pela IA (Inteligência Artificial) de melhoria de texto do projeto, mas sem atrelamento a identificadores pessoais.</p>

                    <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Cookies e Tecnologias de Sessão</h2>
                    <p>Utilizamos cookies estritamente necessários para gerenciar a sua sessão ativa (Autenticação) e garantir o isolamento da sua navegação nas áreas logadas do painel de alunos ou professores.</p>

                    <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Direito de Exclusão</h2>
                    <p>Administradores do sistema (Coordenação) mantêm o acesso administrativo que permite o backup bem como a exclusão pontual de dados do aluno no caso de desistência de curso ou conclusão irreversível, conforme as regras estabelecidas pelo sistema acadêmico SIGA da UEMG.</p>

                    <p className="mt-8 text-sm italic">Última atualização: 2026</p>
                </div>
            </div>
        </div>
    )
}
