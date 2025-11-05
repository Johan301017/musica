class MusicView {
    constructor() {
        this.featuredSongsContainer = document.getElementById('featuredSongs');
        this.searchResultsContainer = document.getElementById('searchResultsGrid');
        this.searchResultsSection = document.getElementById('searchResults');
        this.searchInput = document.getElementById('searchInput');
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

        card.innerHTML = `
            <img src="${albumImage}" alt="${songName}" onerror="this.src='https://via.placeholder.com/300x300/333/ffffff?text=No+Image'">
            <h3>${this.truncateText(songName, 25)}</h3>
            <p>${this.truncateText(artists, 30)}</p>
            <p style="font-size: 0.9rem; color: #b3b3b3;">${this.truncateText(albumName, 25)}</p>
            <button class="play-btn" onclick="musicController.playTrack('${song.id}', '${songName.replace(/'/g, "\\'")}', '${artists.replace(/'/g, "\\'")}', '${albumImage}')">
                <i class="fas fa-play"></i> Reproducir
            </button>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.play-btn')) {
                this.showTrackDetails(song);
            }
        });

        return card;
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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

    showSearchResults(songs) {
        this.displaySongs(songs, this.searchResultsContainer);
        this.searchResultsSection.style.display = 'block';
        this.searchResultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    hideSearchResults() {
        this.searchResultsSection.style.display = 'none';
    }

    showLoading(message = 'Cargando...') {
        this.featuredSongsContainer.innerHTML = `<div class="loading">${message}</div>`;
    }

    showError(message) {
        this.featuredSongsContainer.innerHTML = `<div class="loading" style="color: #ff6b6b;">Error: ${message}</div>`;
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
        }
    }

    resumeAudio() {
        if (this.currentAudio) {
            this.currentAudio.play().catch(error => {
                console.error('Error al reanudar audio:', error);
            });
            this.playBtn.style.display = 'none';
            this.pauseBtn.style.display = 'block';
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
    }
}