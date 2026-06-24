import { ArrowRight } from 'lucide-react'

export default function Hero() {
    const handleScroll = (href) => {
        const target = document.querySelector(href)
        if (target) {
            const top = target.getBoundingClientRect().top + window.scrollY - 72
            window.scrollTo({ top, behavior: 'smooth' })
        }
    }

    return (
        <section
            className="relative min-h-screen flex items-center justify-start overflow-hidden pt-[72px]"
            style={{
                backgroundImage: "url('/assets/eloorh-banner.jpeg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
            }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-primary-900/60" />

            {/* Content */}
            <div className="section-container relative z-10 py-24">
                <div className="max-w-2xl animate-fade-in-up">
                    <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary-200 mb-4">
                        Eloorh RH
                    </span>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                        Conectando{' '}
                        <span className="text-primary-200">Talentos</span>{' '}
                        e Oportunidades
                    </h1>

                    <p className="text-lg sm:text-xl text-slate-200 mb-10 leading-relaxed">
                        Soluções completas em Recursos Humanos para empresas que valorizam
                        pessoas. Da atração de talentos ao desenvolvimento organizacional.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => handleScroll('#curriculos')}
                            className="btn-primary"
                        >
                            Enviar Currículo
                            <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={() => handleScroll('#servicos')}
                            className="btn-outline border-white text-white hover:bg-white hover:text-primary-700"
                        >
                            Nossos Serviços
                        </button>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/60 text-xs animate-bounce">
                <span>Role para baixo</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
            </div>
        </section>
    )
}
