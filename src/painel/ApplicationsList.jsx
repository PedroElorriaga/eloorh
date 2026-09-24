import { useEffect, useState } from 'react'
import { Inbox, Paperclip, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { listApplications } from './api'
import { formatDate } from './format'

const PAGE_SIZE = 20

export default function ApplicationsList({ token, vagaFilter, onClearFilter, onSelect, onAuthError }) {
    const [page, setPage] = useState({ items: [], hasMore: false, offset: 0 })
    const [offset, setOffset] = useState(0)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let active = true
        setIsLoading(true)
        setError('')

        listApplications(token, { limit: PAGE_SIZE, offset, vagaId: vagaFilter?.id })
            .then((data) => { if (active) setPage(data) })
            .catch((err) => {
                if (!active) return
                if (err.status === 401) { onAuthError(); return }
                setError(err.message)
            })
            .finally(() => { if (active) setIsLoading(false) })

        return () => { active = false }
    }, [token, offset, vagaFilter, onAuthError])

    const filterChip = vagaFilter && (
        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
            <span className="text-slate-500">Candidaturas da vaga</span>
            <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-800 font-medium rounded-full pl-3 pr-1 py-1">
                {vagaFilter.titulo}{vagaFilter.codigo ? ` (Cód. ${vagaFilter.codigo})` : ''}
                <button
                    type="button"
                    onClick={onClearFilter}
                    className="p-0.5 rounded-full hover:bg-primary-100"
                    aria-label="Remover filtro de vaga"
                >
                    <X size={14} />
                </button>
            </span>
        </div>
    )

    if (isLoading) return <>{filterChip}<p className="text-slate-500">Carregando candidaturas...</p></>

    if (error) {
        return (
            <>
                {filterChip}
                <p className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle size={16} /> {error}
                </p>
            </>
        )
    }

    if (!page.items.length) {
        return (
            <>
            {filterChip}
            <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center gap-4">
                <Inbox size={48} className="text-slate-300" />
                <h2 className="text-lg font-bold text-primary-800">
                    {offset === 0 ? 'Nenhuma candidatura ainda' : 'Nada nesta página'}
                </h2>
                <p className="text-slate-500 text-sm max-w-sm">
                    {offset > 0
                        ? 'Volte para a página anterior para ver as candidaturas.'
                        : vagaFilter
                            ? 'Esta vaga ainda não recebeu candidaturas.'
                            : 'Assim que alguém enviar o formulário de currículo no site, a candidatura aparece aqui.'}
                </p>
                {offset > 0 && (
                    <button type="button" className="btn-outline mt-2" onClick={() => setOffset(Math.max(offset - PAGE_SIZE, 0))}>
                        Página anterior
                    </button>
                )}
            </div>
            </>
        )
    }

    return (
        <div>
            {filterChip}
            <div className="bg-white rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Candidato</th>
                                <th className="px-6 py-3 font-medium">Área</th>
                                <th className="px-6 py-3 font-medium">Cargo</th>
                                <th className="px-6 py-3 font-medium">Vaga</th>
                                <th className="px-6 py-3 font-medium">Enviada em</th>
                                <th className="px-6 py-3 font-medium">Currículo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {page.items.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => onSelect(item.id)}
                                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-primary-800">{item.nome}</p>
                                        <p className="text-sm text-slate-500">{item.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">{item.area}</td>
                                    <td className="px-6 py-4 text-slate-700">{item.cargo}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {item.vaga_id ? (
                                            <span className="text-primary-800">
                                                {item.vaga_titulo}
                                                {item.vaga_codigo && <span className="text-slate-500"> · Cód. {item.vaga_codigo}</span>}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">Banco de talentos</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                                        {formatDate(item.created_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.tem_curriculo
                                            ? <Paperclip size={18} className="text-primary-600" aria-label="Com currículo" />
                                            : <span className="text-slate-300 text-sm">—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between mt-6">
                <button
                    type="button"
                    className="flex items-center gap-1 text-sm text-primary-700 disabled:text-slate-300 disabled:cursor-not-allowed hover:underline disabled:no-underline"
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(offset - PAGE_SIZE, 0))}
                >
                    <ChevronLeft size={16} /> Anteriores
                </button>

                <span className="text-sm text-slate-500">
                    {offset + 1}–{offset + page.items.length}
                </span>

                <button
                    type="button"
                    className="flex items-center gap-1 text-sm text-primary-700 disabled:text-slate-300 disabled:cursor-not-allowed hover:underline disabled:no-underline"
                    disabled={!page.hasMore}
                    onClick={() => setOffset(page.nextOffset ?? offset + PAGE_SIZE)}
                >
                    Próximas <ChevronRight size={16} />
                </button>
            </div>
        </div>
    )
}
