/**
1. Render songs
2. Scroll top
3. Play / pause / seek 
4. CD rotate 
5. Next / prev 
6. Random
7. Next / Repeaat when ended
8. Active song 
9. Scroll active song into view 
10. Play song when click 
*/

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'D_PLAYER'

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const player = $('.player')
const cd = $('.cd')
const progress = $('#progress')

const playBtn = $('.btn-toggle-play')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')


const app = {
    currentIndex: 0, // vị trí chỉ mục hiện tại --> Đầu tiên
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Mood',
            singer: '24kGoldn', 
            path: './assets/music/song0.mp3',
            image: './assets/image/mood.jpg'
        },
        {
            name: 'The fall',
            singer: 'The Chainsmokers', 
            path: './assets/music/song1.mp3',
            image: './assets/image/the-fall.jpg'
        },
        {
            name: 'Reality',
            singer: 'Lost Frequencies', 
            path: './assets/music/song2.mp3',
            image: './assets/image/reality.png'
        },
        {
            name: 'Angel baby',
            singer: 'Troye Sivan', 
            path: './assets/music/song3.mp3',
            image: './assets/image/angel-baby.jpg'
        },
        {
            name: 'See you again',
            singer: 'Khalifa ft Charlie Puth', 
            path: './assets/music/song4.mp3',
            image: './assets/image/see-you-again.jpg'
        },
        {
            name: 'Break me',
            singer: 'MSI 2022', 
            path: './assets/music/song5.mp3',
            image: './assets/image/break-me1.png'
        },
        {
            name: 'Burn out',
            singer: 'Martin Garrix', 
            path: './assets/music/song6.mp3',
            image: './assets/image/burn-out.jpg'
        },
        {
            name: 'Dark side',
            singer: 'Alan Walker', 
            path: './assets/music/song7.mp3',
            image: './assets/image/dark-side.png'
        },
        {
            name: 'Attention',
            singer: 'Charlie Puth', 
            path: './assets/music/song8.mp3',
            image: './assets/image/attention.jpg'
        },
        {
            name: 'What do you mean',
            singer: 'Justin Bieber', 
            path: './assets/music/song9.mp3',
            image: './assets/image/what-do-you-mean.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}" >
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playList.innerHTML = htmls.join('') 
        // nối mảng trả về chuỗi và thay thế vào '.playlist' bên html. vì ${song.image}.... được lấy từ mảng ra nên phải dùng join('')
    },
    defineProperties: function() {
        // thêm hoặc sửa đổi thuộc tính hiện có
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {  // Sử lí sự kiện
        const _this = this
        const cdWidth = cd.offsetWidth // Hiển thị chiều rộng của phần tử

        // xử lý CD quay / dừng 
        const cdThumbAnimate = cdThumb.animate([ // animate([],{})s
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 second
            iterations: Infinity // sự lặp lại
        })
        cdThumbAnimate.pause()

        document.onscroll = function() { // lắng nghe sự kiện scroll của cả trang
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCDWidth = cdWidth - scrollTop // cho nhỏ dần kích thước đĩa than

            cd.style.width = newCDWidth > 0 ? newCDWidth + 'px' : 0 //fix lỗi ko nhỏ hết đĩa than khi scroll  nhanh

            cd.style.opacity = newCDWidth / cdWidth // mờ dần đĩa than khi thu nhỏ
        }

        // xử lý khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            }
            else {
                audio.play();             
            }
        }

        // khi song được play 
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing');
            cdThumbAnimate.play()
        }
        // khi song pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing');
            cdThumbAnimate.pause()
        }
        // khi tiến độ bài hát thay đổi 
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                                                     // time hiện tại chia cho thời lượng
                progress.value = progressPercent
            }
        }
        // xử lý khi tua
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }
        // khi next song 
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            }
            else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // khi prev song 
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            }
            else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // xử lý bật tắt random song 
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)

        }
        // xử lý hát lại một song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        // Xử lý next song khi audo ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            }
            else {
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || !e.target.closest('option')) {
                // xử lý khi click vào song 
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
            }
        }
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        },300)
    },

    loadCurrentSong: function() { 
        
        heading.textContent = this.currentSong.name,
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while(newIndex === this.currentIndex)
        
        this.currentIndex = newIndex 
        this.loadCurrentSong()
    },

    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe, sử lý các sự kiện (DOM Event)
        this.handleEvents()

        // Load thông tin bài hát hiện tại vào dashboard
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hiển thị trạng thaiis ban đầu của btn random & repeat
        randomBtn.classList.toggle('active', this.isRandom)
        randomBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()
