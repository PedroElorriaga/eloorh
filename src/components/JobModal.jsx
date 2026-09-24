import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, MapPin, Clock, Users, Send } from 'lucide-react'
import { formatCompany, formatPositions, formatPublished, formatSalary, splitLines } from '../utils/jobFormat'

export default function JobModal({ job, onClose, onApply }) {
    const closeRef = useRef(null)
    // Kept in a ref so the mount effect below (focus, scroll lock) runs once even
    // if the parent passes a new callback on re-render.
    const onCloseRef = useRef(onClose)
    onCloseRef.current = onClose

    useEffect(() => {
        const previouslyFocused = document.activeElement
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        closeRef.current?.focus()

        const onKeyDown = (e) => { if (e.key === 'Escape') onCloseRef.current() }
        document.addEventListener('keydown', onKeyDown)

        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.body.style.overflow = previousOverflow
            previouslyFocused?.focus?.({ preventScroll: true })
        }
    }, [])

    const benefits = splitLines(job.beneficios)

    return createPortal(
        <div
            className="fixed inset-0 z-[60] bg-slate-900/60 flex items-end sm:items-center justify-center sm:p-6 animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="job-modal-title"
                className="bg-white w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col"
            >
                <div className="flex items-start justify-between gap-4 p-6 sm:p-8 pb-4 border-b border-slate-100">
                    <div>
                        <h2 id="job-modal-title" className="text-2xl font-bold text-primary-800 leading-tight">{job.titulo}</h2>
                        <p className="text-slate-500 mt-1">
                            {formatCompany(job.empresa)}
                            {job.codigo && <span className="text-slate-400"> · Cód. da vaga: {job.codigo}</span>}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-slate-600">
                            <span className="flex items-center gap-1.5"><Clock size={15} className="text-primary-500" /> {formatPublished(job.publicada_em)}</span>
                            <span className="flex items-center gap-1.5"><Users size={15} className="text-primary-500" /> {formatPositions(job.posicoes)}</span>
                            <span className="flex items-center gap-1.5"><MapPin size={15} className="text-primary-500" /> {job.cidade}, {job.uf}</span>
                        </div>
                    </div>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        aria-label="Fechar"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 sm:p-8 space-y-7">
                    <section>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-3">Dados da vaga</h3>
                        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                            <Detail label="Tipo de contratação" value={job.tipo_contratacao} />
                            <Detail label="Área profissional" value={job.area_profissional} />
                            {job.carga_horaria && <Detail label="Carga horária" value={job.carga_horaria} />}
                            <Detail label="Salário" value={formatSalary(job.salario)} />
                        </dl>
                    </section>

                    {benefits.length > 0 && (
                        <section>
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-3">Benefícios</h3>
                            <ul className="list-disc pl-5 space-y-1 text-slate-700 text-sm">
                                {benefits.map((benefit, i) => <li key={i}>{benefit}</li>)}
                            </ul>
                        </section>
                    )}

                    <section>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-3">Responsabilidades e atribuições</h3>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{job.responsabilidades}</p>
                    </section>

                    {job.requisitos && (
                        <section>
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-3">Requisitos e qualificações</h3>
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{job.requisitos}</p>
                        </section>
                    )}
                </div>

                <div className="p-6 sm:px-8 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                    <button type="button" className="btn-outline" onClick={onClose}>Fechar</button>
                    <button type="button" className="btn-primary" onClick={() => onApply(job)}>
                        <Send size={18} /> Candidatar-se
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    )
}

function Detail({ label, value }) {
    return (
        <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">{label}</dt>
            <dd className="text-slate-800">{value}</dd>
        </div>
    )
}
