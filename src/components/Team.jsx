import { Linkedin } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const TEAM = [
    {
        name: 'Fernanda Ramalho',
        role: 'Gestão de RH',
        bio: 'Com 16 anos de experiência em Recursos Humanos e Departamento Pessoal, Fernanda possui trajetória em gestão de pessoas, recrutamento e seleção, administração de pessoal, benefícios, folha de pagamento e processos trabalhistas. Sua atuação é marcada pela organização, comprometimento e busca por soluções eficientes, sempre conectando as necessidades da empresa às pessoas.',
        initials: 'FR',
        color: 'from-primary-700 to-primary-500',
        linkedinUrl: 'https://www.linkedin.com/in/fernandasramalho/',
    },
    {
        name: 'Gersonita Pinheiro',
        role: 'Especialista em Recrutamento & Seleção',
        bio: 'Com mais de 30 anos de experiência em Recursos Humanos, Gersonita construiu uma trajetória sólida em diferentes áreas da gestão de pessoas, com atuação em recrutamento e seleção, administração de pessoal, folha de pagamento, gestão de ponto, clima organizacional, processos e sistemas de RH. Sua experiência combina conhecimento técnico, visão estratégica e um olhar humano, contribuindo para identificar profissionais alinhados às necessidades de cada empresa.',
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
                    {/* <span className="section-badge">Quem somos</span> */}
                    <h2 className="section-title">Quem somos</h2>
                    <p className="section-subtitle mx-auto">
                        Duas profissionais. Uma conexão. Um propósito.<br></br><br></br>
                        A  Eloo RH nasceu de uma história construída dentro do Recursos Humanos.
                        Foi trabalhando juntas e vivenciando de perto os desafios da área. Dessa parceria, da experiência compartilhada e de uma mesma visão sobre a importância das pessoas para o sucesso das empresas, nasceu a Eloo RH.
                        Hoje, unimos nossas trajetórias para conectar talentos e oportunidades, oferecendo soluções em Recrutamento e Seleção e Desenvolvimento de Pessoas.
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
                    <div className="text-center animate-on-scroll">
                        <h2 className="text-center section-title">Nosso Propósito</h2>
                        <p className="text-center section-subtitle mx-auto">
                            Acreditamos que uma contratação vai muito além de preencher uma vaga. É conectar pessoas, competências e oportunidades.
                            <br></br>
                            Eloo RH — Conectando talentos e oportunidades.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

