import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { checkDatabaseConnection, pool } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const allowedMimes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
        if (!allowedMimes.has(file.mimetype)) {
            cb(new Error('Formato de arquivo invalido. Envie PDF, DOC ou DOCX.'))
            return
        }
        cb(null, true)
    },
})

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(morgan('dev'))
app.use(express.json())

const signedUrlTtlSeconds = Number(process.env.RESUME_URL_TTL_SECONDS || 300)
const listPageSizeDefault = 20
const listPageSizeMax = 50

async function requireRecruiter(req, res, next) {
    const header = req.get('authorization') || ''
    const [scheme, token] = header.split(' ')

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
        return res.status(401).json({ message: 'Autenticacao necessaria.' })
    }

    try {
        const { data, error } = await supabase.auth.getUser(token)

        if (error || !data?.user) {
            return res.status(401).json({ message: 'Sessao invalida ou expirada.' })
        }

        req.recruiter = data.user
        return next()
    } catch (error) {
        console.error('Erro ao validar token de recrutadora:', error)
        return res.status(401).json({ message: 'Sessao invalida ou expirada.' })
    }
}

app.get('/api/health', (_, res) => {
    res.json({ ok: true })
})

app.get('/api/applications', requireRecruiter, async (req, res) => {
    const limit = Math.min(
        Math.max(Number.parseInt(req.query.limit, 10) || listPageSizeDefault, 1),
        listPageSizeMax,
    )
    const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0)

    const sql = `
        SELECT
            id,
            nome,
            email,
            cargo,
            area,
            created_at,
            arquivo_caminho IS NOT NULL AS tem_curriculo
        FROM job_applications
        ORDER BY created_at DESC, id DESC
        LIMIT $1 OFFSET $2
    `

    try {
        // Fetch one extra row to know whether another page exists, without a COUNT(*).
        const result = await pool.query(sql, [limit + 1, offset])
        const hasMore = result.rows.length > limit

        return res.json({
            items: hasMore ? result.rows.slice(0, limit) : result.rows,
            limit,
            offset,
            hasMore,
            nextOffset: hasMore ? offset + limit : null,
        })
    } catch (error) {
        console.error('Erro ao listar candidaturas:', error)
        return res.status(500).json({ message: 'Erro interno ao listar candidaturas.' })
    }
})

app.get('/api/applications/:id', requireRecruiter, async (req, res) => {
    const id = Number.parseInt(req.params.id, 10)

    if (!Number.isInteger(id) || id < 1) {
        return res.status(404).json({ message: 'Candidatura nao encontrada.' })
    }

    const sql = `
        SELECT
            id,
            nome,
            email,
            telefone,
            cargo,
            area,
            sobre,
            arquivo_nome_original,
            arquivo_mime,
            arquivo_tamanho_bytes,
            arquivo_caminho IS NOT NULL AS tem_curriculo,
            created_at
        FROM job_applications
        WHERE id = $1
    `

    try {
        const result = await pool.query(sql, [id])

        if (!result.rows[0]) {
            return res.status(404).json({ message: 'Candidatura nao encontrada.' })
        }

        return res.json(result.rows[0])
    } catch (error) {
        console.error('Erro ao buscar candidatura:', error)
        return res.status(500).json({ message: 'Erro interno ao buscar candidatura.' })
    }
})

app.get('/api/applications/:id/resume', requireRecruiter, async (req, res) => {
    const id = Number.parseInt(req.params.id, 10)

    if (!Number.isInteger(id) || id < 1) {
        return res.status(404).json({ message: 'Candidatura nao encontrada.' })
    }

    try {
        const result = await pool.query(
            'SELECT arquivo_caminho, arquivo_nome_original FROM job_applications WHERE id = $1',
            [id],
        )
        const row = result.rows[0]

        if (!row) {
            return res.status(404).json({ message: 'Candidatura nao encontrada.' })
        }

        if (!row.arquivo_caminho) {
            return res.status(404).json({ message: 'Esta candidatura nao tem curriculo anexado.' })
        }

        const { data, error } = await supabase.storage
            .from('curriculos')
            .createSignedUrl(row.arquivo_caminho, signedUrlTtlSeconds, {
                // Restores the candidate's original filename on download; the stored
                // object name carries a uniqueness suffix.
                download: row.arquivo_nome_original || undefined,
            })

        if (error || !data?.signedUrl) {
            console.error('Erro ao gerar link do curriculo:', error)
            return res.status(500).json({ message: 'Erro ao gerar link do curriculo.' })
        }

        return res.json({
            url: data.signedUrl,
            expiresInSeconds: signedUrlTtlSeconds,
            filename: row.arquivo_nome_original,
        })
    } catch (error) {
        console.error('Erro ao buscar curriculo:', error)
        return res.status(500).json({ message: 'Erro interno ao buscar curriculo.' })
    }
})

app.post('/api/applications', upload.single('arquivo'), async (req, res) => {
    const { nome, email, telefone, cargo, area, sobre = '' } = req.body

    if (!nome || !email || !telefone || !cargo || !area) {
        return res.status(400).json({ message: 'Preencha todos os campos obrigatorios.' })
    }

    const sql = `
        INSERT INTO job_applications (
            nome,
            email,
            telefone,
            cargo,
            area,
            sobre,
            arquivo_nome_original,
            arquivo_mime,
            arquivo_tamanho_bytes,
            arquivo_caminho
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
    `

    let storagePath = null
    if (req.file) {
        const ext = path.extname(req.file.originalname).toLowerCase()
        const base = path.basename(req.file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 80) || 'curriculo'
        const filename = `${base}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`

        const { error: uploadError } = await supabase.storage
            .from('curriculos')
            .upload(filename, req.file.buffer, { contentType: req.file.mimetype })

        if (uploadError) {
            console.error('Erro ao enviar arquivo ao Supabase Storage:', uploadError)
            return res.status(500).json({ message: 'Erro ao armazenar arquivo. Tente novamente.' })
        }

        storagePath = filename
    }

    try {
        const result = await pool.query(sql, [
            String(nome).trim(),
            String(email).trim(),
            String(telefone).trim(),
            String(cargo).trim(),
            String(area).trim(),
            String(sobre).trim(),
            req.file?.originalname || null,
            req.file?.mimetype || null,
            req.file?.size || null,
            storagePath,
        ])

        return res.status(201).json({
            message: 'Candidatura enviada com sucesso.',
            id: result.rows[0]?.id,
        })
    } catch (error) {
        console.error('Erro ao salvar candidatura:', error)
        return res.status(500).json({ message: 'Erro interno ao salvar candidatura.' })
    }
})

app.use((err, _, res, __) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Arquivo muito grande. Maximo de 5 MB.' })
        }
        return res.status(400).json({ message: 'Erro no upload do arquivo.' })
    }

    if (err) {
        return res.status(400).json({ message: err.message || 'Requisicao invalida.' })
    }

    return res.status(500).json({ message: 'Erro inesperado.' })
})

const port = Number(process.env.PORT || 4000)

async function start() {
    try {
        await checkDatabaseConnection()
        app.listen(port, () => {
            console.log(`API pronta em http://localhost:${port}`)
        })
    } catch (error) {
        console.error('Falha ao conectar no PostgreSQL:', error)
        process.exit(1)
    }
}

start()
