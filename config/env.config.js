const production = {
    appName: 'Generador de QR', // Nombre de la aplicación html - title
    appBaseDir: '/generate-list-qr', // Directorio de despliegue de la aplicación
    rootUrl: '../../../', // Url del servidor del api
    baseUrl: '../../../', //Url del apí por default
  }
    
  const development = {
    ...production, // spread,
    rootUrl: `http://localhost:3000/`,
    baseUrl: `http://localhost:3000/generate-list-qr/`
  }
  
  export default {
    development,
    production
  }