// ========================================
// TEST AUDIO SIMPLE AU DÉMARRAGE
// ========================================

console.log('🔊 TEST AUDIO - Vérification du navigateur...');
console.log('Audio supporté:', typeof Audio !== 'undefined');
console.log('User agent:', navigator.userAgent);

// ========================================
// CLASSE AUDIO PLAYER
// ========================================

class AudioPlayer {
    constructor() {
        this.audio = document.getElementById('audio-player');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.repeatBtn = document.getElementById('repeat-btn');
        this.progressBar = document.getElementById('progress-bar');
        this.progressFill = document.getElementById('progress-fill');
        this.progressHandle = document.getElementById('progress-handle');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationTimeEl = document.getElementById('duration-time');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeValue = document.getElementById('volume-value');
        this.muteBtn = document.getElementById('mute-btn');
        this.speedSelect = document.getElementById('speed-select');
        this.trackTitle = document.getElementById('track-title');
        this.trackArtist = document.getElementById('track-artist');
        this.trackAlbum = document.getElementById('track-album');
        this.albumArt = document.getElementById('album-art');
        this.playingAnimation = document.querySelector('.playing-animation');
        this.playlistEl = document.getElementById('playlist');
        this.emptyPlaylist = document.getElementById('empty-playlist');
        
        this.playlist = this.loadPlaylist();
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isShuffle = false;
        this.repeatMode = 'none';
        this.isDragging = false;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        
        this.init();
    }
    
    getDefaultCover(size = 300) {
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'%3E%3Crect fill='%23667eea' width='${size}' height='${size}'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='${size/3}' fill='white'%3E🎵%3C/text%3E%3C/svg%3E`;
    }
    
    // SOURCES AUDIO DE SECOURS - PLUSIEURS OPTIONS
    getDefaultPlaylist() {
        return [
            {
                id: '1',
                title: 'Test Audio 1 - SoundHelix',
                artist: 'SoundHelix',
                album: 'Test Album',
                // URL alternative très fiable
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                cover: this.getDefaultCover(300)
            },
            {
                id: '2',
                title: 'Test Audio 2 - SoundHelix',
                artist: 'SoundHelix',
                album: 'Test Album',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                cover: this.getDefaultCover(300)
            },
            {
                id: '3',
                title: 'Chill Abstract - Pixabay',
                artist: 'Coma-Media',
                album: 'Pixabay',
                url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
                cover: this.getDefaultCover(300)
            },
            {
                id: '4',
                title: 'Good Night - Pixabay',
                artist: 'FASSounds',
                album: 'Pixabay',
                url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_4c91e29a60.mp3',
                cover: this.getDefaultCover(300)
            },
            {
                id: '5',
                title: 'Test Audio 3 - SoundHelix',
                artist: 'SoundHelix',
                album: 'Test Album',
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                cover: this.getDefaultCover(300)
            }
        ];
    }
    
    init() {
        console.log('🎵 Initialisation du lecteur...');
        
        // DIAGNOSTIC COMPLET
        this.runDiagnostics();
        
        this.setupEventListeners();
        this.renderPlaylist();
        this.loadState();
        
        if (this.playlist.length > 0) {
            this.loadTrack(this.currentTrackIndex);
        }
    }
    
    // ========================================
    // DIAGNOSTICS COMPLETS
    // ========================================
    
    runDiagnostics() {
        console.log('=== DIAGNOSTIC AUDIO ===');
        console.log('1. Élément audio existe:', !!this.audio);
        console.log('2. Volume initial:', this.audio.volume);
        console.log('3. Muted initial:', this.audio.muted);
        console.log('4. Can play MP3:', this.audio.canPlayType('audio/mpeg'));
        console.log('5. Autoplay allowed:', document.createElement('audio').autoplay);
        
        // Forcer le volume au maximum pour le test
        this.audio.volume = 1.0;
        this.audio.muted = false;
        
        console.log('6. Volume forcé à:', this.audio.volume);
        console.log('7. Muted forcé à:', this.audio.muted);
        console.log('========================');
    }
    
    setupEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // LOGS DÉTAILLÉS POUR CHAQUE ÉVÉNEMENT
        this.audio.addEventListener('loadstart', () => {
            console.log('⏳ loadstart - Début chargement');
        });
        
