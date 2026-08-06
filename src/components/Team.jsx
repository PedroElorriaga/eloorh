import { Linkedin } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const TEAM = [
    {
        name: 'Fernanda Ramalho',
        role: 'Gestão de RH',
        bio: 'Profissional com 16 anos de experiência em Recursos Humanos e Departamento Pessoal, com ampla atuação em gestão de pessoas, recrutamento e seleção, legislação trabalhista e processos organizacionais. Utiliza sua experiência para desenvolver soluções estratégicas na atração e seleção de talentos, conectando empresas aos profissionais mais alinhados às suas necessidades e contribuindo para a formação de equipes de alta performance.',
        initials: 'FR',
        color: 'from-primary-700 to-primary-500',
        linkedinUrl: 'https://www.linkedin.com/in/fernandasramalho/',
    },
    {
        name: 'Gersonita Pinheiro',
        role: 'Especialista em Recrutamento & Seleção',
        bio: 'Com mais de 30 anos de experiência em Recursos Humanos, construí minha carreira acreditando que pessoas são o principal diferencial de qualquer organização. Minha atuação une visão estratégica, experiência prática e um olhar humano para apoiar empresas na atração, seleção e desenvolvimento de talentos. Na Eloo RH, meu compromisso é criar conexões que gerem valor tanto para as empresas quanto para os profissionais, contribuindo para relações de trabalho mais sólidas e resultados sustentáveis.',
        initials: 'GP',
        color: 'from-slate-700 to-slate-500',
        linkedinUrl: 'https://www.linkedin.com/in/gersonita-pinheiro-12576429/',
    },
]

function Avatar({ initials, color }) {
    return (
        <div
            className={`w-24 h-24 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-2xl font-bold shadow-md select-none`}
        >
            {initials}
        </div>
    )
}

export default function Team() {
    const sectionRef = useScrollAnimation()

    return (
        <section id="equipe" ref={sectionRef} className="py-24 bg-slate-50">
            <div className="section-container">
                {/* Heading */}
                <div className="text-center mb-16 animate-on-scroll">
                    <span className="section-badge">Quem somos</span>
                    <h2 className="section-title">Nossa Equipe</h2>
                    <p className="section-subtitle mx-auto">
                        Profissionais experientes e comprometidos com resultados que fazem a diferença.
                    </p>
                </div>

                {/* Cards */}
                <div className="flex flex-wrap justify-center gap-8">
                    {TEAM.map(({ name, role, bio, initials, color, linkedinUrl }, i) => (
                        <div
                            key={name}
                            className="w-full max-w-sm animate-on-scroll bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center flex flex-col items-center"
                            style={{ transitionDelay: `${i * 120}ms` }}
                        >
                            {/* Avatar */}
                            <Avatar initials={initials} color={color} />

                            {/* Info */}
                            <h3 className="text-lg font-bold text-primary-800 mt-5 mb-1">{name}</h3>
                            <p className="text-sm font-medium text-primary-600 mb-4">{role}</p>
                            <p className="text-slate-500 text-sm leading-relaxed flex-1">{bio}</p>

                            {/* LinkedIn placeholder */}
                            <a
                                href={linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`LinkedIn de ${name}`}
                                className="mt-6 p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-primary-100 hover:text-primary-700 transition-colors"
                                title="LinkedIn"
                            >
                                <Linkedin size={18} />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
