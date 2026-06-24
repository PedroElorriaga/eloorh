import { Linkedin } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const TEAM = [
    {
        name: 'Ana Carolina Silva',
        role: 'Gerente de Recursos Humanos',
        bio: 'Mais de 10 anos de experiência em gestão de pessoas, clima organizacional e desenvolvimento de liderança em empresas de médio e grande porte.',
        initials: 'AC',
        color: 'from-primary-700 to-primary-500',
    },
    {
        name: 'Carlos Eduardo Oliveira',
        role: 'Especialista em Recrutamento & Seleção',
        bio: 'Especialista em atração de talentos com ampla expertise em metodologias ágeis de seleção, entrevistas comportamentais e mapeamento de perfis.',
        initials: 'CE',
        color: 'from-slate-700 to-slate-500',
    },
    {
        name: 'Mariana Santos Ferreira',
        role: 'Consultora de Treinamento & Desenvolvimento',
        bio: 'Facilitadora certificada com foco em desenvolvimento de competências, programas de liderança e construção de trilhas de aprendizagem corporativas.',
        initials: 'MS',
        color: 'from-indigo-700 to-indigo-500',
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
                <div className="grid md:grid-cols-3 gap-8">
                    {TEAM.map(({ name, role, bio, initials, color }, i) => (
                        <div
                            key={name}
                            className="animate-on-scroll bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center flex flex-col items-center"
                            style={{ transitionDelay: `${i * 120}ms` }}
                        >
                            {/* Avatar */}
                            <Avatar initials={initials} color={color} />

                            {/* Info */}
                            <h3 className="text-lg font-bold text-primary-800 mt-5 mb-1">{name}</h3>
                            <p className="text-sm font-medium text-primary-600 mb-4">{role}</p>
                            <p className="text-slate-500 text-sm leading-relaxed flex-1">{bio}</p>

                            {/* LinkedIn placeholder */}
                            <button
                                aria-label={`LinkedIn de ${name}`}
                                className="mt-6 p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-primary-100 hover:text-primary-700 transition-colors cursor-default"
                                title="LinkedIn"
                            >
                                <Linkedin size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
