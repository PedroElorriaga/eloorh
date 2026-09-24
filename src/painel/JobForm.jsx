import { useEffect, useState } from 'react'
import { ArrowLeft, AlertCircle, Save } from 'lucide-react'
import { createJob, getJob, updateJob } from './api'
import { BRAZILIAN_STATES, CONTRACT_TYPES, STATUS_LABELS } from './jobOptions'

const EMPTY = {
    titulo: '',
    codigo: '',
    empresa: '',
    cidade: '',
    uf: '',
    tipo_contratacao: '',
    area_profissional: '',
    carga_horaria: '',
    salario: '',
    posicoes: '1',
    beneficios: '',
    responsabilidades: '',
    requisitos: '',
}

// The API returns null for empty optional fields; inputs need strings.
function toFields(job) {
    return Object.fromEntries(Object.keys(EMPTY).map((key) => [key, job[key] == null ? '' : String(job[key])]))
}

export default function JobForm({ token, id, onDone, onAuthError }) {
    const [fields, setFields] = useState(EMPTY)
    const [status, setStatus] = useState(null)
    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState('')
    const [isLoading, setIsLoading] = useState(Boolean(id))
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!id) return undefined
        let active = true

        getJob(token, id)
            .then((job) => {
                if (!active) return
                setFields(toFields(job))
                setStatus(job.status)
            })
            .catch((err) => {
                if (!active) return
                if (err.status === 401) { onAuthError(); return }
                setFormError(err.status === 404 ? 'Vaga não encontrada.' : err.message)
            })
            .finally(() => { if (active) setIsLoading(false) })

        return () => { active = false }
    }, [token, id, onAuthError])

    const set = (key) => (e) => {
        const value = e.target.value
        setFields((f) => ({ ...f, [key]: value }))
        if (errors[key]) setErrors((prev) => { const next = { ...prev }; delete next[key]; return next })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        setFormError('')

        try {
            if (id) await updateJob(token, id, fields)
            else await createJob(token, fields)
            onDone()
        } catch (err) {
            if (err.status === 401) { onAuthError(); return }
            setErrors(err.fields || {})
            setFormError(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const input = (key, label, props = {}) => (
        <div>
            <label className="form-label" htmlFor={`job-${key}`}>{label}</label>
            <input
                id={`job-${key}`}
                value={fields[key]}
                onChange={set(key)}
                className={`form-input ${errors[key] ? 'form-input-error' : ''}`}
                {...props}
            />
            {errors[key] && <p className="error-msg">{errors[key]}</p>}
        </div>
    )

    const select = (key, label, options) => (
        <div>
            <label className="form-label" htmlFor={`job-${key}`}>{label}</label>
            <select
                id={`job-${key}`}
                value={fields[key]}
                onChange={set(key)}
                className={`form-input ${errors[key] ? 'form-input-error' : ''}`}
            >
                <option value="">Selecione...</option>
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            {errors[key] && <p className="error-msg">{errors[key]}</p>}
        </div>
    )

    const textarea = (key, label, hint) => (
        <div>
            <label className="form-label" htmlFor={`job-${key}`}>{label}</label>
            {hint && <p className="text-xs text-slate-500 mb-1">{hint}</p>}
            <textarea
                id={`job-${key}`}
                rows={6}
                value={fields[key]}
                onChange={set(key)}
                className={`form-input resize-y ${errors[key] ? 'form-input-error' : ''}`}
            />
            {errors[key] && <p className="error-msg">{errors[key]}</p>}
        </div>
    )

    return (
        <div>
            <button type="button" onClick={onDone} className="flex items-center gap-2 text-sm text-primary-700 hover:underline mb-6">
                <ArrowLeft size={16} /> Voltar para as vagas
            </button>

            {isLoading ? (
                <p className="text-slate-500">Carregando vaga...</p>
            ) : (
                <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl p-8 space-y-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h2 className="text-2xl font-bold text-primary-800">{id ? 'Editar vaga' : 'Nova vaga'}</h2>
                        <span className="text-sm text-slate-500">
                            {id && status ? `Status: ${STATUS_LABELS[status]}` : 'Será criada como rascunho'}
                        </span>
                    </div>

                    <fieldset className="space-y-5">
                        <legend className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-3">Dados da vaga</legend>
                        <div className="grid sm:grid-cols-3 gap-5">
                            <div className="sm:col-span-2">{input('titulo', 'Título *', { maxLength: 150, placeholder: 'Ex.: Analista de PCP' })}</div>
                            {input('codigo', 'Código da vaga', { maxLength: 30, placeholder: 'Ex.: 6623' })}
                        </div>
                        <div>
                            {input('empresa', 'Empresa contratante', { maxLength: 150 })}
                            <p className="text-xs text-slate-500 mt-1">
                                Deixe vazio para exibir como “Empresa confidencial” — revise também a descrição para não citar o cliente.
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-5">
                            <div className="sm:col-span-2">{input('cidade', 'Cidade *', { maxLength: 100 })}</div>
                            {select('uf', 'UF *', BRAZILIAN_STATES)}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                            {select('tipo_contratacao', 'Tipo de contratação *', CONTRACT_TYPES)}
                            {input('area_profissional', 'Área profissional *', { maxLength: 100, placeholder: 'Ex.: Produção/Fabricação' })}
                        </div>
                        <div className="grid sm:grid-cols-3 gap-5">
                            {input('carga_horaria', 'Carga horária', { maxLength: 50, placeholder: 'Ex.: 220' })}
                            {input('salario', 'Salário (R$)', { type: 'number', min: 0, step: '0.01', placeholder: 'Vazio = A combinar' })}
                            {input('posicoes', 'Posições', { type: 'number', min: 1, step: 1 })}
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-3">Benefícios</legend>
                        {textarea('beneficios', 'Benefícios', 'Um benefício por linha.')}
                    </fieldset>

                    <fieldset>
                        <legend className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-3">Responsabilidades</legend>
                        {textarea('responsabilidades', 'Responsabilidades e atribuições *', 'As quebras de linha são mantidas no site.')}
                    </fieldset>

                    <fieldset>
                        <legend className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-3">Requisitos</legend>
                        {textarea('requisitos', 'Requisitos e qualificações')}
                    </fieldset>

                    {formError && (
                        <p className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle size={16} /> {formError}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button type="button" className="btn-outline" onClick={onDone} disabled={isSaving}>
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
