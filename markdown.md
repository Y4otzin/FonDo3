He creado un script setup.sh que automatiza todo el proceso descrito en tu plan: desde la creación de la estructura de carpetas y archivos hasta la descarga de assets, generación de iconos, configuración de Git y despliegue en GitHub Pages.

🚀 Script de configuración completo

```bash
#!/bin/bash

# ----------------------------------------------------------------------
# Script: setup.sh
# Descripción: Configuración completa del proyecto "Fondo 3D Responsivo"
#              Crea estructura, archivos, descarga assets, genera iconos,
#              inicializa Git y prepara el despliegue.
# Uso: chmod +x setup.sh && ./setup.sh
# ----------------------------------------------------------------------

set -e  # Detener en caso de error

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin Color

# Función para imprimir títulos
print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

# Función para imprimir éxito
print_ok() {
    echo -e "${GREEN}✔ $1${NC}"
}

# Función para imprimir advertencia
print_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Función para imprimir error y salir
print_error() {
    echo -e "${RED}✖ $1${NC}"
    exit 1
}

# ----------------------------------------------------------------------
# 1. Configuración inicial
# ----------------------------------------------------------------------
print_step "Configurando proyecto..."

PROJECT_DIR="fondo3d-app"
if [ -d "$PROJECT_DIR" ]; then
    print_warn "El directorio '$PROJECT_DIR' ya existe. Se eliminará y recreará."
    rm -rf "$PROJECT_DIR"
fi

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

mkdir -p assets assets/icons src .vscode .github/workflows

print_ok "Estructura de carpetas creada."

# ----------------------------------------------------------------------
# 2. Creación de archivos de configuración de VS Code
# ----------------------------------------------------------------------
print_step "Creando configuración de VS Code..."

cat > .vscode/settings.json <<EOF
{
    "liveServer.settings.port": 5500,
    "liveServer.settings.host": "localhost",
    "editor.formatOnSave": true,
    "html.format.indentInnerHtml": true
}
EOF

print_ok ".vscode/settings.json creado."

# ----------------------------------------------------------------------
# 3. Creación de index.html
# ----------------------------------------------------------------------
print_step "Creando index.html..."

cat > index.html <<'EOF'
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
EOF

print_ok "index.html creado."

# ----------------------------------------------------------------------
# 4. Creación de style.css
# ----------------------------------------------------------------------
print_step "Creando style.css..."

cat > style.css <<'EOF'
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
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 14px;
    z-index: 10;
    transition: opacity 1s;
}

#install-btn {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 5px;
}
EOF

print_ok "style.css creado."

# ----------------------------------------------------------------------
# 5. Creación de script.js
# ----------------------------------------------------------------------
print_step "Creando script.js..."

cat > script.js <<'EOF'
document.addEventListener('DOMContentLoaded', () => {
    const layers = document.querySelectorAll('.layer');
    const info = document.querySelector('.info');
    const installBtn = document.getElementById('install-btn');

    // --- Manejo de orientación ---
    function addOrientationListener() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ requiere permiso explícito
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    } else {
                        console.warn('Permiso de orientación denegado.');
                    }
                })
                .catch(err => console.error('Error solicitando permiso:', err));
        } else {
            // Android y otros navegadores
            window.addEventListener('deviceorientation', handleOrientation);
        }
    }

    function handleOrientation(event) {
        const { gamma, beta } = event;
        // gamma: izquierda/derecha (-90 a 90), beta: adelante/atrás (-180 a 180)
        const xAxis = (gamma || 0) / 90 * 15;   // -15 a 15 grados
        const yAxis = (beta || 0) / 180 * 15;   // -15 a 15 grados

        layers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0.5;
            const xPos = xAxis * speed;
            const yPos = yAxis * speed;

            // Mantener la transformación actual (translateZ) y añadir rotación
            const currentTransform = layer.style.transform || '';
            const translateZMatch = currentTransform.match(/translateZ\(([^)]+)\)/);
            const translateZ = translateZMatch ? translateZMatch[1] : '0px';

            layer.style.transform = `translateZ(${translateZ}) rotateY(${xPos}deg) rotateX(${yPos}deg)`;
        });
    }

    // --- Iniciar ---
    addOrientationListener();

    // Ocultar información después de 5 segundos
    setTimeout(() => {
        info.style.opacity = '0';
        setTimeout(() => info.style.display = 'none', 1000);
    }, 5000);

    // --- PWA: Instalación ---
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'inline-block';
    });

    installBtn.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(choice => {
                if (choice.outcome === 'accepted') {
                    console.log('Instalación aceptada');
                } else {
                    console.log('Instalación rechazada');
                }
                deferredPrompt = null;
                installBtn.style.display = 'none';
            });
        }
    });

    // --- Service Worker ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado:', reg))
            .catch(err => console.log('Error al registrar SW:', err));
    }
});
EOF

print_ok "script.js creado."

# ----------------------------------------------------------------------
# 6. Creación de service worker (sw.js)
# ----------------------------------------------------------------------
print_step "Creando service worker (sw.js)..."

cat > sw.js <<'EOF'
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
            .catch(err => console.error('Error caching assets:', err))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
            .catch(() => new Response('Offline', { status: 503 }))
    );
});

// Limpiar cachés antiguas al activar
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
});
EOF

print_ok "sw.js creado."

# ----------------------------------------------------------------------
# 7. Creación de manifest.json
# ----------------------------------------------------------------------
print_step "Creando manifest.json..."

cat > manifest.json <<EOF
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
EOF

print_ok "manifest.json creado."

# ----------------------------------------------------------------------
# 8. Creación de README.md
# ----------------------------------------------------------------------
print_step "Creando README.md..."

cat > README.md <<'EOF'
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
EOF

print_ok "README.md creado."

# ----------------------------------------------------------------------
# 9. Descarga de imagen de fondo
# ----------------------------------------------------------------------
print_step "Descargando imagen de fondo..."

IMAGE_URL="https://z-cdn-media.chatglm.cn/files/75ed839c-6076-420f-bb4b-f56b347c7216_entrada.jpg?auth_key=1793149263-6646d6bc1420427f87abe4553dae7416-0-081f0c6153cbc37036c9cfd2f25c2fde"
IMAGE_PATH="assets/entrada.jpg"

if command -v curl &> /dev/null; then
    curl -L -o "$IMAGE_PATH" "$IMAGE_URL"
elif command -v wget &> /dev/null; then
    wget -O "$IMAGE_PATH" "$IMAGE_URL"
else
    print_error "No se encontró curl ni wget. Instala uno de ellos para descargar la imagen."
fi

if [ -f "$IMAGE_PATH" ]; then
    print_ok "Imagen descargada correctamente ($IMAGE_PATH)."
else
    print_error "Error al descargar la imagen. Verifica la URL o la conexión."
fi

# ----------------------------------------------------------------------
# 10. Generación de iconos con ImageMagick
# ----------------------------------------------------------------------
print_step "Generando iconos (192x192 y 512x512)..."

if ! command -v convert &> /dev/null; then
    print_warn "ImageMagick (convert) no está instalado. Intentando instalar..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y imagemagick
        elif command -v yum &> /dev/null; then
            sudo yum install -y ImageMagick
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y ImageMagick
        else
            print_error "No se pudo instalar ImageMagick automáticamente. Instálalo manualmente."
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install imagemagick
        else
            print_error "Instala Homebrew o ImageMagick manualmente."
        fi
    else
        print_error "Sistema operativo no soportado para instalación automática. Instala ImageMagick manualmente."
    fi
fi

# Verificar nuevamente
if command -v convert &> /dev/null; then
    convert "$IMAGE_PATH" -resize 192x192 assets/icons/icon-192.png
    convert "$IMAGE_PATH" -resize 512x512 assets/icons/icon-512.png
    print_ok "Iconos generados en assets/icons/"
else
    print_error "ImageMagick no disponible. No se pudieron generar los iconos."
fi

# ----------------------------------------------------------------------
# 11. Configuración de Git y GitHub
# ----------------------------------------------------------------------
print_step "Inicializando repositorio Git..."

git init
git add .
git commit -m "Initial commit: Fondo 3D responsivo" || print_warn "No hay cambios para commitear."

print_ok "Repositorio Git inicializado localmente."

# ----------------------------------------------------------------------
# 12. Creación de GitHub Actions workflow
# ----------------------------------------------------------------------
print_step "Creando workflow de GitHub Actions..."

cat > .github/workflows/deploy.yml <<'EOF'
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

    - name: Build (static site)
      run: echo "No build step required"

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: .
EOF

print_ok ".github/workflows/deploy.yml creado."

# ----------------------------------------------------------------------
# 13. Mensaje final
# ----------------------------------------------------------------------
echo ""
echo -e "${GREEN}===============================================${NC}"
echo -e "${GREEN}🎉 Proyecto 'Fondo 3D Responsivo' configurado con éxito.${NC}"
echo -e "${GREEN}===============================================${NC}"
echo ""
echo "Siguientes pasos:"
echo "  1. Conectar con repositorio remoto:"
echo "     git remote add origin https://github.com/tu-usuario/fondo3d-app.git"
echo "     git branch -M main"
echo "     git push -u origin main"
echo ""
echo "  2. Activar GitHub Pages:"
echo "     - Ve a Settings > Pages"
echo "     - Source: Deploy from a branch, rama 'main', carpeta '/ (root)'"
echo ""
echo "  3. Probar localmente:"
echo "     (Si tienes live-server instalado) ejecuta: live-server --port=5500"
echo "     O abre index.html en tu navegador."
echo ""
echo "  4. Para probar en dispositivos móviles, accede a la IP local."
echo ""
echo "¡Disfruta de tu fondo 3D responsivo! 🚀"
```

---

📦 Instrucciones de uso

1. Guarda el script en un archivo, por ejemplo setup.sh.
2. Dale permisos de ejecución:
   ```bash
   chmod +x setup.sh
   ```
3. Ejecútalo:
   ```bash
   ./setup.sh
   ```
4. Sigue las indicaciones finales para conectar con GitHub y desplegar.

---

🔧 Notas

· El script descarga la imagen mediante curl o wget.
· Si no tienes ImageMagick, intenta instalarlo automáticamente (en sistemas basados en Debian, Red Hat o macOS con Homebrew).
· Todos los archivos se crean en la carpeta fondo3d-app/.
· Los iconos se generan a partir de la imagen descargada.

¡Listo para usar!