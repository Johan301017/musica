class MusicController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.init();
    }

    async init() {
        try {
            this.view.showLoading('Cargando canciones populares...');
            await this.loadFeaturedSongs();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error al inicializar el controlador:', error);
            this.view.showError('Error al cargar la aplicación');
        }
    }

    setupEventListeners() {
        this.view.bindSearchHandler(this.handleSearch.bind(this));
        this.view.bindPlayerHandlers();
    }

    async loadFeaturedSongs() {
        try {
            // Intentar obtener playlists destacadas o nuevos lanzamientos
            const songs = await this.model.getFeaturedPlaylists();
            
            // Si no hay canciones, intentar con nuevos lanzamientos
            if (!songs || songs.length === 0) {
                const newReleases = await this.model.getNewReleases();
                this.view.displaySongs(newReleases);
            } else {
                this.view.displaySongs(songs);
            }
        } catch (error) {
            console.error('Error al cargar canciones destacadas:', error);
            // Usar datos mock como respaldo
            const mockData = this.model.getMockData();
            this.view.displaySongs(mockData);
        }
    }

    async handleSearch(query) {
        if (!query || query.trim().length === 0) {
            this.view.hideSearchResults();
            return;
        }

        try {
            this.view.showLoading('Buscando canciones...');
            const results = await this.model.searchTracks(query);
            
            if (results && results.length > 0) {
                this.view.showSearchResults(results);
            } else {
                this.view.showSearchResults([]);
                this.view.searchResultsContainer.innerHTML = '<div class="loading">No se encontraron resultados</div>';
            }
        } catch (error) {
            console.error('Error al buscar canciones:', error);
            this.view.showError('Error al buscar canciones');
        }
    }

    async playTrack(trackId, trackName, artistName, albumImage) {
        try {
            // Obtener detalles completos de la pista
            const trackDetails = await this.model.getTrackDetails(trackId);
            
            if (trackDetails && trackDetails.preview_url) {
                // Mostrar información en el reproductor
                this.view.showTrackDetails(trackDetails);
                
                // Reproducir vista previa
                this.view.playAudio(trackDetails.preview_url);
                
                // Registrar en consola para debugging
                console.log(`Reproduciendo: ${trackName} - ${artistName}`);
            } else {
                // Si no hay preview_url, mostrar mensaje
                alert('Esta canción no tiene vista previa disponible en Spotify');
                
                // Aún así mostrar la información en el reproductor
                this.view.songTitle.textContent = trackName;
                this.view.artistName.textContent = artistName;
                if (albumImage) {
                    this.view.albumArt.innerHTML = `<img src="${albumImage}" alt="${trackName}">`;
                }
            }
        } catch (error) {
            console.error('Error al reproducir la pista:', error);
            alert('Error al reproducir la canción');
        }
    }

    async getRecommendations(seedTracks) {
        try {
            const recommendations = await this.model.getRecommendations(seedTracks);
            return recommendations;
        } catch (error) {
            console.error('Error al obtener recomendaciones:', error);
            return [];
        }
    }

    // Método para manejar errores de forma centralizada
    handleError(error, customMessage = 'Error en la aplicación') {
        console.error(customMessage, error);
        
        // Mostrar mensaje de error al usuario
        if (error.message && error.message.includes('token')) {
            this.view.showError('Error de autenticación con Spotify. Verifica tus credenciales.');
        } else if (error.message && error.message.includes('network')) {
            this.view.showError('Error de conexión. Verifica tu conexión a internet.');
        } else {
            this.view.showError(customMessage);
        }
    }

    // Método para refrescar los datos
    async refreshData() {
        try {
            this.view.showLoading('Actualizando canciones...');
            await this.loadFeaturedSongs();
        } catch (error) {
            this.handleError(error, 'Error al actualizar los datos');
        }
    }

    // Método para limpiar la búsqueda
    clearSearch() {
        this.view.searchInput.value = '';
        this.view.hideSearchResults();
    }

    // Método para obtener estadísticas básicas
    getStats() {
        return {
            totalSongsLoaded: this.view.featuredSongsContainer.children.length,
            currentTrack: this.view.currentTrack,
            searchResults: this.view.searchResultsContainer.children.length
        };
    }
}