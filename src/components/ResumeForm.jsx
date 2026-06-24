import { useState } from 'react'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const AREAS = [
    'Recrutamento & Seleção',
    'Consultoria de RH',
    'Treinamento & Desenvolvimento',
    'Administração de Pessoal',
    'Outro',
]

const INITIAL = {
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    area: '',
    sobre: '',
    arquivo: null,
}

function validate(fields) {
    const errs = {}
    if (!fields.nome.trim()) errs.nome = 'Nome é obrigatório.'
    if (!fields.email.trim()) errs.email = 'E-mail é obrigatório.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
        errs.email = 'Informe um e-mail válido.'
    if (!fields.telefone.trim()) errs.telefone = 'Telefone é obrigatório.'
    if (!fields.cargo.trim()) errs.cargo = 'Cargo desejado é obrigatório.'
    if (!fields.area) errs.area = 'Selecione uma área de interesse.'
    return errs
}

function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    return value
}

export default function ResumeForm() {
    const sectionRef = useScrollAnimation()
    const [fields, setFields] = useState(INITIAL)
    const [errors, setErrors] = useState({})
    const [fileName, setFileName] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const set = (key, val) => {
        setFields((f) => ({ ...f, [key]: val }))
        if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n })
    }

    const handleFile = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setFields((f) => ({ ...f, arquivo: file }))
            setFileName(file.name)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const errs = validate(fields)
        if (Object.keys(errs).length) { setErrors(errs); return }
        setSubmitted(true)
    }

    const handleReset = () => {
        setFields(INITIAL)
        setErrors({})
        setFileName('')
        setSubmitted(false)
    }

    return (
        <section id="curriculos" ref={sectionRef} className="py-24 bg-white">
            <div className="section-container max-w-3xl">
                {/* Heading */}
                <div className="text-center mb-12 animate-on-scroll">
                    <span className="section-badge">Trabalhe conosco</span>
                    <h2 className="section-title">Envie seu Currículo</h2>
                    <p className="section-subtitle mx-auto">
                        Faça parte do nosso banco de talentos. Analisamos cada candidatura com atenção.
                    </p>
                </div>

                <div className="animate-on-scroll bg-slate-50 rounded-2xl p-8 sm:p-10 shadow-sm">
                    {submitted ? (
                        <div className="flex flex-col items-center text-center py-8 gap-4">
                            <CheckCircle size={56} className="text-green-500" />
                            <h3 className="text-2xl font-bold text-primary-800">Currículo recebido!</h3>
                            <p className="text-slate-500 max-w-sm">
                                Obrigado pelo seu interesse! Nossa equipe irá analisar seu perfil e entrar em contato em breve.
                            </p>
                            <button onClick={handleReset} className="btn-outline mt-2">
                                Enviar outro currículo
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate className="space-y-6">
                            {/* Row 1 */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label" htmlFor="r-nome">Nome completo *</label>
                                    <input
                                        id="r-nome"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Seu nome completo"
                                        value={fields.nome}
                                        onChange={(e) => set('nome', e.target.value)}
                                        className={`form-input ${errors.nome ? 'form-input-error' : ''}`}
                                    />
                                    {errors.nome && <p className="error-msg">{errors.nome}</p>}
                                </div>

                                <div>
                                    <label className="form-label" htmlFor="r-email">E-mail *</label>
                                    <input
                                        id="r-email"
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

                            {/* Row 2 */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label" htmlFor="r-tel">Telefone *</label>
                                    <input
                                        id="r-tel"
                                        type="tel"
                                        autoComplete="tel"
                                        placeholder="(11) 99999-9999"
                                        value={fields.telefone}
                                        onChange={(e) => set('telefone', formatPhone(e.target.value))}
                                        className={`form-input ${errors.telefone ? 'form-input-error' : ''}`}
                                    />
                                    {errors.telefone && <p className="error-msg">{errors.telefone}</p>}
                                </div>

                                <div>
                                    <label className="form-label" htmlFor="r-cargo">Cargo desejado *</label>
                                    <input
                                        id="r-cargo"
                                        type="text"
                                        placeholder="Ex.: Analista de RH"
                                        value={fields.cargo}
                                        onChange={(e) => set('cargo', e.target.value)}
                                        className={`form-input ${errors.cargo ? 'form-input-error' : ''}`}
                                    />
                                    {errors.cargo && <p className="error-msg">{errors.cargo}</p>}
                                </div>
                            </div>

                            {/* Area */}
                            <div>
                                <label className="form-label" htmlFor="r-area">Área de interesse *</label>
                                <select
                                    id="r-area"
                                    value={fields.area}
                                    onChange={(e) => set('area', e.target.value)}
                                    className={`form-input ${errors.area ? 'form-input-error' : ''}`}
                                >
                                    <option value="">Selecione uma área</option>
                                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                                </select>
                                {errors.area && <p className="error-msg">{errors.area}</p>}
                            </div>

                            {/* Sobre */}
                            <div>
                                <label className="form-label" htmlFor="r-sobre">Sobre você / Principais habilidades</label>
                                <textarea
                                    id="r-sobre"
                                    rows={4}
                                    placeholder="Descreva brevemente sua experiência e habilidades..."
                                    value={fields.sobre}
                                    onChange={(e) => set('sobre', e.target.value)}
                                    className="form-input resize-none"
                                />
                            </div>

                            {/* File upload */}
                            <div>
                                <label className="form-label">Currículo (PDF, DOC ou DOCX)</label>
                                <label
                                    htmlFor="r-arquivo"
                                    className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors group"
                                >
                                    <Upload size={20} className="text-slate-400 group-hover:text-primary-600 flex-shrink-0" />
                                    <span className="text-sm text-slate-500 group-hover:text-primary-700 truncate">
                                        {fileName || 'Clique para selecionar o arquivo'}
                                    </span>
                                    <input
                                        id="r-arquivo"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFile}
                                        className="sr-only"
                                    />
                                </label>
                                <p className="text-xs text-slate-400 mt-1">Formatos aceitos: PDF, DOC, DOCX. Tamanho máximo: 5 MB.</p>
                            </div>

                            {/* Submit */}
                            <button type="submit" className="btn-primary w-full justify-center">
                                Enviar Candidatura
                            </button>

                            <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                                <AlertCircle size={12} />
                                Seus dados são tratados com total confidencialidade.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </section>
    )
}
