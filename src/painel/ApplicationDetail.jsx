import { useEffect, useState } from 'react'
import { ArrowLeft, Download, AlertCircle } from 'lucide-react'
import { getApplication, getResumeLink } from './api'
import { formatDate, formatBytes } from './format'

export default function ApplicationDetail({ token, id, onBack, onAuthError }) {
    const [application, setApplication] = useState(null)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isDownloading, setIsDownloading] = useState(false)

    useEffect(() => {
        let active = true
        setIsLoading(true)
        setError('')

        getApplication(token, id)
            .then((data) => { if (active) setApplication(data) })
            .catch((err) => {
                if (!active) return
                if (err.status === 401) { onAuthError(); return }
                setError(err.status === 404 ? 'Candidatura não encontrada.' : err.message)
            })
            .finally(() => { if (active) setIsLoading(false) })

        return () => { active = false }
    }, [token, id, onAuthError])

    const handleDownload = async () => {
        setError('')
        setIsDownloading(true)

        try {
            const { url } = await getResumeLink(token, id)
            window.open(url, '_blank', 'noopener,noreferrer')
        } catch (err) {
            if (err.status === 401) { onAuthError(); return }
            setError(err.message)
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div>
            <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-primary-700 hover:underline mb-6">
                <ArrowLeft size={16} /> Voltar para a lista
            </button>

            {isLoading && <p className="text-slate-500">Carregando...</p>}

            {error && (
                <p className="flex items-center gap-2 text-sm text-red-600 mb-4">
                    <AlertCircle size={16} /> {error}
                </p>
            )}

            {application && (
                <div className="bg-white rounded-2xl p-8 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-primary-800">{application.nome}</h2>
                        <p className="text-slate-500 text-sm mt-1">
                            Enviada em {formatDate(application.created_at)}
                        </p>
                    </div>

                    <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                        <Field label="E-mail" value={application.email} href={`mailto:${application.email}`} />
                        <Field label="Telefone" value={application.telefone} />
                        <Field label="Cargo pretendido" value={application.cargo} />
                        <Field label="Área" value={application.area} />
                    </dl>

                    {application.sobre && (
                        <div>
                            <p className="form-label">Sobre o candidato</p>
                            <p className="text-slate-700 whitespace-pre-line">{application.sobre}</p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-200">
                        {application.tem_curriculo ? (
                            <div className="flex flex-wrap items-center gap-4">
                                <button type="button" className="btn-primary" onClick={handleDownload} disabled={isDownloading}>
                                    <Download size={18} />
                                    {isDownloading ? 'Gerando link...' : 'Baixar currículo'}
                                </button>
                                <span className="text-sm text-slate-500">
                                    {application.arquivo_nome_original}
                                    {application.arquivo_tamanho_bytes
                                        ? ` · ${formatBytes(application.arquivo_tamanho_bytes)}`
                                        : ''}
                                </span>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">Esta candidatura foi enviada sem currículo anexado.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function Field({ label, value, href }) {
    return (
        <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">{label}</dt>
            <dd className="text-slate-800">
                {href ? <a href={href} className="text-primary-700 hover:underline">{value}</a> : value}
            </dd>
        </div>
    )
}
