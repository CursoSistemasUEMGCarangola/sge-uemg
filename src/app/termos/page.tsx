import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermosPage() {
    return (
        <div className="min-h-screen bg-background p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para a página inicial
                </Link>

                <h1 className="text-3xl font-bold mb-6 text-foreground">Termos de Uso</h1>
                
                <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
                    <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Aceitação dos Termos</h2>
                    <p>Ao acessar e utilizar o Sistema de Gestão de Estágios (SGE) da UEMG Carangola, você concorda em cumprir os presentes Termos de Uso. O uso é restrito a alunos, professores e administradores devidamente vinculados ao curso de Sistemas de Informação.</p>

                    <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Finalidade do Sistema</h2>
                    <p>O SGE é uma plataforma de cunho estritamente acadêmico e administrativo, desenvolvida como Projeto de Extensão. Seu objetivo é organizar as etapas documentais do estágio curricular, prover um fluxo de auditoria e facilitar a geração de documentos (PDFs) exigidos na disciplina de estágio.</p>

                    <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Responsabilidades do Usuário</h2>
                    <p>O aluno é responsável por garantir a veracidade dos dados inseridos, incluindo CNPJ de empresas, dados de supervisores e informações de carga horária. O SGE apenas armazena os metadados necessários para gerar o documento. O protocolo oficial de qualquer documento físico, com suas devidas assinaturas, continua seguindo as diretrizes oficiais do curso e da coordenação de estágio.</p>

                    <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Limitação de Responsabilidade</h2>
                    <p>Este sistema opera em uma infraestrutura "Zero Cost". Embora tenhamos estabelecido estratégias rigorosas de segurança, backup administrativo e resiliência a falhas, a UEMG e a equipe do projeto não se responsabilizam por eventuais indisponibilidades de plataforma.</p>

                    <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Geração de Documentos</h2>
                    <p>A geração de PDFs (Termos de Compromisso, Relatórios) é realizada diretamente no navegador do usuário (Client-Side). Os documentos gerados no sistema não possuem validade legal até que sejam impressos e assinados fisicamente (ou com assinatura digital reconhecida) pelas partes envolvidas.</p>

                    <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Comunicação e Notificações</h2>
                    <p>O SGE utiliza o e-mail institucional para autenticação primária e o e-mail alternativo cadastrado para o envio de notificações sobre pendências e atividades. O usuário concorda em receber mensagens transacionais essenciais ao ciclo do seu estágio.</p>

                    <p className="mt-8 text-sm italic">Última atualização: 2026</p>
                </div>
            </div>
        </div>
    )
}