        this.audio.addEventListener('loadeddata', () => {
            console.log('✅ loadeddata - Données chargées');
        });
        
        this.audio.addEventListener('loadedmetadata', () => {
            console.log('✅ loadedmetadata - Métadonnées chargées');
            console.log('   Durée:', this.audio.duration);
            this.onLoadedMetadata();
        });
        
        this.audio.addEventListener('canplay', () => {
            console.log('✅ canplay - Prêt à jouer');
            console.log('   Volume actuel:', this.audio.volume);
            console.log('   Muted:', this.audio.muted);
        });
        
        this.audio.addEventListener('canplaythrough', () => {
            console.log('✅ canplaythrough - Peut jouer sans interruption');
        });
        
        this.audio.addEventListener('playing', () => {
            console.log('▶️ PLAYING - LECTURE EN COURS !');
            console.log('   Volume:', this.audio.volume);
            console.log('   Muted:', this.audio.muted);
            console.log('   Current time:', this.audio.currentTime);
        });
        
        this.audio.addEventListener('play', () => {
            console.log('▶️ play event - Lecture démarrée');
        });
        
        this.audio.addEventListener('pause', () => {
            console.log('⏸️ pause event');
        });
        
        this.audio.addEventListener('volumechange', () => {
            console.log('🔊 volumechange - Volume:', this.audio.volume, 'Muted:', this.audio.muted);
        });
        
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('ended', () => this.onTrackEnded());
        
        this.audio.addEventListener('error', (e) => {
            console.error('❌ ERROR EVENT');
            console.error('Error code:', this.audio.error?.code);
            console.error('Error message:', this.audio.error?.message);
            console.error('Current src:', this.audio.src);
            this.onError(e);
        });
        
        this.audio.addEventListener('stalled', () => {
            console.warn('⚠️ stalled - Chargement bloqué');
        });
        
        this.audio.addEventListener('suspend', () => {
            console.log('⏸️ suspend - Chargement suspendu');
        });
        
        this.audio.addEventListener('waiting', () => {
            console.log('⏳ waiting - En attente de données');
        });
        
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        this.progressBar.addEventListener('mousedown', () => this.startDragging());
        document.addEventListener('mousemove', (e) => this.onDragging(e));
        document.addEventListener('mouseup', () => this.stopDragging());
        
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.speedSelect.addEventListener('change', (e) => this.setPlaybackRate(e.target.value));
        
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        console.log('\n🎵 === TENTATIVE DE LECTURE ===');
        
        if (!this.audio.src) {
            if (this.playlist.length > 0) {
                console.log('Aucune source, chargement de la première piste...');
                this.loadTrack(0);
            } else {
                console.error('❌ Aucune piste dans la playlist');
                alert('Aucune piste dans la playlist');
                return;
            }
        }
        
        // VÉRIFICATIONS AVANT LECTURE
        console.log('Source:', this.audio.src);
        console.log('ReadyState:', this.audio.readyState);
        console.log('NetworkState:', this.audio.networkState);
        console.log('Volume:', this.audio.volume);
        console.log('Muted:', this.audio.muted);
        console.log('Paused:', this.audio.paused);
        
        // FORCER LE VOLUME AU MAXIMUM
        this.audio.volume = 1.0;
        this.audio.muted = false;
        this.volumeSlider.value = 100;
        this.volumeValue.textContent = '100%';
        
        console.log('Volume forcé à 100%');
        
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('✅✅✅ PLAY() RÉUSSI !');
                    console.log('Le son DEVRAIT sortir maintenant !');
                    console.log('Vérifiez:');
                    console.log('- Le volume de votre système');
                    console.log('- Les haut-parleurs/casque');
                    console.log('- Onglet non muted dans le navigateur');
                    
                    this.isPlaying = true;
                    this.playPauseBtn.textContent = '⏸️';
                    this.playPauseBtn.title = 'Pause';
                    this.playingAnimation.classList.remove('hidden');
                    
