require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./db');
const syncService = require('./services/syncService');

// Import routes
const indexRoutes = require('./routes/index');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;
const SYNC_INTERVAL_MINUTES = parseInt(process.env.SYNC_INTERVAL_MINUTES, 10) || 30;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for exports
app.use('/exports', express.static(path.join(__dirname, 'exports')));

// Routes
app.use('/', indexRoutes);
app.use('/tasks', taskRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Initialize database and start server
async function startServer() {
    try {
        await database.connect();
        console.log('Database initialized successfully');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`API endpoints:`);
            console.log(`  GET    /health`);
            console.log(`  GET    /tasks`);
            console.log(`  POST   /tasks`);
            console.log(`  PUT    /tasks/:id`);
            console.log(`  POST   /tasks/sync`);
            console.log(`  GET    /tasks/sync/status`);
            console.log(`  GET    /tasks/:id`);
            console.log(`  GET    /tasks/external/:externalId`);
            console.log(`  GET    /tasks/:id/related`);
            console.log(`  POST   /tasks/:id/export`);
        });

        // Schedule periodic sync
        try {
            const intervalMs = Math.max(1, SYNC_INTERVAL_MINUTES) * 60 * 1000;
            console.log(`Scheduling OpenProject sync every ${SYNC_INTERVAL_MINUTES} minute(s)`);

            // Initial run (non-blocking)
            (async () => {
                console.log('Running initial OpenProject sync...');
                const res = await syncService.syncAll();
                if (res.success) {
                    console.log('Initial sync completed:', res.results || {});
                } else {
                    console.error('Initial sync failed:', res.error || res);
                }
            })();

            setInterval(async () => {
                console.log('Scheduled sync triggered at', new Date().toISOString());
                const res = await syncService.syncAll();
                if (res.success) {
                    console.log('Scheduled sync completed:', res.results || {});
                } else {
                    console.error('Scheduled sync failed:', res.error || res);
                }
            }, intervalMs);
        } catch (err) {
            console.error('Failed to schedule sync:', err.message || err);
        }
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\\nShutting down server...');
    try {
        await database.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    try {
        await database.close();
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

startServer();