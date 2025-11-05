// Inicialización de la aplicación Music Explorer
let musicController;

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Inicializar el modelo, vista y controlador
        const model = new SpotifyModel();
        const view = new MusicView();
        musicController = new MusicController(model, view);
        
        console.log('🎵 Spotify Music Explorer iniciado correctamente');
        
        // Agregar algunas funciones de utilidad al objeto window para debugging
        window.musicApp = {
            controller: musicController,
            model: model,
            view: view,
            stats: () => musicController.getStats(),
            refresh: () => musicController.refreshData(),
            clearSearch: () => musicController.clearSearch()
        };
        
    } catch (error) {
        console.error('❌ Error al iniciar la aplicación:', error);
        alert('Error al cargar la aplicación. Por favor, recarga la página.');
    }
});

// Manejo de errores global
window.addEventListener('error', (event) => {
    console.error('Error global capturado:', event.error);
    
    // Mostrar mensaje de error amigable al usuario
    if (event.error.message && event.error.message.includes('Spotify')) {
        // No mostrar alerta para errores de Spotify, ya que el modelo maneja datos mock
        console.log('Error de Spotify manejado automáticamente con datos de respaldo');
    } else {
        // Para otros errores, mostrar notificación
        showNotification('Ha ocurrido un error en la aplicación', 'error');
    }
});

// Manejo de errores de promesas no capturadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada no manejada:', event.reason);
    showNotification('Error en la aplicación', 'error');
});

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación si no existe
    let notification = document.getElementById('app-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'app-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(notification);
    }
    
    // Establecer color según el tipo
    const colors = {
        info: '#1db954',
        error: '#ff6b6b',
        warning: '#ffa726',
        success: '#4caf50'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    // Mostrar notificación
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
    }, 3000);
}

// Atajos de teclado
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + K para enfocar búsqueda
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // Escape para limpiar búsqueda
    if (event.key === 'Escape') {
        if (musicController) {
            musicController.clearSearch();
        }
    }
    
    // Espacio para reproducir/pausar
    if (event.key === ' ' && !event.target.matches('input')) {
        event.preventDefault();
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (pauseBtn.style.display !== 'none') {
            pauseBtn.click();
        } else if (playBtn) {
            playBtn.click();
        }
    }
});

// Detectar cambios de conexión
window.addEventListener('online', () => {
    showNotification('Conexión restablecida', 'success');
    if (musicController) {
        musicController.refreshData();
    }
});

window.addEventListener('offline', () => {
    showNotification('Sin conexión a internet. Usando datos locales', 'warning');
});

// Service Worker para funcionalidad offline (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('ServiceWorker registrado:', registration);
            })
            .catch((error) => {
                console.log('Registro de ServiceWorker fallido:', error);
            });
    });
}