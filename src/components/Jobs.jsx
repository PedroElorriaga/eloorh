import { useEffect, useState } from 'react'
import { MapPin, Briefcase, Wallet, Users, ArrowRight, SearchX } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { scrollToSection } from '../utils/scrollToSection'
import { formatCompany, formatPositions, formatPublished, formatSalary } from '../utils/jobFormat'
import JobModal from './JobModal'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function Jobs({ onApply }) {
    const sectionRef = useScrollAnimation()
    const [jobs, setJobs] = useState([])
    const [state, setState] = useState('loading') // loading | ready | error
    const [openJob, setOpenJob] = useState(null)

    useEffect(() => {
        let active = true

        fetch(`${apiUrl}/api/jobs`)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                return response.json()
            })
            .then((data) => {
                if (!active) return
                setJobs(data.items || [])
                setState('ready')
            })
            .catch(() => { if (active) setState('error') })

        return () => { active = false }
    }, [])

    const handleApply = (job) => {
        setOpenJob(null)
        onApply(job)
    }

    return (
        <section id="vagas" ref={sectionRef} className="py-24 bg-white">
            <div className="section-container">
                <div className="text-center mb-12 animate-on-scroll">
                    <span className="section-badge">Oportunidades</span>
                    <h2 className="section-title">Vagas Abertas</h2>
                    <p className="section-subtitle mx-auto">
                        Confira as posições em que estamos recrutando agora e candidate-se.
                    </p>
                </div>

                {/* Cards load after mount, so the scroll animation is applied to this wrapper only. */}
                <div className="animate-on-scroll">
                    {state === 'loading' && (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Carregando vagas">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="rounded-2xl border border-slate-100 p-6 space-y-3 animate-pulse">
                                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                                </div>
                            ))}
                        </div>
                    )}

                    {state === 'ready' && jobs.length > 0 && (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <JobCard key={job.id} job={job} onOpen={() => setOpenJob(job)} />
                            ))}
                        </div>
                    )}

                    {(state === 'error' || (state === 'ready' && !jobs.length)) && (
                        <div className="bg-slate-50 rounded-2xl p-10 flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
                            <SearchX size={44} className="text-slate-300" />
                            <h3 className="text-lg font-bold text-primary-800">
                                {state === 'error'
                                    ? 'Não foi possível carregar as vagas agora.'
                                    : 'No momento não temos vagas abertas.'}
                            </h3>
                            <p className="text-slate-500 text-sm max-w-md">
                                Cadastre seu currículo no nosso banco de talentos — avisaremos você quando surgir uma oportunidade com o seu perfil.
                            </p>
                            <a
                                href="#curriculos"
                                onClick={(e) => { e.preventDefault(); scrollToSection('#curriculos') }}
                                className="btn-outline mt-2"
                            >
                                Cadastrar currículo
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {openJob && <JobModal job={openJob} onClose={() => setOpenJob(null)} onApply={handleApply} />}
        </section>
    )
}

function JobCard({ job, onOpen }) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className="group text-left bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary-200 transition-all duration-300 flex flex-col"
        >
            <h3 className="text-lg font-bold text-primary-800 leading-snug">{job.titulo}</h3>
            <p className="text-sm text-slate-500 mt-1">{formatCompany(job.empresa)}</p>

            <ul className="mt-4 space-y-2 text-sm text-slate-600 flex-1">
                <li className="flex items-center gap-2"><MapPin size={16} className="text-primary-500 shrink-0" /> {job.cidade}, {job.uf}</li>
                <li className="flex items-center gap-2"><Briefcase size={16} className="text-primary-500 shrink-0" /> {job.tipo_contratacao}</li>
                <li className="flex items-center gap-2"><Wallet size={16} className="text-primary-500 shrink-0" /> {formatSalary(job.salario)}</li>
                <li className="flex items-center gap-2"><Users size={16} className="text-primary-500 shrink-0" /> {formatPositions(job.posicoes)}</li>
            </ul>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">{formatPublished(job.publicada_em)}</span>
                <span className="flex items-center gap-1 font-semibold text-primary-700 group-hover:gap-2 transition-all">
                    Ver detalhes <ArrowRight size={14} />
                </span>
            </div>
        </button>
    )
}
