import { Users, Briefcase, BookOpen, ArrowRight } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const SERVICES = [
    {
        icon: Users,
        title: 'Recrutamento & Seleção',
        description:
            'Identificamos e atraímos os melhores talentos do mercado, garantindo o match ideal entre candidatos e a cultura da sua empresa. Processo ágil, assertivo e humanizado.',
        highlights: ['Triagem de currículos', 'Entrevistas técnicas', 'Assessment comportamental'],
        color: 'bg-blue-50 text-primary-700',
    },
    {
        icon: Briefcase,
        title: 'Consultoria de RH',
        description:
            'Oferecemos diagnóstico e soluções estratégicas para sua área de Recursos Humanos, otimizando processos, clima organizacional e políticas de gestão de pessoas.',
        highlights: ['Diagnóstico organizacional', 'Políticas de RH', 'Gestão de desempenho'],
        color: 'bg-slate-50 text-slate-700',
    },
    {
        icon: BookOpen,
        title: 'Treinamentos',
        description:
            'Desenvolvemos programas de capacitação personalizados para equipes e líderes, fortalecendo competências técnicas e comportamentais alinhadas aos objetivos da empresa.',
        highlights: ['Liderança & Gestão', 'Soft skills', 'Programas sob medida'],
        color: 'bg-indigo-50 text-indigo-700',
    },
]

export default function Services() {
    const sectionRef = useScrollAnimation()

    return (
        <section id="servicos" ref={sectionRef} className="py-24 bg-white">
            <div className="section-container">
                {/* Heading */}
                <div className="text-center mb-16 animate-on-scroll">
                    <span className="section-badge">O que fazemos</span>
                    <h2 className="section-title">Nossos Serviços</h2>
                    <p className="section-subtitle mx-auto">
                        Soluções completas em RH para impulsionar o crescimento da sua empresa.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {SERVICES.map(({ icon: Icon, title, description, highlights, color }, i) => (
                        <div
                            key={title}
                            className="animate-on-scroll group bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            {/* Icon */}
                            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6 ${color}`}>
                                <Icon size={28} />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-primary-800 mb-3">{title}</h3>

                            {/* Description */}
                            <p className="text-slate-500 leading-relaxed mb-6 flex-1">{description}</p>

                            {/* Highlights */}
                            <ul className="space-y-2 mb-6">
                                {highlights.map((h) => (
                                    <li key={h} className="flex items-center gap-2 text-sm text-slate-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary-600 flex-shrink-0" />
                                        {h}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <a
                                href="#contato"
                                onClick={(e) => {
                                    e.preventDefault()
                                    const el = document.querySelector('#contato')
                                    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' })
                                }}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-900 transition-colors group/link"
                            >
                                Saiba mais
                                <ArrowRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
