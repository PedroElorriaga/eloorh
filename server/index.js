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

// Mirrored in src/painel/jobOptions.js for the panel's selects; the API is authoritative.
const contractTypes = ['CLT (Efetivo)', 'PJ', 'Estágio', 'Temporário', 'Jovem Aprendiz', 'Freelancer']
const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

// Columns visitors may see; internal data (status, counts, timestamps other than
// the publication date) stays out of the public API.
const publicJobColumns = `
    id, titulo, codigo, empresa, cidade, uf, tipo_contratacao, area_profissional,
    carga_horaria, salario::float8 AS salario, posicoes, beneficios, responsabilidades,
    requisitos, publicada_em
`

function parseId(value) {
    const id = Number(value)
    return Number.isSafeInteger(id) && id >= 1 && String(value).trim() === String(id) ? id : null
}

function optionalText(value) {
    const text = String(value ?? '').trim()
    return text || null
}

// Returns the normalized opening plus per-field messages, so the panel can mark
// each offending field.
function validateJobOpening(body = {}) {
    const errors = {}
    const text = (field, { required = false, max }) => {
        const value = optionalText(body[field])
        if (required && !value) errors[field] = 'Campo obrigatorio.'
        else if (value && value.length > max) errors[field] = `Maximo de ${max} caracteres.`
        return value
    }

    const values = {
        titulo: text('titulo', { required: true, max: 150 }),
        codigo: text('codigo', { max: 30 }),
        empresa: text('empresa', { max: 150 }),
        cidade: text('cidade', { required: true, max: 100 }),
        uf: text('uf', { required: true, max: 2 })?.toUpperCase() ?? null,
        tipo_contratacao: text('tipo_contratacao', { required: true, max: 30 }),
        area_profissional: text('area_profissional', { required: true, max: 100 }),
        carga_horaria: text('carga_horaria', { max: 50 }),
        salario: null,
        posicoes: 1,
        beneficios: text('beneficios', { max: 10000 }),
        responsabilidades: text('responsabilidades', { required: true, max: 10000 }),
        requisitos: text('requisitos', { max: 10000 }),
    }

    if (values.uf && !brazilianStates.includes(values.uf)) errors.uf = 'UF invalida.'
    if (values.tipo_contratacao && !contractTypes.includes(values.tipo_contratacao)) {
        errors.tipo_contratacao = 'Tipo de contratacao invalido.'
    }

    const salario = optionalText(body.salario)
    if (salario !== null) {
        const amount = Number(salario)
        if (!Number.isFinite(amount) || amount < 0 || amount >= 1e8) errors.salario = 'Informe um valor valido em reais.'
        else values.salario = Math.round(amount * 100) / 100
    }

    const posicoes = optionalText(body.posicoes)
    if (posicoes !== null) {
        const count = Number(posicoes)
        if (!Number.isInteger(count) || count < 1 || count > 9999) errors.posicoes = 'Informe um numero inteiro a partir de 1.'
        else values.posicoes = count
    }

    return { values, errors }
}

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

app.get('/api/jobs', async (_, res) => {
    try {
        const result = await pool.query(`
            SELECT ${publicJobColumns}
            FROM job_openings
            WHERE status = 'publicada'
            ORDER BY publicada_em DESC, id DESC
        `)

        return res.json({ items: result.rows })
    } catch (error) {
        console.error('Erro ao listar vagas:', error)
        return res.status(500).json({ message: 'Erro interno ao listar vagas.' })
    }
})

app.get('/api/jobs/:id', async (req, res) => {
    const id = parseId(req.params.id)

    if (!id) {
        return res.status(404).json({ message: 'Vaga nao encontrada.' })
    }

    try {
        const result = await pool.query(
            `SELECT ${publicJobColumns} FROM job_openings WHERE id = $1 AND status = 'publicada'`,
            [id],
        )

        if (!result.rows[0]) {
            return res.status(404).json({ message: 'Vaga nao encontrada.' })
        }

        return res.json(result.rows[0])
    } catch (error) {
        console.error('Erro ao buscar vaga:', error)
        return res.status(500).json({ message: 'Erro interno ao buscar vaga.' })
    }
})

