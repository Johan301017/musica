# 🔧 Guía de Configuración - Spotify Music Explorer

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:
- Una cuenta de Spotify (gratuita)
- Conexión a internet
- Navegador web moderno

## 🎯 Paso a Paso: Configuración de la API de Spotify

### Paso 1: Crear una Cuenta de Desarrollador en Spotify

1. **Visita el sitio de Spotify Developers**
   - Abre tu navegador y ve a: https://developer.spotify.com/
   - Haz clic en "Log In" (Iniciar Sesión)

2. **Inicia sesión con tu cuenta de Spotify**
   - Usa tu cuenta de Spotify existente o crea una nueva
   - Si no tienes cuenta, regístrate gratis en https://www.spotify.com/

### Paso 2: Crear una Nueva Aplicación

1. **Accede al Dashboard**
   - Una vez logueado, ve a: https://developer.spotify.com/dashboard
   - Haz clic en el botón "CREATE AN APP" (CREAR UNA APLICACIÓN)

2. **Completa el formulario**
   - **App name**: "Music Explorer" (o el nombre que prefieras)
   - **App description**: "Aplicación web para explorar música con Spotify API"
   - **Redirect URI**: Puedes dejarlo vacío por ahora o usar: `http://localhost:8080/callback`
   - Marca las casillas de aceptación de términos
   - Haz clic en "CREATE"

### Paso 3: Obtener tus Credenciales

1. **Encuentra tus credenciales**
   - En la página de tu aplicación, verás:
     - **Client ID** (ID del Cliente)
     - **Client Secret** (Secreto del Cliente)

2. **Copia las credenciales**
   - Haz clic en "SHOW CLIENT SECRET" para revelar el secreto
   - Copia AMBOS valores en un lugar seguro
   - ⚠️ **Importante**: Nunca compartas tu Client Secret públicamente

### Paso 4: Configurar la Aplicación

1. **Abre el archivo de configuración**
   - Navega hasta: `assets/js/models/SpotifyModel.js`
   - Encuentra las líneas:

```javascript
constructor() {
    this.clientId = 'YOUR_CLIENT_ID'; // Reemplazar con tu Client ID de Spotify
    this.clientSecret = 'YOUR_CLIENT_SECRET'; // Reemplazar con tu Client Secret
    // ... resto del código
}
```

2. **Actualiza con tus credenciales**
   - Reemplaza `'YOUR_CLIENT_ID'` con tu Client ID real
   - Reemplaza `'YOUR_CLIENT_SECRET'` con tu Client Secret real
   - Ejemplo:

```javascript
constructor() {
    this.clientId = 'a1b2c3d4e5f6g7h8i9j0';
    this.clientSecret = 'k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';
    // ... resto del código
}
```

### Paso 5: Guardar y Probar

1. **Guarda los cambios**
   - Guarda el archivo `SpotifyModel.js`

2. **Abre la aplicación**
   - Abre `index.html` en tu navegador
   - La aplicación ahora debería usar datos reales de Spotify

3. **Verifica el funcionamiento**
   - Busca una canción conocida
   - Si ves resultados reales de Spotify, ¡la configuración fue exitosa!

## 🚨 Solución de Problemas Comunes

### Error: "Invalid Client"
**Causa**: Client ID incorrecto
**Solución**: Verifica que copiaste correctamente el Client ID

### Error: "Invalid Client Secret"
**Causa**: Client Secret incorrecto
**Solución**: 
- Verifica que copiaste el Client Secret completo
- Asegúrate de no incluir espacios extras

### Error: "Rate Limiting"
**Causa**: Demasiadas peticiones a la API
**Solución**: 
- Espera unos minutos antes de hacer más peticiones
- La aplicación automáticamente usa datos mock si esto ocurre

### Error de Red
**Causa**: Problemas de conexión
**Solución**: 
- Verifica tu conexión a internet
- La aplicación funcionará con datos mock offline

## 🔒 Seguridad y Mejores Prácticas

### En Desarrollo Local
- ✅ Puedes usar las credenciales directamente en el código
- ✅ No hay problema en compartir el Client ID
- ⚠️ **NUNCA** compartas el Client Secret públicamente

### En Producción
- 🔒 Usa variables de entorno para las credenciales
- 🔒 Implementa un servidor backend para manejar la autenticación
- 🔒 Considera usar OAuth 2.0 con flujo de autorización
- 🔒 Implementa límites de tasa (rate limiting)

### Ejemplo de Configuración Segura para Producción
```javascript
// En lugar de hardcodear, usa variables de entorno
constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
}
```

## 📊 Límites de la API

- **Peticiones por segundo**: 10-20 peticiones
- **Peticiones por hora**: Varía según el endpoint
- **Datos de respuesta**: Máximo 50 items por página
- **Vistas previas**: No todas las canciones tienen preview disponible

## 🎵 Funcionalidades Disponibles

Con tu configuración podrás:
- ✅ Buscar millones de canciones
- ✅ Ver álbumes y carátulas reales
- ✅ Escuchar vistas previas (30 segundos)
- ✅ Explorar playlists públicas
- ✅ Ver información de artistas
- ✅ Acceder a nuevos lanzamientos

## ❌ Limitaciones

- ❌ No puedes reproducir canciones completas
- ❌ No puedes descargar música
- ❌ No puedes acceder a playlists privadas
- ❌ No puedes modificar perfiles de usuario
- ❌ Algunas canciones no tienen preview disponible

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas con la configuración:

1. **Verifica los pasos**: Revisa que seguiste todos los pasos
2. **Comprueba las credenciales**: Asegúrate de copiarlas correctamente
3. **Consulta la documentación**: https://developer.spotify.com/documentation/
4. **Prueba con datos mock**: La aplicación funcionará sin configuración

## 📚 Recursos Adicionales

- [Documentación oficial de Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Guía de autenticación](https://developer.spotify.com/documentation/general/guides/authorization/)
- [Endpoints de la API](https://developer.spotify.com/documentation/web-api/reference/)
- [Límites y mejores prácticas](https://developer.spotify.com/documentation/general/guides/usage-and-billing/)

---

**¡Listo!** Con estos pasos tu aplicación Music Explorer estará conectada a la API real de Spotify. 🎵