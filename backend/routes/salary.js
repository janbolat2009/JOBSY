import express from 'express'
import { spawn } from 'child_process'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const router = express.Router()

router.post('/estimate', async (req, res) => {
    try {
        const { title, city, experience_years } = req.body

        const scriptPath = path.join(__dirname, '../../ml/salary_calculator.py')
        const mlDir = path.join(__dirname, '../../ml')
        const pythonExec = 'C:\\Users\\lenovo\\JOBSY\\ml\\.venv\\Scripts\\python.exe'
        const py = spawn(pythonExec, [scriptPath], { cwd: mlDir })

        let output = ''
        let errorOutput = ''

        py.stdout.on('data', d => output += d.toString())
        py.stderr.on('data', d => errorOutput += d.toString())

        py.stdin.write(JSON.stringify({ title, city, experience_years }))
        py.stdin.end()

        py.on('close', (code) => {
            if (code !== 0) return res.status(500).json({ error: 'Fail' })
            try {
                res.json(JSON.parse(output.trim()))
            } catch (e) {
                res.status(500).json({ error: 'Fail' })
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
