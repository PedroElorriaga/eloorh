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

app.get('/api/health', (_, res) => {
    res.json({ ok: true })
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
