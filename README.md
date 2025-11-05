# 🎵 Spotify Music Explorer

Una aplicación web moderna que consume la API de Spotify para explorar música, construida con arquitectura MVC y diseño responsive.

## 📋 Características

- 🔍 **Búsqueda de música**: Busca canciones, artistas y álbumes
- 🎧 **Reproductor integrado**: Reproduce vistas previas de canciones
- 📱 **Diseño responsive**: Funciona perfectamente en dispositivos móviles y desktop
- 🎨 **Interfaz moderna**: Diseño inspirado en Spotify con gradientes y efectos visuales
- ⚡ **Rendimiento optimizado**: Carga rápida y eficiente
- 🔄 **Datos mock**: Funciona incluso sin conexión a la API de Spotify
- ⌨️ **Atajos de teclado**: Controles rápidos para mejor experiencia de usuario

## 🏗️ Arquitectura MVC

La aplicación está construida siguiendo el patrón de arquitectura Modelo-Vista-Controlador:

```
musica/
├── index.html                 # Vista principal
├── assets/
│   ├── css/
│   │   └── styles.css        # Estilos y diseño responsive
│   └── js/
│       ├── models/
│       │   └── SpotifyModel.js      # Modelo de datos y API
│       ├── views/
│       │   └── MusicView.js         # Vista y UI
│       ├── controllers/
│       │   └── MusicController.js   # Lógica de la aplicación
│       └── app.js                   # Inicialización
└── README.md               # Documentación
```

### Modelo (SpotifyModel.js)
- Maneja la comunicación con la API de Spotify
- Gestiona la autenticación y tokens
- Proporciona datos mock cuando la API no está disponible
- Métodos principales:
  - `getAccessToken()`: Obtiene token de acceso
  - `searchTracks(query)`: Busca canciones
  - `getFeaturedPlaylists()`: Obtiene playlists destacadas
  - `getNewReleases()`: Obtiene nuevos lanzamientos

### Vista (MusicView.js)
- Gestiona todos los elementos del DOM
- Maneja la interacción del usuario
- Controla el reproductor de audio
- Métodos principales:
  - `displaySongs(songs)`: Muestra canciones en la interfaz
  - `showTrackDetails(song)`: Muestra detalles de la canción
  - `playAudio(previewUrl)`: Reproduce vista previa
  - `bindSearchHandler(handler)`: Conecta búsqueda con controlador

### Controlador (MusicController.js)
- Coordina entre modelo y vista
- Maneja la lógica de la aplicación
- Procesa errores y excepciones
- Métodos principales:
  - `loadFeaturedSongs()`: Carga canciones destacadas
  - `handleSearch(query)`: Procesa búsquedas
  - `playTrack(id, name, artist, image)`: Reproduce una canción

## 🚀 Configuración y Uso

### 1. Clonar o descargar el proyecto

### 2. Configurar credenciales de Spotify (Opcional)
Para usar la API real de Spotify, necesitas:

1. Crear una cuenta en [Spotify Developer](https://developer.spotify.com/)
2. Crear una nueva aplicación
3. Obtener tu **Client ID** y **Client Secret**
4. Actualizar el archivo `assets/js/models/SpotifyModel.js`:

```javascript
constructor() {
    this.clientId = 'TU_CLIENT_ID_AQUI';
    this.clientSecret = 'TU_CLIENT_SECRET_AQUI';
    // ... resto del código
}
```

### 3. Abrir la aplicación
Simplemente abre el archivo `index.html` en tu navegador web preferido.

**Nota**: Si no configuras las credenciales de Spotify, la aplicación funcionará con datos mock de demostración.

## 🎮 Controles y Atajos de Teclado

| Atajo | Función |
|-------|---------|
| `Ctrl/Cmd + K` | Enfocar barra de búsqueda |
| `Escape` | Limpiar búsqueda |
| `Espacio` | Reproducir/Pausar canción actual |

## 📱 Uso de la Interfaz

### Búsqueda de Música
1. Escribe el nombre de una canción, artista o álbum en la barra de búsqueda
2. Presiona Enter o haz clic en el botón de búsqueda
3. Los resultados aparecerán en la sección de resultados

### Reproducción de Canciones
1. Haz clic en el botón "Reproducir" en cualquier tarjeta de canción
2. La canción aparecerá en el reproductor inferior
3. Usa los controles de reproducción para reproducir/pausar

**Nota**: Algunas canciones pueden no tener vista previa disponible debido a restricciones de Spotify.

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con flexbox y grid
- **JavaScript ES6+**: Programación orientada a objetos
- **Font Awesome**: Iconos y símbolos
- **Spotify Web API**: Fuente de datos musical

## 🌐 Compatibilidad

- ✅ Chrome (versión 60+)
- ✅ Firefox (versión 55+)
- ✅ Safari (versión 11+)
- ✅ Edge (versión 79+)
- ✅ Opera (versión 47+)
- ✅ Navegadores móviles modernos

## 📝 Notas Importantes

### Sobre la API de Spotify
- La aplicación utiliza el flujo de **Client Credentials** para autenticación
- Algunas canciones pueden no tener vistas previas disponibles
- Hay un límite de peticiones a la API (rate limiting)
- Para uso en producción, considera implementar caché y manejo de errores avanzado

### Datos Mock
- Si no se configuran credenciales o la API falla, se usan datos de demostración
- Los datos mock incluyen canciones, artistas y álbumes de ejemplo
- Esto garantiza que la aplicación siempre funcione, incluso sin conexión

## 🤝 Contribuciones

Si deseas contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🐛 Reporte de Bugs

Si encuentras algún error:

1. Verifica que has configurado correctamente las credenciales de Spotify
2. Abre la consola del navegador (F12) y copia cualquier error
3. Reporta el error incluyendo:
   - Descripción del problema
   - Pasos para reproducirlo
   - Mensajes de error de la consola
   - Navegador y sistema operativo utilizados

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo y personal.

## 🙏 Agradecimientos

- [Spotify](https://developer.spotify.com/) por proporcionar la API
- [Font Awesome](https://fontawesome.com/) por los iconos
- Comunidad de desarrolladores web por recursos y tutoriales

---

**Desarrollado con ❤️ y 🎵**