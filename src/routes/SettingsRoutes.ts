import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const CONFIG_FILE = path.resolve('huntarr.json');
const DEFAULT_CONFIGS_DIR = path.resolve('src/primary/default_configs');

// Helper function to load default settings for a specific app
function loadDefaultAppSettings(appName: string) {
  const defaultFile = path.join(DEFAULT_CONFIGS_DIR, `${appName}.json`);
  try {
    if (fs.existsSync(defaultFile)) {
      const data = fs.readFileSync(defaultFile, 'utf8');
      return JSON.parse(data);
    } else {
      console.warn(`Default settings file not found for app: ${appName}`);
      return {};
    }
  } catch (error) {
    console.error(`Error loading default settings for ${appName}:`, error);
    return {};
  }
}

// Helper function to get all default settings combined
function getAllDefaultSettings() {
  const allDefaults: Record<string, any> = {};
  const appNames = ['sonarr', 'radarr', 'lidarr', 'readarr', 'whisparr', 'general'];
  
  appNames.forEach(appName => {
    const defaults = loadDefaultAppSettings(appName);
    if (Object.keys(defaults).length > 0) {
      allDefaults[appName] = defaults;
    }
  });
  
  return allDefaults;
}

// Helper to read config, creating it from defaults if it doesn't exist
function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      
      // Handle potentially empty file
      if (data.trim() === '') {
        console.warn(`Config file ${CONFIG_FILE} is empty. Creating with defaults.`);
        const defaultSettings = getAllDefaultSettings();
        writeConfig(defaultSettings);
        return defaultSettings;
      }
      
      let parsedData = JSON.parse(data);
      
      // Remove legacy sections if present
      if (parsedData.global) delete parsedData.global;
      
      return parsedData;
    } else {
      // Create file with defaults if it doesn't exist
      console.log(`Config file ${CONFIG_FILE} not found. Creating with defaults.`);
      const defaultSettings = getAllDefaultSettings();
      writeConfig(defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error reading or parsing config file:', error);
    // Fallback to defaults in case of error
    return getAllDefaultSettings();
  }
}

// Helper to write config
function writeConfig(config: Record<string, any>) {
  try {
    const configDir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing config file:', error);
    return false;
  }
}

// GET settings
router.get('/', (req, res) => {
  const config = readConfig();
  res.json(config);
});

// POST update settings
router.post('/', (req, res) => {
  try {
    const newSettings = req.body;
    
    // Read current config to merge
    const existingConfig = readConfig();
    
    // Merge settings
    const updatedConfig = {
      ...existingConfig,
      ...newSettings
    };
    
    // Handle app-specific settings
    for (const appName in newSettings) {
      if (existingConfig[appName] && typeof newSettings[appName] === 'object') {
        updatedConfig[appName] = {
          ...existingConfig[appName],
          ...newSettings[appName]
        };
      }
    }
    
    // Write updated config
    const success = writeConfig(updatedConfig);
    
    if (success) {
      // Return the exact config that was saved to ensure UI consistency
      res.json(readConfig());
    } else {
      res.status(500).json({ success: false, error: 'Failed to save settings' });
    }
  } catch (error) {
    console.error('Error processing settings:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST reset settings
router.post('/reset', (req, res) => {
  try {
    const defaultSettings = getAllDefaultSettings();
    const success = writeConfig(defaultSettings);
    
    if (success) {
      res.json({ success: true, message: 'Settings reset to defaults' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to reset settings' });
    }
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
