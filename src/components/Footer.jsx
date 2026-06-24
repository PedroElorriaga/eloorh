const NAV = [
    { label: 'Serviços', href: '#servicos' },
    { label: 'Equipe', href: '#equipe' },
    { label: 'Currículos', href: '#curriculos' },
    { label: 'Contato', href: '#contato' },
]

const YEAR = new Date().getFullYear()

export default function Footer() {
    const handleClick = (e, href) => {
        e.preventDefault()
        const el = document.querySelector(href)
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 72
            window.scrollTo({ top, behavior: 'smooth' })
        }
    }

    return (
        <footer className="bg-primary-900 text-primary-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-10">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <img
                            src="/assets/eloorh-logo.jpeg"
                            alt="Eloorh RH"
                            className="h-14 w-auto rounded-full mb-4 bg-white p-1"
                        />
                        <p className="text-sm leading-relaxed text-primary-300">
                            Conectando talentos e oportunidades. Soluções em RH para empresas que valorizam pessoas.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">
                            Navegação
                        </h4>
                        <ul className="space-y-2">
                            {NAV.map(({ label, href }) => (
                                <li key={href}>
                                    <a
                                        href={href}
                                        onClick={(e) => handleClick(e, href)}
                                        className="text-sm text-primary-300 hover:text-white transition-colors"
                                    >
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact quick */}
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">
                            Contato
                        </h4>
                        <ul className="space-y-2 text-sm text-primary-300">
                            <li>
                                <a href="mailto:pedrohes2002@outlook.com" className="hover:text-white transition-colors break-all">
                                    pedrohes2002@outlook.com
                                </a>
                            </li>
                            <li>
                                <a href="https://wa.me/5511973352818" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                                    (11) 97335-2818
                                </a>
                            </li>
                            <li>Barueri, SP</li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-primary-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-primary-400">
                    <p>© {YEAR} Eloorh RH. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
