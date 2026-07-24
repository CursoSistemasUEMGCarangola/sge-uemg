import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SobrePage() {
    return (
        <div className="min-h-screen bg-background p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para a página inicial
                </Link>

                <h1 className="text-3xl font-bold mb-6 text-foreground">Sobre o Projeto</h1>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-muted-foreground">
                        O Sistema de Gestão de Estágios é fruto de um Projeto de Extensão proposto pelo professor Nilton Freitas Junior e registrado no sistema SIGA sob o número 26407. Tem como objetivo o desenvolvimento e a implantação de uma plataforma web dedicada exclusivamente à gestão do fluxo de estágios dos discentes da UEMG Unidade Carangola. 
                    </p>
                    <p className="text-lg leading-relaxed text-muted-foreground mt-4">
                        Atualmente, o controle das etapas do estágio — que compreende desde a submissão de Termos de Compromisso até a validação de Relatórios Finais — é realizado de maneira fragmentada, com o suporte de planilhas Excel, repositórios no Microsoft Teams e formulários no Microsoft Forms.
                    </p>
                    <p className="text-lg leading-relaxed text-muted-foreground mt-4">
                        A proposta central é a migração deste modelo híbrido para um sistema online unificado, projetado para oferecer alta eficiência operacional e nenhum custo de manutenção. O diferencial do projeto reside na centralização absoluta dos processos, eliminando a dispersão de dados e proporcionando maior praticidade e rastreabilidade para alunos e coordenação.
                    </p>
                    <p className="text-lg leading-relaxed text-muted-foreground mt-4">
                        Através de uma arquitetura simplificada e voltada para a automação de rotinas administrativas, o portal busca substituir ferramentas genéricas por uma solução estruturada que garanta agilidade na validação documental e segurança na organização das informações, consolidando a maturidade tecnológica do curso de Sistemas de Informação em seus processos internos de gestão.
                    </p>
                </div>
            </div>
        </div>
    )
}
