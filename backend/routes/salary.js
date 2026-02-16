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
        const pythonExec = process.env.PYTHON_PATH || 'python'
        const py = spawn(pythonExec, [scriptPath], { cwd: mlDir })

        let output = ''
        let errorOutput = ''

        py.stdout.on('data', d => output += d.toString())
        py.stderr.on('data', d => errorOutput += d.toString())

        py.stdin.write(JSON.stringify({ title, city, experience_years }))
        py.stdin.end()

        py.on('error', (err) => {
            console.warn('Python start failed (likely missing python), using fallback:', err.message)
            return res.json(getSalaryFallback(title, city, experience_years))
        })

        py.on('close', (code) => {
            if (code !== 0) {
                console.warn('Python salary calculation failed, using fallback')
                // Check if headers already sent to avoid double-send
                if (!res.headersSent) {
                    return res.json(getSalaryFallback(title, city, experience_years))
                }
                return
            }
            try {
                if (!res.headersSent) {
                    res.json(JSON.parse(output.trim()))
                }
            } catch (e) {
                if (!res.headersSent) {
                    res.json(getSalaryFallback(title, city, experience_years))
                }
            }
        })
    } catch (error) {
        console.error('Salary error:', error)
        res.json(getSalaryFallback(req.body.title, req.body.city, req.body.experience_years))
    }
})

function getSalaryFallback(title, city, exp) {
    const isSenior = /senior|lead|architect/i.test(title)
    const isMid = /mid|middle/i.test(title)
    const isJunior = /junior/i.test(title)

    let base = 300000
    if (isSenior) base = 800000
    else if (isMid) base = 500000

    if (exp > 5) base *= 1.5
    else if (exp > 2) base *= 1.2

    const low = Math.round(base * 0.8)
    const high = Math.round(base * 1.3)

    return {
        low,
        high,
        currency: '₸',
        is_fallback: true
    }
}

export default router
