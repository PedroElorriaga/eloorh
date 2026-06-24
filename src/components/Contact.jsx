import { useState } from 'react'
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const INITIAL = { nome: '', email: '', assunto: '', mensagem: '' }

function validate(f) {
    const e = {}
    if (!f.nome.trim()) e.nome = 'Nome é obrigatório.'
    if (!f.email.trim()) e.email = 'E-mail é obrigatório.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
        e.email = 'Informe um e-mail válido.'
    if (!f.assunto.trim()) e.assunto = 'Assunto é obrigatório.'
    if (!f.mensagem.trim()) e.mensagem = 'Mensagem é obrigatória.'
    return e
}

export default function Contact() {
    const sectionRef = useScrollAnimation()
    const [fields, setFields] = useState(INITIAL)
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(false)

    const set = (key, val) => {
        setFields((f) => ({ ...f, [key]: val }))
        if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const errs = validate(fields)
        if (Object.keys(errs).length) { setErrors(errs); return }
        setSubmitted(true)
    }

    return (
        <section id="contato" ref={sectionRef} className="py-24 bg-primary-800">
            <div className="section-container">
                {/* Heading */}
                <div className="text-center mb-14 animate-on-scroll">
                    <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary-200 mb-3">
                        Fale com a gente
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
                        Entre em Contato
                    </h2>
                    <p className="text-primary-200 text-lg max-w-xl mx-auto">
                        Estamos prontos para ajudar sua empresa a encontrar os melhores talentos.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-12 items-start">
                    {/* Contact info */}
                    <div className="lg:col-span-2 space-y-6 animate-on-scroll">
                        <InfoItem
                            icon={Mail}
                            label="E-mail"
                            value="pedrohes2002@outlook.com"
                            href="mailto:pedrohes2002@outlook.com"
                        />
                        <InfoItem
                            icon={Phone}
                            label="Telefone / WhatsApp"
                            value="(11) 97335-2818"
                            href="https://wa.me/5511973352818"
                        />
                        <InfoItem
                            icon={MapPin}
                            label="Localização"
                            value="Barueri, SP"
                        />

                        <div className="pt-4 border-t border-primary-700">
                            <p className="text-primary-200 text-sm leading-relaxed">
                                Atendemos empresas de todos os portes. Entre em contato e descubra como podemos
                                apoiar a gestão de pessoas na sua organização.
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-3 animate-on-scroll" style={{ transitionDelay: '150ms' }}>
                        <div className="bg-white rounded-2xl p-8">
                            {submitted ? (
                                <div className="flex flex-col items-center text-center py-8 gap-4">
                                    <CheckCircle size={56} className="text-green-500" />
                                    <h3 className="text-xl font-bold text-primary-800">Mensagem enviada!</h3>
                                    <p className="text-slate-500 max-w-sm">
                                        Recebemos sua mensagem e retornaremos em breve. Obrigado pelo contato!
                                    </p>
                                    <button
                                        onClick={() => { setFields(INITIAL); setSubmitted(false) }}
                                        className="btn-outline mt-2"
                                    >
                                        Nova mensagem
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="form-label" htmlFor="c-nome">Nome *</label>
                                            <input
                                                id="c-nome"
                                                type="text"
                                                autoComplete="name"
                                                placeholder="Seu nome"
                                                value={fields.nome}
                                                onChange={(e) => set('nome', e.target.value)}
                                                className={`form-input ${errors.nome ? 'form-input-error' : ''}`}
                                            />
                                            {errors.nome && <p className="error-msg">{errors.nome}</p>}
                                        </div>

                                        <div>
                                            <label className="form-label" htmlFor="c-email">E-mail *</label>
                                            <input
                                                id="c-email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder="seu@email.com"
                                                value={fields.email}
                                                onChange={(e) => set('email', e.target.value)}
                                                className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                                            />
                                            {errors.email && <p className="error-msg">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="form-label" htmlFor="c-assunto">Assunto *</label>
                                        <input
                                            id="c-assunto"
                                            type="text"
                                            placeholder="Ex.: Consultoria de Recrutamento"
                                            value={fields.assunto}
                                            onChange={(e) => set('assunto', e.target.value)}
                                            className={`form-input ${errors.assunto ? 'form-input-error' : ''}`}
                                        />
                                        {errors.assunto && <p className="error-msg">{errors.assunto}</p>}
                                    </div>

                                    <div>
                                        <label className="form-label" htmlFor="c-mensagem">Mensagem *</label>
                                        <textarea
                                            id="c-mensagem"
                                            rows={5}
                                            placeholder="Descreva como podemos ajudar..."
                                            value={fields.mensagem}
                                            onChange={(e) => set('mensagem', e.target.value)}
                                            className={`form-input resize-none ${errors.mensagem ? 'form-input-error' : ''}`}
                                        />
                                        {errors.mensagem && <p className="error-msg">{errors.mensagem}</p>}
                                    </div>

                                    <button type="submit" className="btn-primary w-full justify-center">
                                        Enviar Mensagem
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function InfoItem({ icon: Icon, label, value, href }) {
    const content = (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center">
                <Icon size={18} className="text-primary-200" />
            </div>
            <div>
                <p className="text-xs font-medium text-primary-300 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-white font-medium">{value}</p>
            </div>
        </div>
    )

    return href ? (
        <a href={href} target="_blank" rel="noreferrer" className="block hover:opacity-80 transition-opacity">
            {content}
        </a>
    ) : (
        <div>{content}</div>
    )
}
