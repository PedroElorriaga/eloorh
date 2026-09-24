import { useCallback, useEffect, useState } from 'react'
import { LogOut, Users, Briefcase } from 'lucide-react'
import { supabase, isConfigured } from './supabaseClient'
import SignIn from './SignIn'
import ApplicationsList from './ApplicationsList'
import ApplicationDetail from './ApplicationDetail'
import JobsList from './JobsList'
import JobForm from './JobForm'

const TABS = [
    { key: 'candidaturas', label: 'Candidaturas', icon: Users },
    { key: 'vagas', label: 'Vagas', icon: Briefcase },
]

export default function Panel() {
    const [session, setSession] = useState(null)
    const [isRestoring, setIsRestoring] = useState(true)
    const [selectedId, setSelectedId] = useState(null)
    const [tab, setTab] = useState('candidaturas')
    // Opening the applications list is filtered by, set from the Vagas tab.
    const [vagaFilter, setVagaFilter] = useState(null)
    // null = jobs list; 'new' = create form; a number = edit form for that opening.
    const [editingJob, setEditingJob] = useState(null)

    useEffect(() => {
        if (!isConfigured) { setIsRestoring(false); return }

        // Restores a session persisted from a previous visit, then keeps it in
        // sync with sign-in, sign-out and token refresh.
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setIsRestoring(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_, next) => {
            setSession(next)
            if (!next) {
                setSelectedId(null)
                setTab('candidaturas')
                setVagaFilter(null)
                setEditingJob(null)
            }
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    const handleSignOut = useCallback(() => {
        supabase.auth.signOut()
    }, [])

    const showApplicationsFor = useCallback((job) => {
        setVagaFilter({ id: job.id, titulo: job.titulo, codigo: job.codigo })
        setSelectedId(null)
        setTab('candidaturas')
    }, [])

    if (!isConfigured) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-primary-800 px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md text-center">
                    <h1 className="text-lg font-bold text-primary-800 mb-2">Painel não configurado</h1>
                    <p className="text-slate-500 text-sm">
                        Defina <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no build
                        para habilitar o acesso da equipe.
                    </p>
                </div>
            </div>
        )
    }

    if (isRestoring) {
        return <div className="min-h-screen flex items-center justify-center bg-primary-800 text-primary-200">Carregando...</div>
    }

    if (!session) return <SignIn />

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-primary-800">
                <div className="section-container py-5 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-white font-bold">Painel Eloo RH</h1>
                        <p className="text-primary-200 text-sm">{session.user.email}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-sm text-primary-100 hover:text-white transition-colors"
                    >
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </header>

            <nav className="bg-white border-b border-slate-200">
                <div className="section-container flex gap-1" role="tablist">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={tab === key}
                            onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                tab === key
                                    ? 'border-primary-700 text-primary-800'
                                    : 'border-transparent text-slate-500 hover:text-primary-700'
                            }`}
                        >
                            <Icon size={16} /> {label}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="section-container py-10">
                {tab === 'candidaturas' && (selectedId ? (
                    <ApplicationDetail
                        token={session.access_token}
                        id={selectedId}
                        onBack={() => setSelectedId(null)}
                        onAuthError={handleSignOut}
                    />
                ) : (
                    <ApplicationsList
                        key={vagaFilter?.id ?? 'todas'}
                        token={session.access_token}
                        vagaFilter={vagaFilter}
                        onClearFilter={() => setVagaFilter(null)}
                        onSelect={setSelectedId}
                        onAuthError={handleSignOut}
                    />
                ))}

                {tab === 'vagas' && (editingJob !== null ? (
                    <JobForm
                        token={session.access_token}
                        id={editingJob === 'new' ? null : editingJob}
                        onDone={() => setEditingJob(null)}
                        onAuthError={handleSignOut}
                    />
                ) : (
                    <JobsList
                        token={session.access_token}
                        onCreate={() => setEditingJob('new')}
                        onEdit={setEditingJob}
                        onShowApplications={showApplicationsFor}
                        onAuthError={handleSignOut}
                    />
                ))}
            </main>
        </div>
    )
}
