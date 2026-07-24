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
                        O projeto de extensão "Calendário de Provas Digital: Integração e Acessibilidade Acadêmica", registrado no sistema SIGA sob o número 26408 e proposto pelo professor Nilton Freitas Junior, consiste no desenvolvimento e implementação de uma aplicação móvel voltada para os discentes do curso de Sistemas de Informação da UEMG Unidade Carangola. O objetivo central é facilitar o acesso ao cronograma de avaliações, centralizando informações que, embora definidas institucionalmente, muitas vezes carecem de um canal de consulta ágil e portátil.
                    </p>
                    <p className="text-lg leading-relaxed text-muted-foreground mt-4">
                        Desenvolvido sob o paradigma No-Code através da plataforma Glide, o aplicativo prioriza a usabilidade e a eficiência, permitindo que os estudantes consultem datas e horários de provas de forma instantânea. Além do calendário, a ferramenta atua como um repositório de informações essenciais, disponibilizando os regulamentos que regem as avaliações da UEMG e a relação dos docentes que atuam em cada período letivo.
                    </p>
                    <p className="text-lg leading-relaxed text-muted-foreground mt-4">
                        A iniciativa busca promover a organização acadêmica e a democratização da informação no ambiente universitário. Ao utilizar uma tecnologia de rápido desenvolvimento e baixo custo de manutenção, o projeto demonstra como soluções tecnológicas simplificadas podem resolver problemas logísticos cotidianos, melhorando a comunicação interna e o planejamento dos estudantes ao longo do semestre.
                    </p>
                </div>
            </div>
        </div>
    )
}
