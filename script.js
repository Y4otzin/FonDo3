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