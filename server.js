import app from './api/server.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`✅ JOBSY Backend running on port ${PORT}`)
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`)
})
