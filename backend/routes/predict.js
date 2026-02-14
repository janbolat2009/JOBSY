import express from 'express'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

const runPrediction = (data) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '..', 'predict.py')
        const py = spawn('python', [scriptPath], { cwd: path.join(__dirname, '..') })
        let output = ''
        let errorOutput = ''
        py.stdout.on('data', d => output += d.toString())
        py.stderr.on('data', d => errorOutput += d.toString())
        py.on('error', reject)
        py.stdin.write(JSON.stringify(data))
        py.stdin.end()
        py.on('close', code => {
            if (code !== 0) return reject(new Error(errorOutput || 'Prediction failed'))
            try { resolve(JSON.parse(output.trim())) } catch (e) { reject(e) }
        })
    })
}

router.post('/batch', async (req, res) => {
    try {
        const { items } = req.body
        const results = await runPrediction(items)
        res.json(results)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/single', async (req, res) => {
    try {
        const result = await runPrediction(req.body)
        res.json(result)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
