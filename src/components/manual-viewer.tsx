"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, ChevronRight, ArrowUp, Search } from "lucide-react"

interface TOCItem {
    level: number
    title: string
    id: string
}

interface ManualViewerProps {
    estagiarioMd: string
    orientadorMd: string
    defaultTab?: "estagiario" | "orientador"
}

// Slugify helper for linking headings
function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Substitui espaços por -
        .replace(/[^\w\-]+/g, '')       // Remove caracteres especiais
        .replace(/\-\-+/g, '-');        // Substitui múltiplos - por único
}

// Custom Markdown to HTML parser
function parseMarkdown(md: string) {
    const lines = md.split('\n')
    const html: string[] = []
    const toc: TOCItem[] = []
    
    let inList = false
    let isOrdered = false
    let inBlockquote = false
    let blockquoteType = ""
    let blockquoteLines: string[] = []
    let inCode = false

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i]

        // Handle Code Blocks
        if (line.trim().startsWith('```')) {
            if (inCode) {
                html.push('</code></pre></div>')
                inCode = false
            } else {
                const lang = line.trim().replace('```', '')
                html.push(`<div class="my-4 bg-muted/60 p-4 rounded-md overflow-x-auto border font-mono text-xs text-foreground"><pre><code class="language-${lang}">`)
                inCode = true
            }
            continue
        }

        if (inCode) {
            html.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
            continue
        }

        // Inline replacements (bold, links, code)
        line = line
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
            .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs border">$1</code>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-medium inline-flex items-center gap-1">$1</a>')

        // Handle Blockquotes / Alerts (GitHub style > [!IMPORTANT])
        if (line.startsWith('> ')) {
            const cleanLine = line.substring(2)
            if (cleanLine.startsWith('[!')) {
                inBlockquote = true
                blockquoteType = cleanLine.match(/\[\!(.*?)\]/)?.[1] || "IMPORTANT"
                blockquoteLines = []
            } else {
                blockquoteLines.push(cleanLine)
            }
            continue
        } else if (inBlockquote && !line.startsWith('> ')) {
            // Close blockquote
            let bgColor = "bg-blue-50 border-blue-200 text-blue-800"
            let label = "Nota"
            if (blockquoteType === 'IMPORTANT') {
                bgColor = "bg-indigo-50 border-indigo-200 text-indigo-800"
                label = "Importante"
            } else if (blockquoteType === 'WARNING') {
                bgColor = "bg-amber-50 border-amber-200 text-amber-800"
                label = "Aviso"
            } else if (blockquoteType === 'CAUTION') {
                bgColor = "bg-red-50 border-red-200 text-red-800"
                label = "Cuidado"
            }

            html.push(`
                <div class="my-4 p-4 rounded-md border ${bgColor}">
                    <p class="font-bold flex items-center gap-2 text-xs uppercase tracking-wider mb-1">${label}</p>
                    <div class="text-sm space-y-1">${blockquoteLines.join('<br />')}</div>
                </div>
            `)
            inBlockquote = false
        }

        // Handle Lists (Unordered "*")
        if (line.trim().startsWith('* ')) {
            if (!inList) {
                html.push('<ul class="list-disc pl-6 my-3 space-y-1 text-muted-foreground text-sm">')
                inList = true
                isOrdered = false
            }
            html.push(`<li>${line.trim().substring(2)}</li>`)
            continue
        }

        // Handle Lists (Ordered "1.")
        const orderedMatch = line.trim().match(/^(\d+)\.\s(.*)/)
        if (orderedMatch) {
            if (!inList) {
                html.push('<ol class="list-decimal pl-6 my-3 space-y-1.5 text-muted-foreground text-sm">')
                inList = true
                isOrdered = true
            }
            html.push(`<li>${orderedMatch[2]}</li>`)
            continue
        }

        // Close list if line is not a list item
        if (inList && !line.trim().startsWith('* ') && !line.trim().match(/^(\d+)\.\s/)) {
            html.push(isOrdered ? '</ol>' : '</ul>')
            inList = false
        }

        // Handle Headers
        if (line.startsWith('# ')) {
            const title = line.substring(2).replace(/<[^>]*>/g, '')
            const id = slugify(title)
            toc.push({ level: 1, title, id })
            html.push(`<h1 id="${id}" class="text-3xl font-black mt-8 mb-4 text-primary border-b pb-2 scroll-mt-20">${line.substring(2)}</h1>`)
        } else if (line.startsWith('## ')) {
            const title = line.substring(3).replace(/<[^>]*>/g, '')
            const id = slugify(title)
            toc.push({ level: 2, title, id })
            html.push(`<h2 id="${id}" class="text-2xl font-bold mt-8 mb-4 text-foreground border-b pb-1 scroll-mt-20">${line.substring(3)}</h2>`)
        } else if (line.startsWith('### ')) {
            const title = line.substring(4).replace(/<[^>]*>/g, '')
            const id = slugify(title)
            toc.push({ level: 3, title, id })
            html.push(`<h3 id="${id}" class="text-xl font-semibold mt-6 mb-2 text-foreground scroll-mt-20">${line.substring(4)}</h3>`)
        } else if (line.startsWith('#### ')) {
            const title = line.substring(5).replace(/<[^>]*>/g, '')
            const id = slugify(title)
            html.push(`<h4 id="${id}" class="text-lg font-medium mt-4 mb-1 text-foreground scroll-mt-20">${line.substring(5)}</h4>`)
        } else if (line.trim() === '---') {
            html.push('<hr class="my-6 border-muted" />')
        } else if (line.trim() !== '') {
            html.push(`<p class="my-3 leading-relaxed text-muted-foreground text-sm">${line}</p>`)
        }
    }

    // Clean up open lists
    if (inList) {
        html.push(isOrdered ? '</ol>' : '</ul>')
    }
    if (inBlockquote) {
        let bgColor = "bg-blue-50 border-blue-200 text-blue-800"
        html.push(`<div class="my-4 p-4 rounded-md border ${bgColor}"><div class="text-sm">${blockquoteLines.join('<br />')}</div></div>`)
    }

    return { html: html.join('\n'), toc }
}

