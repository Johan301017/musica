class MusicView {
    constructor() {
        this.featuredSongsContainer = document.getElementById('featuredSongs');
        this.searchResultsContainer = document.getElementById('searchResultsGrid');
        this.searchResultsSection = document.getElementById('searchResults');
        // Fallback: si no existe la sección de "Canciones Populares", usar resultados de búsqueda
        if (!this.featuredSongsContainer && this.searchResultsContainer) {
            this.featuredSongsContainer = this.searchResultsContainer;
        }
        this.favoriteArtistsContainer = document.getElementById('favoriteArtistsGrid');
        this.searchInput = document.getElementById('searchInput');
        this.trackInfoModal = document.getElementById('trackInfoModal');
        this.trackInfoContent = document.getElementById('trackInfoContent');
        // Mini Player
        this.miniPlayer = document.getElementById('miniPlayer');
        this.miniCover = document.getElementById('miniCover');
        this.miniTitle = document.getElementById('miniTitle');
        this.miniArtist = document.getElementById('miniArtist');
        this.miniPlayBtn = document.getElementById('miniPlayBtn');
        this.miniPauseBtn = document.getElementById('miniPauseBtn');
        this.miniCloseBtn = document.getElementById('miniCloseBtn');
        this.searchBtn = document.getElementById('searchBtn');
        this.songTitle = document.getElementById('songTitle');
        this.artistName = document.getElementById('artistName');
        this.albumArt = document.getElementById('albumArt');
        this.playBtn = document.getElementById('playBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.currentAudio = null;
        this.currentTrack = null;
    }

    displaySongs(songs, container = this.featuredSongsContainer) {
        container.innerHTML = '';
        
        if (!songs || songs.length === 0) {
            container.innerHTML = '<div class="loading">No se encontraron canciones</div>';
            return;
        }

        songs.forEach(song => {
            const songCard = this.createSongCard(song);
            container.appendChild(songCard);
        });
    }

    createSongCard(song) {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.dataset.trackId = song.id;

        const albumImage = song.album?.images?.[0]?.url || 
                          song.images?.[0]?.url || 
                          'https://via.placeholder.com/300x300/333/ffffff?text=No+Image';

        const artists = song.artists?.map(artist => artist.name).join(', ') || 'Artista Desconocido';
        const songName = song.name || 'Canción Desconocida';
        const albumName = song.album?.name || song.name || 'Álbum Desconocido';

        const artistId = song.artists?.[0]?.id;
        const isFavorite = artistId && this.isFavoriteArtist(artistId);
        
        card.innerHTML = `
            <button class="favorite-star ${isFavorite ? 'active' : ''}" data-artist-id="${artistId || ''}">
                <i class="fas fa-star"></i>
            </button>
            <img src="${albumImage}" alt="${songName}" loading="lazy" decoding="async" onerror="this.src='https://via.placeholder.com/300x300/333/ffffff?text=No+Image'">
            <h3>${this.truncateText(songName, 25)}</h3>
            <p>${this.truncateText(artists, 30)}</p>
            <p style="font-size: 0.9rem; color: #b3b3b3;">${this.truncateText(albumName, 25)}</p>
            <button class=\"info-btn\">
                <i class=\"fas fa-info-circle\"></i> Ver info
            </button>
            <button class=\"spotify-link\">
                <i class="fab fa-spotify"></i> Abrir en Spotify
            </button>
        `;

        // Click en la tarjeta muestra detalles
        card.addEventListener('click', () => {
            this.showTrackDetails(song);
        });

        // Botón Ver info (evita propagación y muestra modal detallado)
        const infoBtn = card.querySelector('.info-btn');
        if (infoBtn) {
            infoBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (this.onShowTrackInfo) {
                    await this.onShowTrackInfo(song.id);
                } else {
                    this.showTrackDetails(song);
                }
            });
        }

        // Botón Abrir en Spotify
        const spotifyBtn = card.querySelector('.spotify-link');
        if (spotifyBtn) {
            spotifyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = song.external_urls?.spotify || song.album?.external_urls?.spotify || '#';
                if (url && url !== '#') window.open(url, '_blank');
            });
        }

        // Botón de estrella (favoritos)
        const starBtn = card.querySelector('.favorite-star');
        if (starBtn && artistId) {
            starBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.onToggleFavorite) {
                    this.onToggleFavorite(artistId, starBtn);
                }
            });
        }

        return card;
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // Render de artistas favoritos
    displayArtists(artists) {
        if (!this.favoriteArtistsContainer) return;
        const container = this.favoriteArtistsContainer;
        container.innerHTML = '';

        if (!artists || artists.length === 0) {
            container.innerHTML = '<div class="loading">No hay artistas favoritos</div>';
            return;
        }

        artists.forEach(artist => {
            const card = this.createArtistCard(artist);
            container.appendChild(card);
        });
    }

    createArtistCard(artist) {
        const card = document.createElement('div');
        card.className = 'song-card';

        const image = artist.images?.[0]?.url || 'https://via.placeholder.com/300x300/333/ffffff?text=Artist';
        const name = artist.name || 'Artista';

        const artistId = artist.id;
        const isFavorite = this.isFavoriteArtist(artistId);
        
        card.innerHTML = `
            <button class="favorite-star ${isFavorite ? 'active' : ''}" data-artist-id="${artistId}">
                <i class="fas fa-star"></i>
            </button>
            <img src="${image}" alt="${name}" loading="lazy" decoding="async" onerror="this.src='https://via.placeholder.com/300x300/333/ffffff?text=Artist'">
            <h3>${this.truncateText(name, 25)}</h3>
            <button class="spotify-link">
                <i class="fab fa-spotify"></i> Abrir en Spotify
            </button>
        `;

        const spotifyBtn = card.querySelector('.spotify-link');
        spotifyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const url = artist.external_urls?.spotify || '#';
            if (url && url !== '#') window.open(url, '_blank');
        });

        // Botón de estrella (favoritos)
        const starBtn = card.querySelector('.favorite-star');
        if (starBtn) {
            starBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.onToggleFavorite) {
                    this.onToggleFavorite(artistId, starBtn);
                }
            });
        }

        // Click en tarjeta de artista: buscar canciones del artista
        card.addEventListener('click', () => {
            if (this.onArtistClick) {
                this.onArtistClick(name);
            }
        });

        return card;
    }

    isFavoriteArtist(artistId) {
        try {
            const ids = JSON.parse(localStorage.getItem('favoriteArtistIds') || '[]');
            return Array.isArray(ids) && ids.includes(artistId);
        } catch {
            return false;
        }
    }

    showTrackDetails(song) {
        const albumImage = song.album?.images?.[0]?.url || 
                          song.images?.[0]?.url || 
                          'https://via.placeholder.com/300x300/333/ffffff?text=No+Image';
        
        const artists = song.artists?.map(artist => artist.name).join(', ') || 'Artista Desconocido';
        const songName = song.name || 'Canción Desconocida';

        this.songTitle.textContent = songName;
        this.artistName.textContent = artists;
        
        if (albumImage !== 'https://via.placeholder.com/300x300/333/ffffff?text=No+Image') {
            this.albumArt.innerHTML = `<img src="${albumImage}" alt="${songName}">`;
        } else {
            this.albumArt.innerHTML = '<i class="fas fa-music"></i>';
        }

        this.currentTrack = {
            id: song.id,
            name: songName,
            artists: artists,
            preview_url: song.preview_url,
            external_url: song.external_urls?.spotify
        };
    }

    async showTrackInfoModal(trackDetails) {
        if (!this.trackInfoModal || !this.trackInfoContent) return;

        const image = trackDetails.album?.images?.[0]?.url || 
                     trackDetails.images?.[0]?.url || 
                     'https://via.placeholder.com/300x300/333/ffffff?text=No+Image';
        const name = trackDetails.name || 'Canción Desconocida';
        const artists = trackDetails.artists?.map(a => a.name).join(', ') || 'Artista Desconocido';
        const albumName = trackDetails.album?.name || 'Álbum Desconocido';
        const releaseDate = trackDetails.album?.release_date || 'N/A';
        const duration = trackDetails.duration_ms ? Math.floor(trackDetails.duration_ms / 1000 / 60) + ':' + String(Math.floor((trackDetails.duration_ms / 1000) % 60)).padStart(2, '0') : 'N/A';
        const popularity = trackDetails.popularity || 0;
        const trackNumber = trackDetails.track_number || 'N/A';
        const totalTracks = trackDetails.album?.total_tracks || 'N/A';
        const previewUrl = trackDetails.preview_url;
        const artistUrl = trackDetails.artists?.[0]?.external_urls?.spotify;

        this.trackInfoContent.innerHTML = `
            <div class="track-info-details">
                <div class="track-info-image">
                    <img src="${image}" alt="${name}" onerror="this.src='https://via.placeholder.com/300x300/333/ffffff?text=No+Image'">
                </div>
                <div class="track-info-text">
                    <h2>${name}</h2>
                    <div class="artist-name">${artists}</div>
                    <div class="track-info-meta">
                        <div class="track-info-meta-item">
                            <i class="fas fa-compact-disc"></i>
                            <span><strong>Álbum:</strong> ${albumName}</span>
                        </div>
                        <div class="track-info-meta-item">
                            <i class="fas fa-calendar"></i>
                            <span><strong>Fecha de lanzamiento:</strong> ${releaseDate}</span>
                        </div>
                        <div class="track-info-meta-item">
                            <i class="fas fa-clock"></i>
                            <span><strong>Duración:</strong> ${duration}</span>
                        </div>
                        <div class="track-info-meta-item">
                            <i class="fas fa-chart-line"></i>
                            <span><strong>Popularidad:</strong> ${popularity}/100</span>
                        </div>
                        <div class="track-info-meta-item">
                            <i class="fas fa-list-ol"></i>
                            <span><strong>Pista:</strong> ${trackNumber} de ${totalTracks}</span>
                        </div>
                    </div>
                    <div class="modal-actions">
                        ${previewUrl ? `
                            <button id=\"modalPlayBtn\" class=\"modal-action modal-artist\"> 
                                <i class=\"fas fa-play\"></i> Preview
                            </button>
                        ` : ''}
                        ${trackDetails.external_urls?.spotify ? `
                            <a href=\"${trackDetails.external_urls.spotify}\" target=\"_blank\" class=\"modal-action modal-spotify\">
                                <i class=\"fab fa-spotify\"></i> Abrir en Spotify
                            </a>
                        ` : ''}
                        ${artistUrl ? `
                            <a href=\"${artistUrl}\" target=\"_blank\" class=\"modal-action modal-artist\">
                                <i class=\"fas fa-user\"></i> Ver artista en Spotify
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        this.trackInfoModal.style.display = 'block';

        // Cerrar modal
        const closeBtn = this.trackInfoModal.querySelector('.modal-close');
        closeBtn.onclick = () => {
            this.closeTrackInfoModal();
        };

        window.onclick = (event) => {
            if (event.target === this.trackInfoModal) {
                this.closeTrackInfoModal();
            }
        };

        // Cerrar con Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeTrackInfoModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Preview de audio dentro del modal
        if (previewUrl) {
            const playBtn = document.getElementById('modalPlayBtn');
            if (playBtn) {
                if (this.modalAudio) {
                    this.modalAudio.pause();
                    this.modalAudio = null;
                }
                this.modalAudio = new Audio(previewUrl);
                let playing = false;
                playBtn.addEventListener('click', async () => {
                    try {
                        if (!playing) {
                            await this.modalAudio.play();
                            playing = true;
                            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
                        } else {
                            this.modalAudio.pause();
                            playing = false;
                            playBtn.innerHTML = '<i class="fas fa-play"></i> Preview';
                        }
                    } catch (err) {
                        console.error('Error al reproducir preview:', err);
                        alert('No se pudo reproducir la vista previa');
                    }
                });
                this.modalAudio.addEventListener('ended', () => {
                    playing = false;
                    playBtn.innerHTML = '<i class="fas fa-play"></i> Preview';
                });
            }
        }
    }

    closeTrackInfoModal() {
        if (this.modalAudio) {
            this.modalAudio.pause();
            this.modalAudio = null;
        }
        this.trackInfoModal.style.display = 'none';
    }

    showSearchResults(songs) {
        this.displaySongs(songs, this.searchResultsContainer);
        this.searchResultsSection.style.display = 'block';
        this.searchResultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    hideSearchResults() {
        this.searchResultsSection.style.display = 'none';
    }

    showLoading(message = 'Cargando...') {
        const target = this.searchResultsContainer || this.featuredSongsContainer;
        if (this.searchResultsSection) {
            this.searchResultsSection.style.display = 'block';
        }
        if (target) target.innerHTML = `<div class="loading">${message}</div>`;
    }

    showError(message) {
        const target = this.searchResultsContainer || this.featuredSongsContainer;
        if (this.searchResultsSection) {
            this.searchResultsSection.style.display = 'block';
        }
        if (target) target.innerHTML = `<div class="loading" style="color: #ff6b6b;">Error: ${message}</div>`;
    }

    playAudio(previewUrl) {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        if (previewUrl) {
            this.currentAudio = new Audio(previewUrl);
            this.currentAudio.play().catch(error => {
                console.error('Error al reproducir audio:', error);
                alert('No se puede reproducir la vista previa de esta canción');
            });
            
            this.playBtn.style.display = 'none';
            this.pauseBtn.style.display = 'block';

            // Mostrar mini player
            this.openMiniPlayer();

            this.currentAudio.addEventListener('ended', () => {
                this.stopAudio();
            });
        } else {
            alert('Esta canción no tiene vista previa disponible');
        }
    }

    stopAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        this.playBtn.style.display = 'block';
        this.pauseBtn.style.display = 'none';
    }

    pauseAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.playBtn.style.display = 'block';
            this.pauseBtn.style.display = 'none';
            if (this.miniPlayBtn && this.miniPauseBtn) {
                this.miniPlayBtn.style.display = 'block';
                this.miniPauseBtn.style.display = 'none';
            }
        }
    }

    resumeAudio() {
        if (this.currentAudio) {
            this.currentAudio.play().catch(error => {
                console.error('Error al reanudar audio:', error);
            });
            this.playBtn.style.display = 'none';
            this.pauseBtn.style.display = 'block';
            if (this.miniPlayBtn && this.miniPauseBtn) {
                this.miniPlayBtn.style.display = 'none';
                this.miniPauseBtn.style.display = 'block';
            }
        }
    }

    bindSearchHandler(handler) {
        const performSearch = () => {
            const query = this.searchInput.value.trim();
            if (query) {
                handler(query);
            }
        };

        this.searchBtn.addEventListener('click', performSearch);
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    bindPlayerHandlers() {
        this.playBtn.addEventListener('click', () => {
            if (this.currentTrack) {
                if (this.currentAudio && this.currentAudio.paused) {
                    this.resumeAudio();
                } else if (this.currentTrack.preview_url) {
                    this.playAudio(this.currentTrack.preview_url);
                }
            }
        });

        this.pauseBtn.addEventListener('click', () => {
            this.pauseAudio();
        });

        // Mini player handlers
        if (this.miniPlayBtn) {
            this.miniPlayBtn.addEventListener('click', () => this.resumeAudio());
        }
        if (this.miniPauseBtn) {
            this.miniPauseBtn.addEventListener('click', () => this.pauseAudio());
        }
        if (this.miniCloseBtn) {
            this.miniCloseBtn.addEventListener('click', () => this.closeMiniPlayer());
        }
    }

    openMiniPlayer() {
        if (!this.miniPlayer || !this.currentTrack) return;
        this.miniTitle.textContent = this.currentTrack.name || 'Canción';
        this.miniArtist.textContent = this.currentTrack.artists || 'Artista';
        const albumImage = this.albumArt?.querySelector('img')?.src;
        if (albumImage) {
            this.miniCover.innerHTML = `<img src="${albumImage}" alt="cover" loading="lazy" decoding="async">`;
        } else {
            this.miniCover.innerHTML = '';
        }
        this.miniPlayer.style.display = 'block';
        if (this.miniPlayBtn && this.miniPauseBtn) {
            this.miniPlayBtn.style.display = 'none';
            this.miniPauseBtn.style.display = 'block';
        }
    }

    closeMiniPlayer() {
        if (!this.miniPlayer) return;
        this.miniPlayer.style.display = 'none';
        this.pauseAudio();
    }

}