import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
    // { label: 'Serviços', href: '#servicos' },
    // { label: 'Equipe', href: '#equipe' },
    // { label: 'Currículos', href: '#curriculos' },
    // { label: 'Contato', href: '#contato' },
]

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const handleNavClick = (e, href) => {
        e.preventDefault()
        setMenuOpen(false)
        const target = document.querySelector(href)
        if (target) {
            const offset = 72 // header height
            const top = target.getBoundingClientRect().top + window.scrollY - offset
            window.scrollTo({ top, behavior: 'smooth' })
        }
    }

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 backdrop-blur py-3'
                }`}
        >
            <div className="section-container flex items-center justify-between">
                {/* Logo */}
                <a href="#" onClick={(e) => handleNavClick(e, 'body')} className="flex items-center">
                    <img
                        src="/assets/eloorh-logo.jpeg"
                        alt="Eloorh"
                        className="h-12 w-auto object-contain rounded-full"
                    />
                </a>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map(({ label, href }) => (
                        <a
                            key={href}
                            href={href}
                            onClick={(e) => handleNavClick(e, href)}
                            className="text-slate-600 font-medium hover:text-primary-700 transition-colors duration-150 relative group"
                        >
                            {label}
                            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-700 group-hover:w-full transition-all duration-200" />
                        </a>
                    ))}
                </nav>

                {/* Desktop CTA */}
                <a
                    href="#contato"
                    onClick={(e) => handleNavClick(e, '#contato')}
                    className="hidden md:inline-flex btn-primary text-sm"
                >
                    Fale Conosco
                </a>

                {/* Mobile hamburger */}
                <button
                    aria-label="Abrir menu"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="md:hidden p-2 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 shadow-lg animate-fade-in">
                    <nav className="section-container py-4 flex flex-col gap-1">
                        {NAV_LINKS.map(({ label, href }) => (
                            <a
                                key={href}
                                href={href}
                                onClick={(e) => handleNavClick(e, href)}
                                className="px-3 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors"
                            >
                                {label}
                            </a>
                        ))}
                        <a
                            href="#contato"
                            onClick={(e) => handleNavClick(e, '#contato')}
                            className="mt-2 btn-primary justify-center text-sm"
                        >
                            Fale Conosco
                        </a>
                    </nav>
                </div>
            )}
        </header>
    )
}