app.get('/api/applications', requireRecruiter, async (req, res) => {
    const limit = Math.min(
        Math.max(Number.parseInt(req.query.limit, 10) || listPageSizeDefault, 1),
        listPageSizeMax,
    )
    const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0)
    let vagaId = null

    if (req.query.vaga_id !== undefined && req.query.vaga_id !== '') {
        vagaId = parseId(req.query.vaga_id)

        if (!vagaId) {
            return res.status(400).json({ message: 'Vaga invalida.' })
        }
    }

    const sql = `
        SELECT
            a.id,
            a.nome,
            a.email,
            a.cargo,
            a.area,
            a.created_at,
            a.arquivo_caminho IS NOT NULL AS tem_curriculo,
            a.vaga_id,
            o.titulo AS vaga_titulo,
            o.codigo AS vaga_codigo
        FROM job_applications a
        LEFT JOIN job_openings o ON o.id = a.vaga_id
        WHERE ($3::bigint IS NULL OR a.vaga_id = $3)
        ORDER BY a.created_at DESC, a.id DESC
        LIMIT $1 OFFSET $2
    `

    try {
        // Fetch one extra row to know whether another page exists, without a COUNT(*).
        const result = await pool.query(sql, [limit + 1, offset, vagaId])
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
            a.id,
            a.nome,
            a.email,
            a.telefone,
            a.cargo,
            a.area,
            a.sobre,
            a.arquivo_nome_original,
            a.arquivo_mime,
            a.arquivo_tamanho_bytes,
            a.arquivo_caminho IS NOT NULL AS tem_curriculo,
            a.created_at,
            a.vaga_id,
            o.titulo AS vaga_titulo,
            o.codigo AS vaga_codigo,
            o.status AS vaga_status
        FROM job_applications a
        LEFT JOIN job_openings o ON o.id = a.vaga_id
        WHERE a.id = $1
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

const recruiterJobColumns = `
    o.id, o.titulo, o.codigo, o.empresa, o.cidade, o.uf, o.tipo_contratacao,
    o.area_profissional, o.carga_horaria, o.salario::float8 AS salario, o.posicoes,
    o.beneficios, o.responsabilidades, o.requisitos, o.status, o.publicada_em,
    o.created_at, o.updated_at
`

app.get('/api/recruiter/jobs', requireRecruiter, async (_, res) => {
    try {
        const result = await pool.query(`
            SELECT ${recruiterJobColumns}, COUNT(a.id)::int AS candidaturas
            FROM job_openings o
            LEFT JOIN job_applications a ON a.vaga_id = o.id
            GROUP BY o.id
            ORDER BY o.updated_at DESC, o.id DESC
        `)

        return res.json({ items: result.rows })
    } catch (error) {
        console.error('Erro ao listar vagas (painel):', error)
        return res.status(500).json({ message: 'Erro interno ao listar vagas.' })
    }
})

app.get('/api/recruiter/jobs/:id', requireRecruiter, async (req, res) => {
    const id = parseId(req.params.id)

    if (!id) {
        return res.status(404).json({ message: 'Vaga nao encontrada.' })
    }

    try {
        const result = await pool.query(`SELECT ${recruiterJobColumns} FROM job_openings o WHERE o.id = $1`, [id])

        if (!result.rows[0]) {
            return res.status(404).json({ message: 'Vaga nao encontrada.' })
        }

        return res.json(result.rows[0])
    } catch (error) {
        console.error('Erro ao buscar vaga (painel):', error)
        return res.status(500).json({ message: 'Erro interno ao buscar vaga.' })
    }
})

const editableJobFields = [
    'titulo', 'codigo', 'empresa', 'cidade', 'uf', 'tipo_contratacao', 'area_profissional',
    'carga_horaria', 'salario', 'posicoes', 'beneficios', 'responsabilidades', 'requisitos',
]

app.post('/api/recruiter/jobs', requireRecruiter, async (req, res) => {
    const { values, errors } = validateJobOpening(req.body)

    if (Object.keys(errors).length) {
        return res.status(400).json({ message: 'Revise os campos destacados.', errors })
    }

    const placeholders = editableJobFields.map((_, i) => `$${i + 1}`).join(', ')

    try {
        // New openings always start as drafts; publishing is a separate step.
        const result = await pool.query(
            `INSERT INTO job_openings (${editableJobFields.join(', ')}) VALUES (${placeholders}) RETURNING id`,
            editableJobFields.map((field) => values[field]),
        )

        return res.status(201).json({ message: 'Vaga criada como rascunho.', id: result.rows[0].id })
    } catch (error) {
        console.error('Erro ao criar vaga:', error)
        return res.status(500).json({ message: 'Erro interno ao criar vaga.' })
    }
})

app.put('/api/recruiter/jobs/:id', requireRecruiter, async (req, res) => {
    const id = parseId(req.params.id)

    if (!id) {
        return res.status(404).json({ message: 'Vaga nao encontrada.' })
    }

    const { values, errors } = validateJobOpening(req.body)

    if (Object.keys(errors).length) {
        return res.status(400).json({ message: 'Revise os campos destacados.', errors })
    }

    // Status is deliberately not editable here, so saving an edit can never
    // publish or close an opening by accident.
    const assignments = editableJobFields.map((field, i) => `${field} = $${i + 2}`).join(', ')

    try {
        const result = await pool.query(
            `UPDATE job_openings SET ${assignments} WHERE id = $1 RETURNING id`,
            [id, ...editableJobFields.map((field) => values[field])],
        )

        if (!result.rows[0]) {
            return res.status(404).json({ message: 'Vaga nao encontrada.' })
        }

        return res.json({ message: 'Vaga atualizada.', id })
    } catch (error) {
        console.error('Erro ao atualizar vaga:', error)
        return res.status(500).json({ message: 'Erro interno ao atualizar vaga.' })
    }
})

app.patch('/api/recruiter/jobs/:id/status', requireRecruiter, async (req, res) => {
    const id = parseId(req.params.id)
    const status = req.body?.status

    if (!id) {
        return res.status(404).json({ message: 'Vaga nao encontrada.' })
    }

    // Openings never go back to draft: they are published, closed, or reopened.
    if (status !== 'publicada' && status !== 'encerrada') {
        return res.status(400).json({ message: 'Status invalido. Use publicada ou encerrada.' })
    }

    try {
        // Publishing (including reopening) resets the date behind "Publicada ha ...".
        // Requesting the state the opening is already in changes nothing.
        const updated = await pool.query(
            `UPDATE job_openings
             SET status = $2,
                 publicada_em = CASE WHEN $2 = 'publicada' THEN NOW() ELSE publicada_em END
             WHERE id = $1 AND status <> $2
             RETURNING id, status, publicada_em`,
            [id, status],
        )

        if (updated.rows[0]) {
            return res.json(updated.rows[0])
        }

        const current = await pool.query('SELECT id, status, publicada_em FROM job_openings WHERE id = $1', [id])

        if (!current.rows[0]) {
            return res.status(404).json({ message: 'Vaga nao encontrada.' })
        }

        return res.json(current.rows[0])
    } catch (error) {
        console.error('Erro ao alterar status da vaga:', error)
        return res.status(500).json({ message: 'Erro interno ao alterar status da vaga.' })
    }
})

app.post('/api/applications', upload.single('arquivo'), async (req, res) => {
    const { nome, email, telefone, sobre = '' } = req.body
    let { cargo, area } = req.body
    const rawVagaId = optionalText(req.body.vaga_id)
    let vagaId = null

    // Role and area come from the opening when the application is for one.
    if (!nome || !email || !telefone || (!rawVagaId && (!cargo || !area))) {
        return res.status(400).json({ message: 'Preencha todos os campos obrigatorios.' })
    }

    if (rawVagaId) {
        vagaId = parseId(rawVagaId)

        if (!vagaId) {
            return res.status(400).json({ message: 'Vaga invalida.' })
        }

        // Checked before the resume upload, so a rejected application leaves no file behind.
        try {
            const opening = await pool.query(
                `SELECT titulo, area_profissional FROM job_openings WHERE id = $1 AND status = 'publicada'`,
                [vagaId],
            )

            if (!opening.rows[0]) {
                return res.status(409).json({ message: 'Esta vaga nao esta mais disponivel.' })
            }

            cargo = opening.rows[0].titulo
            area = opening.rows[0].area_profissional
        } catch (error) {
            console.error('Erro ao verificar vaga da candidatura:', error)
            return res.status(500).json({ message: 'Erro interno ao salvar candidatura.' })
        }
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
            arquivo_caminho,
            vaga_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
            vagaId,
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
