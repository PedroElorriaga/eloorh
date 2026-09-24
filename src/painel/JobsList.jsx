import { useCallback, useEffect, useState } from 'react'
import { Briefcase, Plus, AlertCircle, Pencil } from 'lucide-react'
import { listJobs, setJobStatus } from './api'
import { STATUS_LABELS } from './jobOptions'

const STATUS_STYLES = {
    rascunho: 'bg-slate-100 text-slate-600',
    publicada: 'bg-green-100 text-green-700',
    encerrada: 'bg-red-50 text-red-600',
}

export default function JobsList({ token, onCreate, onEdit, onShowApplications, onAuthError }) {
    const [jobs, setJobs] = useState([])
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [busyId, setBusyId] = useState(null)

    const load = useCallback(() => {
        setError('')

        return listJobs(token)
            .then((data) => setJobs(data.items))
            .catch((err) => {
                if (err.status === 401) { onAuthError(); return }
                setError(err.message)
            })
            .finally(() => setIsLoading(false))
    }, [token, onAuthError])

    useEffect(() => { load() }, [load])

    const changeStatus = async (job, status) => {
        if (status === 'encerrada' && !window.confirm(`Encerrar a vaga "${job.titulo}"? Ela sai do site e deixa de receber candidaturas.`)) {
            return
        }

        setBusyId(job.id)
        setError('')

        try {
            await setJobStatus(token, job.id, status)
            await load()
        } catch (err) {
            if (err.status === 401) { onAuthError(); return }
            setError(err.message)
        } finally {
            setBusyId(null)
        }
    }

    if (isLoading) return <p className="text-slate-500">Carregando vagas...</p>

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-primary-800">Vagas</h2>
                <button type="button" className="btn-primary" onClick={onCreate}>
                    <Plus size={18} /> Nova vaga
                </button>
            </div>

            {error && (
                <p className="flex items-center gap-2 text-sm text-red-600 mb-4">
                    <AlertCircle size={16} /> {error}
                </p>
            )}

            {!jobs.length && !error ? (
                <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center gap-4">
                    <Briefcase size={48} className="text-slate-300" />
                    <h3 className="text-lg font-bold text-primary-800">Nenhuma vaga cadastrada</h3>
                    <p className="text-slate-500 text-sm max-w-sm">
                        Crie a primeira vaga. Ela começa como rascunho e só aparece no site depois de publicada.
                    </p>
                    <button type="button" className="btn-outline mt-2" onClick={onCreate}>
                        <Plus size={18} /> Criar vaga
                    </button>
                </div>
            ) : jobs.length > 0 && (
                <div className="bg-white rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Vaga</th>
                                    <th className="px-6 py-3 font-medium">Local</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Candidaturas</th>
                                    <th className="px-6 py-3 font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {jobs.map((job) => (
                                    <tr key={job.id}>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-primary-800">{job.titulo}</p>
                                            <p className="text-sm text-slate-500">
                                                {job.empresa || 'Empresa confidencial'}
                                                {job.codigo ? ` · Cód. ${job.codigo}` : ''}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 whitespace-nowrap">{job.cidade}, {job.uf}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[job.status]}`}>
                                                {STATUS_LABELS[job.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() => onShowApplications(job)}
                                                className="text-primary-700 font-semibold hover:underline"
                                                title="Ver candidaturas desta vaga"
                                            >
                                                {job.candidaturas}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                                <button type="button" onClick={() => onEdit(job.id)} className="flex items-center gap-1 text-primary-700 hover:underline">
                                                    <Pencil size={14} /> Editar
                                                </button>
                                                {job.status === 'rascunho' && (
                                                    <ActionButton disabled={busyId === job.id} onClick={() => changeStatus(job, 'publicada')}>Publicar</ActionButton>
                                                )}
                                                {job.status !== 'encerrada' && (
                                                    <ActionButton disabled={busyId === job.id} onClick={() => changeStatus(job, 'encerrada')} danger>Encerrar</ActionButton>
                                                )}
                                                {job.status === 'encerrada' && (
                                                    <ActionButton disabled={busyId === job.id} onClick={() => changeStatus(job, 'publicada')}>Reabrir</ActionButton>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

function ActionButton({ children, danger, ...props }) {
    return (
        <button
            type="button"
            className={`hover:underline disabled:text-slate-300 disabled:no-underline ${danger ? 'text-red-600' : 'text-primary-700'}`}
            {...props}
        >
            {children}
        </button>
    )
}
