

```markdown
# Plan Completo: Agente VS Code para Fondo 3D Responsivo

## 1. Configuración Inicial del Proyecto

### 1.1 Crear Estructura de Carpetas
```bash
mkdir fondo3d-app && cd fondo3d-app
mkdir assets assets/icons src
touch index.html style.css script.js manifest.json sw.js README.md
```

### 1.2 Configurar VS Code
```json
// .vscode/settings.json
{
    "liveServer.settings.port": 5500,
    "liveServer.settings.host": "localhost",
    "editor.formatOnSave": true,
    "html.format.indentInnerHtml": true
}
```

## 2. Desarrollo del Proyecto

### 2.1 HTML Base (index.html)
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Fondo 3D Responsivo</title>
    <link rel="stylesheet" href="style.css">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#000000">
    <link rel="apple-touch-icon" href="assets/icons/icon-192.png">
</head>
<body>
    <div class="parallax-container">
        <div class="layer layer-1" data-speed="0.2"></div>
        <div class="layer layer-2" data-speed="0.5"></div>
        <div class="layer layer-3" data-speed="1"></div>
    </div>
    
    <div class="info">
        <p>Mueve tu dispositivo para ver el efecto 3D</p>
        <button id="install-btn" style="display:none;">Instalar App</button>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

### 2.2 Estilos CSS (style.css)
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body, html {
    height: 100%;
    overflow: hidden;
    font-family: Arial, sans-serif;
}

.parallax-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    perspective: 1000px;
    overflow: hidden;
}

.layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    will-change: transform;
    transition: transform 0.1s ease-out;
}

.layer-1 {
    background-image: url('assets/entrada.jpg');
    transform: translateZ(-300px) scale(1.3);
}

.layer-2 {
    background-image: url('assets/entrada.jpg');
    transform: translateZ(-150px) scale(1.15);
    clip-path: polygon(0% 15%, 100% 0%, 100% 85%, 0% 100%);
}

.layer-3 {
    background-image: url('assets/entrada.jpg');
    transform: translateZ(0) scale(1);
    clip-path: polygon(0% 30%, 100% 20%, 100% 70%, 0% 80%);
}

.info {
    position: absolute;
    bottom: 20px;
    left: 20px;
    color: white;
    background: rgba(0, 0, 0, 0.5);
    padding: 10px;
    border-radius: 5px;
    font-size: 14px;
    z-index: 10;
    transition: opacity 1s;
}
```

### 2.3 Lógica JavaScript (script.js)
```javascript
document.addEventListener('DOMContentLoaded', () => {
    const parallaxContainer = document.querySelector('.parallax-container');
    const layers = document.querySelectorAll('.layer');
    
    // Solicitar permiso para orientación del dispositivo
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    addOrientationListener();
                }
            })
            .catch(console.error);
    } else {
        addOrientationListener();
    }
    
    function addOrientationListener() {
        window.addEventListener('deviceorientation', handleOrientation);
    }
    
    function handleOrientation(event) {
        const { gamma, beta } = event;
        const xAxis = gamma / 90 * 15; // -15 a 15 grados
        const yAxis = beta / 180 * 15;  // -15 a 15 grados
        
        layers.forEach(layer => {
            const speed = layer.getAttribute('data-speed');
            const xPos = xAxis * speed;
            const yPos = yAxis * speed;
            
            const currentTransform = layer.style.transform;
            const translateZMatch = currentTransform.match(/translateZ\(([^)]+)\)/);
            const translateZValue = translateZMatch ? translateZMatch[1] : '0px';
            
            layer.style.transform = `translateZ(${translateZValue}) rotateY(${xPos}deg) rotateX(${yPos}deg)`;
        });
    }
    
    // Ocultar información después de unos segundos
    const info = document.querySelector('.info');
    setTimeout(() => {
        info.style.opacity = '0';
        setTimeout(() => info.style.display = 'none', 1000);
    }, 5000);
    
    // Configurar instalación de PWA
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'block';
    });

    installBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') console.log('Instalación aceptada');
            deferredPrompt = null;
            installBtn.style.display = 'none';
        });
    });
    
    // Registrar service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado:', reg))
            .catch(err => console.log('Error SW:', err));
    }
});
```

### 2.4 Service Worker (sw.js)
```javascript
const CACHE_NAME = 'fondo3d-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './assets/entrada.jpg',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
```