                    if (!this.audioContext) {
                        this.initVisualizer();
                    }
                })
                .catch(error => {
                    console.error('❌❌❌ PLAY() ÉCHOUÉ !');
                    console.error('Nom de l\'erreur:', error.name);
                    console.error('Message:', error.message);
                    
                    let errorMessage = '❌ Impossible de lire l\'audio\n\n';
                    
                    if (error.name === 'NotAllowedError') {
                        errorMessage += '🚫 Le navigateur bloque la lecture.\n\n';
                        errorMessage += 'Solution:\n';
                        errorMessage += '1. Cliquez sur le bouton Play\n';
                        errorMessage += '2. Autorisez le son dans votre navigateur';
                    } else if (error.name === 'NotSupportedError') {
                        errorMessage += '🚫 Format audio non supporté\n\n';
                        errorMessage += 'Essayez un autre fichier MP3';
                    } else {
                        errorMessage += 'Erreur: ' + error.message;
                    }
                    
                    alert(errorMessage);
                });
        }
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶️';
        this.playPauseBtn.title = 'Lecture';
        this.playingAnimation.classList.add('hidden');
    }
    
    nextTrack() {
        if (this.playlist.length === 0) return;
        
        if (this.isShuffle) {
            this.currentTrackIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        }
        
        this.loadTrack(this.currentTrackIndex);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    previousTrack() {
        if (this.playlist.length === 0) return;
        
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }
        
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(this.currentTrackIndex);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    onTrackEnded() {
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.play();
        } else if (this.repeatMode === 'all' || this.currentTrackIndex < this.playlist.length - 1) {
            this.nextTrack();
        } else {
            this.pause();
            this.audio.currentTime = 0;
        }
    }
    
    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        const track = this.playlist[index];
        this.currentTrackIndex = index;
        
        console.log('\n📀 === CHARGEMENT PISTE ===');
        console.log('Titre:', track.title);
        console.log('URL:', track.url);
        
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.src = track.url;
        
        // FORCER LE VOLUME
        this.audio.volume = 1.0;
        this.audio.muted = false;
        
        this.audio.load();
        
        console.log('Source définie, volume forcé à 100%');
        
        this.trackTitle.textContent = track.title;
        this.trackArtist.textContent = track.artist || 'Artiste inconnu';
        this.trackAlbum.textContent = track.album || 'Album inconnu';
        this.albumArt.src = track.cover || this.getDefaultCover(300);
        
        this.progressFill.style.width = '0%';
        this.progressHandle.style.left = '0%';
        this.currentTimeEl.textContent = '0:00';
        
        this.updatePlaylistUI();
        this.saveState();
    }
    
    onLoadedMetadata() {
        const duration = this.audio.duration;
        if (isFinite(duration)) {
            this.durationTimeEl.textContent = this.formatTime(duration);
        }
    }
    
    onTimeUpdate() {
        if (!this.isDragging && isFinite(this.audio.duration)) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressFill.style.width = `${percent}%`;
            this.progressHandle.style.left = `${percent}%`;
            this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }
    
    seek(e) {
        if (!isFinite(this.audio.duration)) return;
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = percent * this.audio.duration;
    }
    
    startDragging() {
        this.isDragging = true;
    }
    
    onDragging(e) {
        if (!this.isDragging) return;
        const rect = this.progressBar.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        this.progressFill.style.width = `${percent * 100}%`;
        this.progressHandle.style.left = `${percent * 100}%`;
    }
    
    stopDragging() {
        if (!this.isDragging) return;
        const percent = parseFloat(this.progressFill.style.width) / 100;
        if (isFinite(this.audio.duration)) {
            this.audio.currentTime = percent * this.audio.duration;
        }
        this.isDragging = false;
    }
    
    setVolume(value) {
        const volume = value / 100;
        this.audio.volume = volume;
        this.volumeValue.textContent = `${value}%`;
        
        console.log('🔊 Volume:', value + '%');
        
        if (value == 0) {
            this.muteBtn.textContent = '🔇';
        } else if (value < 50) {
            this.muteBtn.textContent = '🔉';
        } else {
            this.muteBtn.textContent = '🔊';
        }
        
        localStorage.setItem('audio-volume', value);
    }
    
    toggleMute() {
        if (this.audio.volume > 0) {
            this.audio.dataset.previousVolume = this.audio.volume;
            this.setVolume(0);
            this.volumeSlider.value = 0;
        } else {
            const previousVolume = (this.audio.dataset.previousVolume || 0.7) * 100;
            this.setVolume(previousVolume);
            this.volumeSlider.value = previousVolume;
        }
    }
    
    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.shuffleBtn.classList.toggle('active', this.isShuffle);
        this.saveState();
    }
    
    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        this.repeatBtn.classList.toggle('active', this.repeatMode !== 'none');
        if (this.repeatMode === 'one') {
            this.repeatBtn.textContent = '🔂';
        } else {
            this.repeatBtn.textContent = '🔁';
        }
        this.saveState();
    }
    
    setPlaybackRate(rate) {
        this.audio.playbackRate = parseFloat(rate);
    }
    
    addTrack(track) {
        if (!track.url || !track.url.trim()) {
            alert('URL invalide !');
            return;
        }
        
        track.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        if (!track.cover) {
            track.cover = this.getDefaultCover(300);
        }
        
        this.playlist.push(track);
        this.savePlaylist();
        this.renderPlaylist();
        
        if (this.playlist.length === 1) {
            this.loadTrack(0);
        }
    }
    
    removeTrack(id) {
        const index = this.playlist.findIndex(t => t.id === id);
        if (index === -1) return;
        
        this.playlist.splice(index, 1);
        
        if (index === this.currentTrackIndex && this.isPlaying) {
            if (this.playlist.length > 0) {
                this.currentTrackIndex = Math.min(index, this.playlist.length - 1);
                this.loadTrack(this.currentTrackIndex);
            } else {
                this.pause();
                this.audio.src = '';
            }
        } else if (index < this.currentTrackIndex) {
            this.currentTrackIndex--;
        }
        
        this.savePlaylist();
        this.renderPlaylist();
    }
    
    renderPlaylist() {
        if (this.playlist.length === 0) {
            this.playlistEl.classList.add('hidden');
            this.emptyPlaylist.classList.remove('hidden');
            return;
        }
        
        this.playlistEl.classList.remove('hidden');
        this.emptyPlaylist.classList.add('hidden');
        this.playlistEl.innerHTML = '';
        
        this.playlist.forEach((track, index) => {
            const item = this.createPlaylistItem(track, index);
            this.playlistEl.appendChild(item);
        });
    }
    
    createPlaylistItem(track, index) {
        const div = document.createElement('div');
        div.className = 'playlist-item';
        if (index === this.currentTrackIndex) {
            div.classList.add('playing');
        }
        
        div.innerHTML = `
            <img src="${track.cover || this.getDefaultCover(60)}" 
                 alt="${track.title}" 
                 class="playlist-item-cover">
            <div class="playlist-item-info">
                <div class="playlist-item-title">${track.title}</div>
                <div class="playlist-item-artist">${track.artist || 'Artiste inconnu'}</div>
            </div>
            <span class="playlist-item-duration">--:--</span>
            <button class="playlist-item-delete" title="Supprimer">✕</button>
        `;
        
        div.addEventListener('click', (e) => {
            if (!e.target.classList.contains('playlist-item-delete')) {
                this.loadTrack(index);
                this.play();
            }
        });
        
        div.querySelector('.playlist-item-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Supprimer "${track.title}" ?`)) {
                this.removeTrack(track.id);
            }
        });
        
        return div;
    }
    
    updatePlaylistUI() {
        document.querySelectorAll('.playlist-item').forEach((item, index) => {
            if (index === this.currentTrackIndex) {
                item.classList.add('playing');
            } else {
                item.classList.remove('playing');
            }
        });
    }
    
    clearPlaylist() {
        if (confirm('Vider la playlist ?')) {
            this.playlist = [];
            this.pause();
            this.audio.src = '';
            this.savePlaylist();
            this.renderPlaylist();
        }
    }
    
    exportPlaylist() {
        const data = JSON.stringify(this.playlist, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `playlist-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    initVisualizer() {
        try {
            const canvas = document.getElementById('visualizer');
            const ctx = canvas.getContext('2d');
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaElementSource(this.audio);
            this.analyser = this.audioContext.createAnalyser();
            
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            const draw = () => {
                requestAnimationFrame(draw);
                this.analyser.getByteFrequencyData(this.dataArray);
                
                ctx.fillStyle = 'rgb(31, 41, 55)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const barWidth = (canvas.width / bufferLength) * 2.5;
                let x = 0;
                
                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (this.dataArray[i] / 255) * canvas.height;
                    const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                    gradient.addColorStop(0, '#667eea');
                    gradient.addColorStop(1, '#764ba2');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth + 1;
                }
            };
            
            draw();
        } catch (error) {
            console.error('Erreur visualizer:', error);
        }
    }
    
    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.previousTrack();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextTrack();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const newVolUp = Math.min(100, parseInt(this.volumeSlider.value) + 10);
                this.volumeSlider.value = newVolUp;
                this.setVolume(newVolUp);
                break;
            case 'ArrowDown':
                e.preventDefault();
                const newVolDown = Math.max(0, parseInt(this.volumeSlider.value) - 10);
                this.volumeSlider.value = newVolDown;
                this.setVolume(newVolDown);
                break;
            case 'KeyM':
                e.preventDefault();
                this.toggleMute();
                break;
        }
    }
    
    savePlaylist() {
        localStorage.setItem('audio-playlist', JSON.stringify(this.playlist));
    }
    
    loadPlaylist() {
        const stored = localStorage.getItem('audio-playlist');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return parsed.length > 0 ? parsed : this.getDefaultPlaylist();
            } catch (e) {
                return this.getDefaultPlaylist();
            }
        }
        return this.getDefaultPlaylist();
    }
    
    saveState() {
        const state = {
            currentTrackIndex: this.currentTrackIndex,
            isShuffle: this.isShuffle,
            repeatMode: this.repeatMode
        };
        localStorage.setItem('audio-state', JSON.stringify(state));
    }
    
    loadState() {
        const stored = localStorage.getItem('audio-state');
        if (stored) {
            try {
                const state = JSON.parse(stored);
                this.currentTrackIndex = state.currentTrackIndex || 0;
                this.isShuffle = state.isShuffle || false;
                this.repeatMode = state.repeatMode || 'none';
                this.shuffleBtn.classList.toggle('active', this.isShuffle);
                this.repeatBtn.classList.toggle('active', this.repeatMode !== 'none');
                if (this.repeatMode === 'one') {
                    this.repeatBtn.textContent = '🔂';
                }
            } catch (e) {}
        }
        
        // FORCER LE VOLUME AU MAXIMUM AU DÉMARRAGE
        this.volumeSlider.value = 100;
        this.setVolume(100);
    }
    
    formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    onError(e) {
        console.error('❌ ERREUR AUDIO COMPLÈTE');
        alert('Erreur de lecture.\nEssayez une autre piste.');
    }
}

// ========================================
// INITIALISATION
// ========================================

let player;

document.addEventListener('DOMContentLoaded', () => {
    console.log('\n🚀🚀🚀 DÉMARRAGE DU LECTEUR 🚀🚀🚀\n');
    
    player = new AudioPlayer();
    
    // Modal
    const modal = document.getElementById('add-track-modal');
    const addTrackBtn = document.getElementById('add-track-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const addTrackForm = document.getElementById('add-track-form');
    
    addTrackBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
    
    addTrackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const track = {
            url: document.getElementById('track-url').value.trim(),
            title: document.getElementById('track-title-input').value.trim() || 'Sans titre',
            artist: document.getElementById('track-artist-input').value.trim() || 'Inconnu',
            album: document.getElementById('track-album-input').value.trim() || 'Inconnu',
            cover: document.getElementById('track-cover-input').value.trim() || ''
        };
        player.addTrack(track);
        addTrackForm.reset();
        modal.classList.add('hidden');
    });
    
    document.getElementById('clear-playlist-btn').addEventListener('click', () => player.clearPlaylist());
    document.getElementById('download-playlist-btn').addEventListener('click', () => player.exportPlaylist());
    
    // Theme
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    
    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
    
    console.log('\n✅ Lecteur prêt !');
    console.log('📋 Ouvrez la CONSOLE (F12) pour voir tous les logs');
    console.log('🎵 Cliquez sur PLAY');
    console.log('🔊 Vérifiez que le VOLUME est au maximum\n');
});