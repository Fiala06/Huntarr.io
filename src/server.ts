// Add this to your existing server file

import settingsRoutes from './routes/SettingsRoutes';

// Register the routes
app.use('/api/settings', settingsRoutes);
