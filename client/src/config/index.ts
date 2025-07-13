// Configuration file for environment variables
export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`,
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Smart Bike Dashboard',
  appVersion: import.meta.env.VITE_APP_VERSION || '2.0.2',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Mode
  mode: import.meta.env.MODE,
};

// Validate required environment variables
const requiredEnvVars = ['VITE_API_BASE_URL'];

export const validateEnvVars = () => {
  const missing = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName]
  );
  
  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(', ')}. Using fallback values.`
    );
  }
};

// Call validation on import
validateEnvVars();

export default config;