### 2.5 Web App Manifest (manifest.json)
```json
{
  "name": "Fondo 3D Responsivo",
  "short_name": "Fondo3D",
  "description": "Fondo de pantalla 3D responsivo al movimiento",
  "start_url": "./",
  "display": "fullscreen",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 3. Preparación de Assets

### 3.1 Descargar Imagen
```bash
# Descargar la imagen original
curl -o assets/entrada.jpg "https://z-cdn-media.chatglm.cn/files/75ed839c-6076-420f-bb4b-f56b347c7216_entrada.jpg?auth_key=1793149263-6646d6bc1420427f87abe4553dae7416-0-081f0c6153cbc37036c9cfd2f25c2fde"
```

### 3.2 Crear Iconos
```bash
# Instalar ImageMagick (si no está instalado)
# sudo apt-get install imagemagick

# Crear iconos
convert assets/entrada.jpg -resize 192x192 assets/icons/icon-192.png
convert assets/entrada.jpg -resize 512x512 assets/icons/icon-512.png
```

## 4. Configuración de Git y GitHub

### 4.1 Inicializar Repositorio
```bash
git init
git add .
git commit -m "Initial commit: Fondo 3D responsivo"
git branch -M main
```

### 4.2 Conectar con GitHub
```bash
git remote add origin https://github.com/tu-usuario/fondo3d-app.git
git push -u origin main
```

## 5. Configuración de GitHub Pages

### 5.1 Activar GitHub Pages
1. Ir a la configuración del repositorio
2. Seleccionar "Pages" en el menú izquierdo
3. En "Source", seleccionar "Deploy from a branch"
4. Elegir rama "main" y directorio "/ (root)"
5. Hacer clic en "Save"

### 5.2 Verificar Despliegue
- La aplicación estará disponible en: `https://tu-usuario.github.io/fondo3d-app`

## 6. Automatización con GitHub Actions

### 6.1 Crear Flujo de Trabajo
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: echo "No build step required for static site"
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: .
```

## 7. Pruebas y Depuración

### 7.1 Pruebas Locales
```bash
# Instalar live-server
npm install -g live-server

# Iniciar servidor local
live-server --port=5500 --host=localhost
```

### 7.2 Pruebas en Dispositivos Móviles
1. Conectar dispositivo a la misma red
2. Acceder a `http://[tu-ip-local]:5500`
3. Probar el efecto 3D moviendo el dispositivo

### 7.3 Herramientas de Depuración
- Chrome DevTools: Modo dispositivo móvil y sensores
- Safari Web Inspector: Para dispositivos iOS
- Errores comunes:
  - Permisos de sensores no concedidos
  - Rutas incorrectas en el service worker
  - Problemas con HTTPS (requerido para PWA)

## 8. Documentación del Proyecto

### 8.1 README.md
```markdown
# Fondo 3D Responsivo

Fondo de pantalla 3D que responde al movimiento del dispositivo.

## Características

- Efecto 3D con múltiples capas de profundidad
- Respuesta al movimiento del dispositivo (giroscopio)
- Instalable como PWA (Progressive Web App)
- Funciona offline gracias al Service Worker
- Diseño responsive para todos los dispositivos

## Demo

[Ver demo en vivo](https://tu-usuario.github.io/fondo3d-app)

## Instalación como PWA

1. Abre la URL de la demo en un navegador móvil compatible (Chrome, Safari, etc.)
2. Verás una opción para "Añadir a pantalla de inicio" o "Instalar"
3. Acepta y la aplicación se instalará en tu dispositivo

## Tecnologías utilizadas

- HTML5
- CSS3 (con transformaciones 3D)
- JavaScript (ES6+)
- Service Workers
- Web App Manifest
- GitHub Pages

## Licencia

MIT
```

## 9. Mantenimiento y Mejoras

### 9.1 Tareas de Mantenimiento
```bash
# Actualizar dependencias
npm update

# Limpiar caché del service worker
# En script.js, cambiar CACHE_NAME a 'fondo3d-cache-v2'
```

### 9.2 Mejoras Futuras
1. Optimización de imágenes (WebP)
2. Efectos de iluminación dinámica
3. Personalización de velocidad de movimiento
4. Soporte para más sensores (acelerómetro)
5. Modo de bajo consumo para dispositivos antiguos

## 10. Checklist de Despliegue

- [ ] Todos los archivos creados y configurados
- [ ] Imagen e iconos optimizados
- [ ] Service Worker funcionando correctamente
- [ ] Manifest configurado para PWA
- [ ] Pruebas locales exitosas
- [ ] Repositorio en GitHub actualizado
- [ ] GitHub Pages activado
- [ ] Flujo de GitHub Actions configurado
- [ ] Pruebas en dispositivos móviles reales
- [ ] Documentación completa (README.md)
- [ ] Aplicación accesible públicamente
```

Este plan completo proporciona una guía detallada para crear un agente de VS Code que automatice la creación de un fondo 3D responsivo, desde la configuración inicial hasta el despliegue en GitHub Pages.