export function ManualViewer({ estagiarioMd, orientadorMd, defaultTab = "estagiario" }: ManualViewerProps) {
    const [activeTab, setActiveTab] = useState<"estagiario" | "orientador">(defaultTab)
    const [showBackToTop, setShowBackToTop] = useState(false)
    const [search, setSearch] = useState("")

    const estagiario = parseMarkdown(estagiarioMd)
    const orientador = parseMarkdown(orientadorMd)

    // Current parsed manual data
    const currentManual = activeTab === "estagiario" ? estagiario : orientador

    // Filtered TOC based on search
    const filteredTOC = currentManual.toc.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase())
    )

    // Monitor scroll for back-to-top button
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowBackToTop(true)
            } else {
                setShowBackToTop(false)
            }
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto relative">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manuais do Sistema</h1>
                <p className="text-muted-foreground">Documentação completa para auxiliar estagiários e professores no uso do SGE.</p>
            </div>

            {/* Tab Controller */}
            <Tabs value={activeTab} onValueChange={(val) => {
                setActiveTab(val as "estagiario" | "orientador")
                setSearch("")
            }} className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="estagiario" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        Estagiário
                    </TabsTrigger>
                    <TabsTrigger value="orientador" className="gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Orientador
                    </TabsTrigger>
                </TabsList>

                <div className="grid gap-6 md:grid-cols-12 mt-6">
                    {/* Index / Sidebar (Left column on large screens) */}
                    <div className="hidden lg:block lg:col-span-3 space-y-4">
                        <Card className="sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                                    <span>Navegação</span>
                                    <BadgeIcon count={filteredTOC.length} />
                                </CardTitle>
                                <CardDescription className="text-xs">Clique para rolar até a seção</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Buscar no sumário..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                </div>

                                <div className="space-y-1.5 pt-2 text-xs">
                                    {filteredTOC.map((item, idx) => (
                                        <a
                                            key={idx}
                                            href={`#${item.id}`}
                                            className={`block text-muted-foreground hover:text-primary transition-colors flex items-start gap-1 py-0.5 ${
                                                item.level === 1 ? "font-bold text-foreground pl-0" :
                                                item.level === 2 ? "font-medium pl-3 border-l" : "pl-6 text-[11px]"
                                            }`}
                                        >
                                            {item.level > 1 && <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/50" />}
                                            <span className="truncate">{item.title}</span>
                                        </a>
                                    ))}
                                    {filteredTOC.length === 0 && (
                                        <p className="text-muted-foreground italic text-center py-2">Nenhum resultado</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Manual Content (Right/Main column) */}
                    <div className="col-span-12 lg:col-span-9">
                        <Card className="shadow-sm border">
                            <CardContent className="p-6 md:p-10 prose max-w-none">
                                <TabsContent value="estagiario" className="mt-0">
                                    <div 
                                        className="manual-markdown-body space-y-2"
                                        dangerouslySetInnerHTML={{ __html: estagiario.html }} 
                                    />
                                </TabsContent>
                                <TabsContent value="orientador" className="mt-0">
                                    <div 
                                        className="manual-markdown-body space-y-2"
                                        dangerouslySetInnerHTML={{ __html: orientador.html }} 
                                    />
                                </TabsContent>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Tabs>

            {/* Back to top button */}
            {showBackToTop && (
                <Button
                    onClick={scrollToTop}
                    size="icon"
                    className="fixed bottom-6 right-6 rounded-full shadow-lg z-50 transition-all duration-300 animate-in fade-in"
                    aria-label="Voltar ao topo"
                >
                    <ArrowUp className="h-5 w-5" />
                </Button>
            )}
        </div>
    )
}

function BadgeIcon({ count }: { count: number }) {
    if (count === 0) return null
    return (
        <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground border">
            {count}
        </span>
    )
}
