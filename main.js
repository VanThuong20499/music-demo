const PLAYER_STORAFE_KEY = 'f8_play';
var cd = document.querySelector('.cd');
var heading = document.querySelector('header h2');
var cdThumb = document.querySelector('.cd-thumb');
var audio = document.querySelector('#audio');
var playBtn = document.querySelector('.btn.btn-toggle-play');
var player = document.querySelector('.player');
var progress = document.querySelector('.progress');
var next = document.querySelector('.btn-next');
var preBtn = document.querySelector('.btn-prev');
var randomBtn = document.querySelector('.btn-random');
var repeataBtn = document.querySelector('.btn-repeat');
var clickSong = document.querySelector('.playlist');
var app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeata: false,
    settings: JSON.parse(localStorage.getItem(PLAYER_STORAFE_KEY)) || {},
    songs: [
        {
            name: 'Mang Tiền Về Cho Mẹ',
            singer: 'Đen',
            path: './assets/music/song1.mp3',
            image:'./assets/img/song1.jpg'
        },
        {
            name: 'Cảm Ơn',
            singer: 'Đen',
            path: './assets/music/song2.mp3',
            image:'./assets/img/song2.jpg'
        },
        {
            name: 'Trời Ơi Con Chưa Muốn Chết',
            singer: 'Đen',
            path: './assets/music/song3.mp3',
            image:'./assets/img/song3.jpg'
        }
    ],
    setSetting: function(key, value){
        this.settings[key] = value;
        localStorage.setItem(PLAYER_STORAFE_KEY, JSON.stringify(this.settings));
    },
    definePropertie: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        })
    },
    render: function(){
        var htmls = this.songs.map((value, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${value.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${value.name}</h3>
                        <p class="author">${value.singer}</p>
                    </div>
                        <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        var html = htmls.join('');
        var playlist = document.querySelector('.playlist');
        playlist.innerHTML = html;
    },
    handleEvents: function(){
        var cdWidth = cd.offsetWidth;
        const _this = this;
        // Xu ly phong to thu nho cd
        document.addEventListener('scroll', function(){
            var scrollY = window.scrollY || document.documentElement.scrollTop;
            cd.style.width = cdWidth - scrollY > 0 ? `${cdWidth - scrollY}px` : 0;
            cd.style.opacity = (cdWidth-scrollY)/cdWidth;
        })

        // xu ly khi click play
        playBtn.addEventListener('click', function(){
            if(_this.isPlaying){
                audio.pause();
            }
            else{
                audio.play();
            }
        })
        // Khi bat nhac
        audio.addEventListener('play',function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        })

        // Khi tat nhac
        audio.addEventListener('pause',function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        })

        // tien do cua bai hat
        audio.addEventListener('timeupdate', function(){
            if(this.duration){
                progress.value = `${this.currentTime/this.duration*100}`;
            }
        })

        // khi tua 
        progress.addEventListener('input', function(e){
            if(audio.duration){
                audio.currentTime = audio.duration / 100 * e.target.value;
            }
        })

        // Xu ly CD quay va dung
        const cdThumbAnimate =  cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ],{
            duration: 10000, // 10 secon
            iterations: Infinity
        })

        cdThumbAnimate.pause();

        // Xu ly next
        next.addEventListener('click', function(){
            if(_this.isRandom){
                _this.playRandom();
            }else{
                _this.nextSongs();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        })

        // khi pre bai hat

        preBtn.addEventListener('click', function(){
            if(_this.isRandom){
                _this.playRandom();
            }else{
                _this.prevSongs();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        })

        // khi random
        randomBtn.addEventListener('click', function(e){
            _this.isRandom = !_this.isRandom;
            _this.setSetting('isRandom', _this.isRandom);
            this.classList.toggle('active', _this.isRandom);

        })

        // Next khi bai hat ket thuc
        audio.addEventListener('ended', function(){
            if(_this.isRepeata){
                audio.play();
            }else{
                next.click();
            }
        })

        //Lap lai khi bai hat ket thuc
        repeataBtn.addEventListener('click', function(){
            _this.isRepeata = !_this.isRepeata;
            _this.setSetting('isRepeata', _this.isRepeata);
            this.classList.toggle('active', _this.isRepeata);
        })

        // Click vao bai hat
        clickSong.addEventListener('click', function(e){
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')){
                if(songNode){
                    _this.currentIndex = Number(songNode.getAttribute('data-index'));
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                    e.target.closest('.song').classList.add('active');
                }
                if(e.target.closest('.option')){

                }
            }
        })
    },
    loadCurrentSong: function(){
        heading.innerText = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;

    },
    nextSongs: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
     
    loadSetting: function(){
        this.isRandom = this.settings.isRandom;
        this.isRepeata = this.settings.isRepeata;
    },

    prevSongs: function(){
        this.currentIndex--;
        if(this.currentIndex < 0 ){
            this.currentIndex = this.songs.length-1;
        }
        this.loadCurrentSong();
    },

    playRandom: function(){
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    scrollToActiveSong: function(){
        setTimeout(() => {
            document.querySelector('.song.active').scrollIntoView({
                behavior: "smooth",
                block: 'center'
            });
        }, 0)
    },


    start: function(){
        //Gan cau hinh tu Setting vao ung dung
        this.loadSetting();
        // Định nghĩa thuộc tính co Object
        this.definePropertie();
        // Lắng nghe Sự Kiện
        this.handleEvents();
        // Tai Thong tin bai hat dau tien vao Ui
        this.loadCurrentSong();
        //Render code HTML
        this.render();
        // Hien thi lai trang bat dau cua button
        randomBtn.classList.toggle('active', this.isRandom);
        repeataBtn.classList.toggle('active', this.isRandom);
    }
}
app.start();