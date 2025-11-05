class MusicController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.init();
    }

    async init() {
        try {
            // Ya no cargamos canciones populares por defecto
            await this.loadFavoriteArtists();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error al inicializar el controlador:', error);
            this.view.showError('Error al cargar la aplicación');
        }
    }

    setupEventListeners() {
        this.view.bindSearchHandler(this.handleSearch.bind(this));
        this.view.bindPlayerHandlers();
        this.view.onToggleFavorite = this.toggleFavoriteArtist.bind(this);
        this.view.onShowTrackInfo = this.showTrackInfo.bind(this);
        this.view.onArtistClick = this.searchByArtistName.bind(this);
        const homeBtn = document.getElementById('homeBtn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => this.goHome());
        }
        const fabHome = document.getElementById('fabHome');
        if (fabHome) {
            fabHome.addEventListener('click', () => this.goHome());
        }
        const refreshPopularBtn = document.getElementById('refreshPopularBtn');
        if (refreshPopularBtn) {
            refreshPopularBtn.addEventListener('click', async () => {
                try {
                    this.view.showLoading('Cargando canciones populares...');
                    await this.loadFeaturedSongs();
                } catch (_) {}
            });
        }
    }

    async loadFeaturedSongs() {
        try {
            // Cargar canciones populares desde playlist curada
            const popularTracks = await this.model.getPopularTracks();
            if (popularTracks && popularTracks.length > 0) {
                this.view.displaySongs(popularTracks);
            } else {
                const fallback = this.model.getMockPopularTracks();
                this.view.displaySongs(fallback);
                if (typeof showNotification === 'function') {
                    showNotification('Mostrando canciones de ejemplo', 'warning');
                }
            }
        } catch (error) {
            console.error('Error al cargar canciones destacadas:', error);
            // Usar datos mock como respaldo
            const mockData = this.model.getMockPopularTracks();
            this.view.displaySongs(mockData);
            if (typeof showNotification === 'function') {
                showNotification('No se pudo cargar Spotify. Mostrando ejemplo', 'warning');
            }
        }
    }

    async loadFavoriteArtists() {
        try {
            const ids = this.getStoredFavoriteArtistIds();
            let artists = [];
            if (ids.length > 0) {
                // Cargar cada artista por ID
                const fetched = await Promise.all(ids.map(id => this.model.getArtistById(id)));
                artists = fetched.filter(Boolean);
            }
            // Si no hay favoritos, mostrar mensaje
            if (artists.length === 0) {
                this.view.displayArtists([]);
            } else {
                this.view.displayArtists(artists);
            }
        } catch (error) {
            console.error('Error al cargar artistas favoritos:', error);
            const ids = this.getStoredFavoriteArtistIds();
            if (ids.length === 0) {
                this.view.displayArtists([]);
            }
        }
    }

    // Favoritos: almacenamiento y gestión
    getStoredFavoriteArtistIds() {
        try {
            const raw = localStorage.getItem('favoriteArtistIds') || '[]';
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : [];
        } catch (_) {
            return [];
        }
    }

    saveFavoriteArtistIds(ids) {
        try {
            localStorage.setItem('favoriteArtistIds', JSON.stringify(ids));
        } catch (_) {}
    }

    async toggleFavoriteArtist(artistId, starBtn) {
        if (!artistId) return;
        
        const ids = this.getStoredFavoriteArtistIds();
        const index = ids.indexOf(artistId);
        
        try {
            if (index > -1) {
                // Quitar de favoritos
                ids.splice(index, 1);
                starBtn.classList.remove('active');
            } else {
                // Agregar a favoritos
                const artist = await this.model.getArtistById(artistId);
                if (!artist) {
                    alert('No se pudo obtener información del artista');
                    return;
                }
                ids.push(artistId);
                starBtn.classList.add('active');
            }
            
            this.saveFavoriteArtistIds(ids);
            
            // Actualizar todas las estrellas en la página
            document.querySelectorAll(`.favorite-star[data-artist-id="${artistId}"]`).forEach(btn => {
                if (index > -1) {
                    btn.classList.remove('active');
                } else {
                    btn.classList.add('active');
                }
            });
            
            await this.loadFavoriteArtists();
        } catch (error) {
            console.error('Error al toggle favorito:', error);
            alert('Error al actualizar favoritos');
        }
    }

    async showTrackInfo(trackId) {
        try {
            const trackDetails = await this.model.getTrackDetails(trackId);
            if (trackDetails) {
                this.view.showTrackInfoModal(trackDetails);
            } else {
                alert('No se pudo cargar la información de la canción');
            }
        } catch (error) {
            console.error('Error al mostrar info de canción:', error);
            alert('Error al cargar información');
        }
    }

    goHome() {
        try {
            this.clearSearch();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error al volver a inicio:', error);
        }
    }

    // Búsqueda rápida por artista (desde tarjeta de artista favorito)
    async searchByArtistName(artistName) {
        if (!artistName) return;
        try {
            if (this.view && this.view.searchInput) {
                this.view.searchInput.value = artistName;
            }
            await this.handleSearch(artistName);
        } catch (error) {
            console.error('Error al buscar por artista:', error);
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

    async viewInfo(trackId) {
        try {
            const trackDetails = await this.model.getTrackDetails(trackId);
            if (trackDetails) {
                this.view.showTrackDetails(trackDetails);
            }
        } catch (error) {
            console.error('Error al obtener info de la pista:', error);
            alert('No se pudo cargar la información de la canción');
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