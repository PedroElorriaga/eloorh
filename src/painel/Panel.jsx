import { useCallback, useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { supabase, isConfigured } from './supabaseClient'
import SignIn from './SignIn'
import ApplicationsList from './ApplicationsList'
import ApplicationDetail from './ApplicationDetail'

export default function Panel() {
    const [session, setSession] = useState(null)
    const [isRestoring, setIsRestoring] = useState(true)
    const [selectedId, setSelectedId] = useState(null)

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
            if (!next) setSelectedId(null)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    const handleSignOut = useCallback(() => {
        supabase.auth.signOut()
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
                        <h1 className="text-white font-bold">Painel de Candidaturas</h1>
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

            <main className="section-container py-10">
                {selectedId ? (
                    <ApplicationDetail
                        token={session.access_token}
                        id={selectedId}
                        onBack={() => setSelectedId(null)}
                        onAuthError={handleSignOut}
                    />
                ) : (
                    <ApplicationsList
                        token={session.access_token}
                        onSelect={setSelectedId}
                        onAuthError={handleSignOut}
                    />
                )}
            </main>
        </div>
    )
}
