class SpotifyModel {
    constructor() {
        this.clientId = '7a61bd1f6b134a6a9e5162b92d25950a'; // Client ID de Spotify
        this.clientSecret = 'c9553f9acbdf4a8ca8d4a7b41cf864d4'; // Client Secret de Spotify
        this.accessToken = null;
        this.tokenExpiry = null;
        this.baseUrl = 'https://api.spotify.com/v1';
    }

    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
                },
                body: 'grant_type=client_credentials'
            });

            if (!response.ok) {
                throw new Error('Error al obtener token de acceso');
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
            
            return this.accessToken;
        } catch (error) {
            console.error('Error obteniendo token:', error);
            throw error;
        }
    }

    async makeRequest(endpoint) {
        try {
            const token = await this.getAccessToken();
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en petición a Spotify:', error);
            throw error;
        }
    }

    async getFeaturedPlaylists() {
        try {
            const data = await this.makeRequest('/browse/featured-playlists?limit=10');
            return data.playlists.items;
        } catch (error) {
            console.error('Error obteniendo playlists destacadas:', error);
            return this.getMockData();
        }
    }

    async searchTracks(query) {
        try {
            const data = await this.makeRequest(`/search?q=${encodeURIComponent(query)}&type=track&limit=20`);
            return data.tracks.items;
        } catch (error) {
            console.error('Error buscando canciones:', error);
            return this.getMockSearchResults(query);
        }
    }

    async getTrackDetails(trackId) {
        try {
            const data = await this.makeRequest(`/tracks/${trackId}`);
            return data;
        } catch (error) {
            console.error('Error obteniendo detalles de la canción:', error);
            return null;
        }
    }

    async getNewReleases() {
        try {
            const data = await this.makeRequest('/browse/new-releases?limit=10');
            return data.albums.items;
        } catch (error) {
            console.error('Error obteniendo nuevos lanzamientos:', error);
            return this.getMockNewReleases();
        }
    }

    // Obtener canciones populares desde una playlist curada (Today's Top Hits)
    async getPopularTracks() {
        try {
            const playlistId = '37i9dQZF1DXcBWIGoYBM5M';
            const data = await this.makeRequest(`/playlists/${playlistId}/tracks?limit=12`);
            const items = data.items || [];
            // Normalizar a objetos tipo track que usa la vista
            return items
                .map(i => i.track)
                .filter(Boolean);
        } catch (error) {
            console.error('Error obteniendo canciones populares:', error);
            return this.getMockPopularTracks();
        }
    }

    // Artistas favoritos (mock, sin auth de usuario)
    async getFavoriteArtists() {
        try {
            // Sin autorización de usuario, devolvemos una lista estática
            return this.getMockFavoriteArtists();
        } catch (error) {
            console.error('Error obteniendo artistas favoritos:', error);
            return this.getMockFavoriteArtists();
        }
    }

    async getArtistById(artistId) {
        try {
            const data = await this.makeRequest(`/artists/${artistId}`);
            return data;
        } catch (error) {
            console.error('Error obteniendo artista por ID:', error);
            return null;
        }
    }

    // Datos mock para cuando la API no está disponible
    getMockData() {
        return [
            {
                id: '1',
                name: 'Canción de Ejemplo 1',
                artists: [{ name: 'Artista 1' }],
                album: {
                    name: 'Álbum 1',
                    images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Album+1' }]
                },
                preview_url: 'https://p.scdn.co/mp3-preview/example1',
                external_urls: { spotify: 'https://open.spotify.com/track/1' }
            },
            {
                id: '2',
                name: 'Canción de Ejemplo 2',
                artists: [{ name: 'Artista 2' }],
                album: {
                    name: 'Álbum 2',
                    images: [{ url: 'https://via.placeholder.com/300x300/1ed760/ffffff?text=Album+2' }]
                },
                preview_url: 'https://p.scdn.co/mp3-preview/example2',
                external_urls: { spotify: 'https://open.spotify.com/track/2' }
            },
            {
                id: '3',
                name: 'Canción de Ejemplo 3',
                artists: [{ name: 'Artista 3' }],
                album: {
                    name: 'Álbum 3',
                    images: [{ url: 'https://via.placeholder.com/300x300/191414/ffffff?text=Album+3' }]
                },
                preview_url: 'https://p.scdn.co/mp3-preview/example3',
                external_urls: { spotify: 'https://open.spotify.com/track/3' }
            }
        ];
    }

    getMockSearchResults(query) {
        return [
            {
                id: 'search1',
                name: `Resultado de búsqueda para "${query}"`,
                artists: [{ name: 'Artista de Búsqueda' }],
                album: {
                    name: 'Álbum de Búsqueda',
                    images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Search' }]
                },
                preview_url: 'https://p.scdn.co/mp3-preview/search',
                external_urls: { spotify: 'https://open.spotify.com/track/search1' }
            }
        ];
    }

    getMockNewReleases() {
        return [
            {
                id: 'new1',
                name: 'Nuevo Álbum 1',
                artists: [{ name: 'Artista Nuevo 1' }],
                images: [{ url: 'https://via.placeholder.com/300x300/1ed760/ffffff?text=New+1' }],
                external_urls: { spotify: 'https://open.spotify.com/album/new1' }
            }
        ];
    }

    getMockPopularTracks() {
        return [
            {
                id: 'pop1',
                name: 'Hit Popular 1',
                artists: [{ name: 'Artista Popular A' }],
                album: {
                    name: 'Álbum Popular',
                    images: [{ url: 'https://via.placeholder.com/300x300/667eea/ffffff?text=Hit+1' }]
                },
                external_urls: { spotify: 'https://open.spotify.com/track/pop1' }
            },
            {
                id: 'pop2',
                name: 'Hit Popular 2',
                artists: [{ name: 'Artista Popular B' }],
                album: {
                    name: 'Álbum Popular',
                    images: [{ url: 'https://via.placeholder.com/300x300/764ba2/ffffff?text=Hit+2' }]
                },
                external_urls: { spotify: 'https://open.spotify.com/track/pop2' }
            }
        ];
    }

    getMockFavoriteArtists() {
        return [
            {
                id: 'artist1',
                name: 'The Weeknd',
                images: [{ url: 'https://via.placeholder.com/300x300/222/fff?text=The+Weeknd' }],
                external_urls: { spotify: 'https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ' }
            },
            {
                id: 'artist2',
                name: 'Dua Lipa',
                images: [{ url: 'https://via.placeholder.com/300x300/333/fff?text=Dua+Lipa' }],
                external_urls: { spotify: 'https://open.spotify.com/artist/6M2wZ9GZgrQXHCFfjv46we' }
            },
            {
                id: 'artist3',
                name: 'Bad Bunny',
                images: [{ url: 'https://via.placeholder.com/300x300/444/fff?text=Bad+Bunny' }],
                external_urls: { spotify: 'https://open.spotify.com/artist/4q3ewBCX7sLwd24euuV69X' }
            }
        ];
    }
}