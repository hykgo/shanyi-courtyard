/* GLOBAL SYSTEM STATE */
        let activeIdentity = '26级萌新';
        let currentPhotoIndex = 0;
        let galleryUpdateToken = 0;
        const galleryImageCache = new Map();
        const galleryPhotos = Array.from({ length: 102 }, (_, index) => {
            const number = String(index + 1).padStart(3, '0');
            return {
                src: `./assets/gallery/photo-${number}.jpg`,
                caption: '文艺小院'
            };
        });
        const priorityImageUrls = [
            './assets/wenyi-logo-transparent.png',
            './assets/hero-courtyard.png',
            './assets/story/pingyi-stage.jpeg',
            './assets/story/image1.jpeg',
            './assets/story/image9.jpeg',
            './assets/story/image12.png',
            './assets/story/image17.jpeg',
            './assets/gallery/photo-001.jpg',
            './assets/gallery/photo-002.jpg',
            './assets/gallery/photo-003.jpg',
            './assets/gallery/photo-004.jpg',
            './assets/gallery/photo-005.jpg'
        ];
        const imageWarmCache = new Map();
        const articleArchive = [
            { icon: 'fa-seedling', title: '奋斗的青春丨2025 年暑期“三下乡”12：青春筑梦三下乡，艺启同行新征程', url: 'https://mp.weixin.qq.com/s/sxVRmmy4WpbdwSRZz3cZuw' },
            { icon: 'fa-hands-holding-child', title: '奋斗的青春丨挂牌！第三所“文艺小院”', url: 'https://mp.weixin.qq.com/s/gY9AGyGz2da-88MoDxrqYw' },
            { icon: 'fa-palette', title: '奋斗的青春丨“文艺小院”再添新阵地！', url: 'https://mp.weixin.qq.com/s/GjqEHuuhjlqg0mzheSCa8w' },
            { icon: 'fa-scale-balanced', title: '奋斗的青春丨大手拉小手，第四所“文艺小院”落地！', url: 'https://mp.weixin.qq.com/s/h3r1umtWv-b7zO5eOFG6qw' },
            { icon: 'fa-camera-retro', title: '奋斗的青春｜双泉镇小学，“种下美好”第一课', url: 'https://mp.weixin.qq.com/s/sdTCQXtME-mRz73atsf3iA' },
            { icon: 'fa-sun', title: '种下美好丨双泉镇小学2：共赴一场成长之约！', url: 'https://mp.weixin.qq.com/s/6AFv0hcwMvxqGlrr82CTnA' },
            { icon: 'fa-feather', title: '奋斗的青春丨双泉镇小学3：以艺扎根，奔赴成长山海', url: 'https://mp.weixin.qq.com/s/bjTQednm2mcvibp04pA51Q' },
            { icon: 'fa-school', title: '民法典宣传月｜双泉镇小学5：大手拉小手，一起学民法典', url: 'https://mp.weixin.qq.com/s/t98l8imX3HBqL4WADRAiKg' },
            { icon: 'fa-people-group', title: '奋斗的青春丨双泉镇小学6：捕捉可爱瞬间，发现闪光的你', url: 'https://mp.weixin.qq.com/s/dRzaQ9Nqs4HmXjMth-xeUg' },
            { icon: 'fa-pen-nib', title: '种下美好 | 双泉镇小学7：生如夏花，让每个孩子都绚烂绽放！', url: 'https://mp.weixin.qq.com/s/lggYmHb6BqdwBLZCJKFP7A' },
            { icon: 'fa-leaf', title: '种下美好 | 双泉镇小学8：最后一课，不说再见！本学期收官啦！', url: 'https://mp.weixin.qq.com/s/HMCNxSDlFi6TiQ3_LOUhgQ' },
            { icon: 'fa-graduation-cap', title: '种下美好丨大学城实验学校1：第一次见面，青春与童真相遇', url: 'https://mp.weixin.qq.com/s/VWI2rEEakjOa4lcVconIqA' }
        ];
        let audioContext = null;
        let isMusicPlaying = false;
        let musicStepTimer = null;
        let gateMusicPulse = null;
        let isSubmittingMessage = false;
        
        // Window on-load
        window.onload = function() {
            // Spawn subtle falling elements across screen
            spawnPetalsLoop();
            
            // Set initial state selectors
            selectIdentity('26级萌新');
            loadMessages();
            renderArticleArchive();
            
            // Initiate polaroid swipe listeners
            initPolaroidSwipe();

            warmPriorityImages();
            deferTask(() => warmGalleryImages(12));
            deferTask(() => warmGalleryImages());
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    warmGateMusicAudio();
                }, { timeout: 2000 });
            } else {
                setTimeout(() => {
                    warmGateMusicAudio();
                }, 1200);
            }
        };

        function deferTask(callback, timeout = 1500) {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(callback, { timeout });
            } else {
                setTimeout(callback, timeout);
            }
        }

        // Elegant gate sliding with CSS Spring and Delay
        function openTheGate() {
            const leftDoor = document.getElementById('left-door');
            const rightDoor = document.getElementById('right-door');
            const gateHud = document.getElementById('gate-hud');
            const gateOverlay = document.getElementById('gate-overlay');
            const mainContent = document.getElementById('main-content');
            
            gateHud.style.opacity = '0';
            gateOverlay.classList.add('mist-gate-opening');
            
            leftDoor.style.transform = 'translateX(-100%)';
            rightDoor.style.transform = 'translateX(100%)';
            
            mainContent.classList.remove('opacity-0');
            mainContent.classList.add('opacity-100');

            if (!isMusicPlaying) {
                startAmbientMusic({ silentToast: true });
            }

            setTimeout(() => {
                gateOverlay.style.display = 'none';
            }, 1500);
        }

        // Custom Toast system
        function showToast(message, iconName = 'fa-feather') {
            const toast = document.getElementById('toast');
            const text = document.getElementById('toast-text');
            const icon = document.getElementById('toast-icon');
            
            text.innerText = message;
            icon.className = `fas ${iconName} text-yard-wood`;
            
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, -12px)';
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translate(-50%, 0)';
            }, 2500);
        }

        function renderArticleArchive() {
            const grid = document.getElementById('article-archive-grid');
            const count = document.getElementById('article-archive-count');
            if (!grid) return;
            if (count) count.textContent = `共 ${articleArchive.length} 篇`;
            grid.innerHTML = articleArchive.map((item) => `
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="group bg-yard-cream/72 rounded-2xl border border-yard-wood/20 p-4 min-h-32 flex flex-col justify-between active:scale-[0.98] transition-all">
                    <span class="text-yard-terracotta text-lg block"><i class="fas ${item.icon}"></i></span>
                    <span class="font-bold text-xs text-yard-darkGreen tracking-widest leading-relaxed">${item.title}</span>
                    <span class="text-[9px] text-yard-wood/80 tracking-widest flex items-center justify-between">打开原文 <i class="fas fa-up-right-from-square text-[8px]"></i></span>
                </a>
            `).join('');
        }

        function openArticleArchiveModal() {
            const modal = document.getElementById('article-archive-modal');
            if (!modal) return;
            const inner = modal.querySelector('div');
            modal.classList.remove('pointer-events-none');
            modal.classList.add('opacity-100');
            if (inner) {
                inner.classList.remove('scale-90');
                inner.classList.add('scale-100');
            }
        }

        function closeArticleArchiveModal() {
            const modal = document.getElementById('article-archive-modal');
            if (!modal) return;
            const inner = modal.querySelector('div');
            modal.classList.add('pointer-events-none');
            modal.classList.remove('opacity-100');
            if (inner) {
                inner.classList.add('scale-90');
                inner.classList.remove('scale-100');
            }
        }

        // Timeline dataset
        const timelineData = [
            {
                date: '临沂平邑',
                title: '2025年7月7日，临沂市平邑县，第一所“文艺小院”落地 🏡',
                desc: '为进一步深化落实文艺志愿服务，以艺术赋能乡村振兴，2025年7月7日，第一所“文艺小院”在临沂市平邑县揭牌，标志着文艺助力乡村振兴的“最后一公里”正式打通。未来，这座小院将常驻艺术家、常开创作课、常办展览秀，让文艺的种子在乡土间生根发芽，结出物质与精神“双丰收”的硕果。',
                img: './assets/story/pingyi-stage.jpeg',
                links: [
                    {
                        label: '青春筑梦三下乡，艺启同行新征程',
                        url: 'https://mp.weixin.qq.com/s/sxVRmmy4WpbdwSRZz3cZuw'
                    }
                ]
            },
            {
                date: '菏泽定陶',
                title: '2025年7月8日，菏泽市定陶区半堤镇，第二所“文艺小院”落地 🎨',
                desc: '菏泽市定陶区作为我校定点帮扶区，对优质文艺资源下沉、基层艺术人才培训和常态化文化惠民活动有着迫切需求，我们将发挥文艺小院的“前哨站”和“孵化器”作用，通过定期派驻师生、开设公益课堂、挖掘地方特色非遗项目，达到“培育一支带不走的文艺队伍、打造一批本土化精品节目、形成一股长效文化造血机制”的实效，真正让文艺帮扶从“送文化”转向“种文化”。',
                img: './assets/story/image1.jpeg',
                links: [
                    {
                        label: '青春筑梦三下乡，艺启同行新征程',
                        url: 'https://mp.weixin.qq.com/s/sxVRmmy4WpbdwSRZz3cZuw'
                    }
                ]
            },
            {
                date: '长清双泉',
                title: '2026年4月1日，长清区双泉镇，第三所“文艺小院”落地 🌸',
                desc: '2026年4月1日，第三所“文艺小院”落地长清区双泉镇。双方围绕艺术支教、社团共建美育提质等展开深入交流，表示将立足校地资源，以专业优势赋能乡村教育，共筑乡村美育实践新阵地，让艺术滋养青少年成长成才。下一步，校团委将以党建带团建、青马带青年为引领，协助学校开设舞蹈、书法、话剧、戏曲等特色社团课程，把优质艺术资源下沉一线，让文艺小院成为美育育人的温暖港湾。',
                img: './assets/story/image9.jpeg',
                links: [
                    {
                        label: '挂牌！第三所“文艺小院”',
                        url: 'https://mp.weixin.qq.com/s/gY9AGyGz2da-88MoDxrqYw'
                    },
                    {
                        label: '双泉镇小学：“种下美好”第一课',
                        url: 'https://mp.weixin.qq.com/s/sdTCQXtME-mRz73atsf3iA'
                    },
                    {
                        label: '双泉镇小学2：共赴成长之约',
                        url: 'https://mp.weixin.qq.com/s/6AFv0hcwMvxqGlrr82CTnA'
                    },
                    {
                        label: '双泉镇小学：以艺扎根，奔赴成长山海',
                        url: 'https://mp.weixin.qq.com/s/bjTQednm2mcvibp04pA51Q'
                    },
                    {
                        label: '双泉镇小学5：大手拉小手，一起学民法典',
                        url: 'https://mp.weixin.qq.com/s/t98l8imX3HBqL4WADRAiKg'
                    },
                    {
                        label: '双泉镇小学：捕捉可爱瞬间',
                        url: 'https://mp.weixin.qq.com/s/dRzaQ9Nqs4HmXjMth-xeUg'
                    },
                    {
                        label: '双泉镇小学：生如夏花',
                        url: 'https://mp.weixin.qq.com/s/lggYmHb6BqdwBLZCJKFP7A'
                    },
                    {
                        label: '双泉镇小学：最后一课，不说再见',
                        url: 'https://mp.weixin.qq.com/s/HMCNxSDlFi6TiQ3_LOUhgQ'
                    }
                ]
            },
            {
                date: '山东省青少年宫',
                title: '2026年4月17日，山东省青少年宫，“文艺小院”再添新阵地 🏛️',
                desc: '山东省青少年宫作为全省青少年校外教育的重要阵地，山东艺术学院作为省内艺术人才培养与创作的重要高地，双方将秉持“资源共享、优势互补、协同育人”的原则，建立长期战略合作关系。未来，双方将在美育课程开发、文艺志愿服务、非遗文化传承、艺术社团共建等方面开展深度合作，搭建实践育人平台，推动艺术教育资源向青少年延伸，让更多山艺青年在服务一线中长本领、作贡献、亮青春。',
                img: './assets/story/image12.png',
                links: [
                    {
                        label: '“文艺小院”再添新阵地',
                        url: 'https://mp.weixin.qq.com/s/GjqEHuuhjlqg0mzheSCa8w'
                    }
                ]
            },
            {
                date: '长清大学城实验学校',
                title: '2026年5月27日，长清大学城实验学校，第四所文艺小院落地 🏫',
                desc: '作为双方深化合作的重要实践成果，该小院将依托高校艺术资源与校外教育阵地，持续开展美育课程开发、文艺志愿服务、非遗文化传承及艺术社团共建等活动，为大学城师生打造“沉浸式”艺术体验空间。未来，双方将以文艺小院为纽带，进一步推动艺术教育下沉，让青少年在校门口感受艺术之美，助力校园美育高质量发展。',
                img: './assets/story/image17.jpeg',
                links: [
                    {
                        label: '大手拉小手，第四所“文艺小院”落地',
                        url: 'https://mp.weixin.qq.com/s/h3r1umtWv-b7zO5eOFG6qw'
                    },
                    {
                        label: '大学城实验学校1：第一次见面',
                        url: 'https://mp.weixin.qq.com/s/VWI2rEEakjOa4lcVconIqA'
                    }
                ]
            }
        ];

        function openTimelineModal(index) {
            const data = timelineData[index];
            document.getElementById('modal-date').innerText = data.date;
            document.getElementById('modal-title').innerText = data.title;
            document.getElementById('modal-desc').innerText = data.desc;
            document.getElementById('modal-image').style.backgroundImage = `url('${data.img}')`;
            const linksContainer = document.getElementById('modal-links');
            linksContainer.innerHTML = '';
            (data.links || []).forEach((link, linkIndex) => {
                const anchor = document.createElement('a');
                anchor.href = link.url;
                anchor.target = '_blank';
                anchor.rel = 'noopener noreferrer';
                anchor.className = 'px-3 py-2 rounded-xl bg-yard-darkGreen/10 text-yard-darkGreen text-[10px] font-bold tracking-widest flex items-center justify-between gap-3 active:scale-[0.99] transition-all';
                anchor.innerHTML = `<span>公众号原文 ${linkIndex + 1}：${link.label}</span><i class="fas fa-up-right-from-square text-[8px] text-yard-wood"></i>`;
                linksContainer.appendChild(anchor);
            });
            
            const modal = document.getElementById('timeline-modal');
            const inner = modal.querySelector('div');
            
            modal.classList.remove('pointer-events-none');
            modal.classList.add('opacity-100');
            inner.classList.remove('scale-90');
            inner.classList.add('scale-100');
        }

        function closeTimelineModal() {
            const modal = document.getElementById('timeline-modal');
            const inner = modal.querySelector('div');
            
            modal.classList.add('pointer-events-none');
            modal.classList.remove('opacity-100');
            inner.classList.add('scale-90');
            inner.classList.remove('scale-100');
        }

        // Gallery showcase transformations
        function getGalleryWindow() {
            const total = galleryPhotos.length;
            return {
                prev: galleryPhotos[(currentPhotoIndex - 1 + total) % total],
                current: galleryPhotos[currentPhotoIndex % total],
                next: galleryPhotos[(currentPhotoIndex + 1) % total],
                strip: [0, 1, 2, 3, 4].map((offset) => {
                    const index = (currentPhotoIndex + offset) % total;
                    return { ...galleryPhotos[index], index };
                })
            };
        }

        function warmImage(src, eager = false) {
            if (!src || imageWarmCache.has(src)) return imageWarmCache.get(src);
            const img = new Image();
            img.decoding = 'async';
            img.loading = eager ? 'eager' : 'lazy';
            img.src = src;
            imageWarmCache.set(src, img);
            return img;
        }

        function warmPriorityImages() {
            priorityImageUrls.forEach((src) => warmImage(src, true));
        }

        function warmGalleryImages(limit = galleryPhotos.length) {
            const count = Math.min(limit, galleryPhotos.length);
            for (let i = 0; i < count; i += 1) {
                const photo = galleryPhotos[i];
                if (galleryImageCache.has(photo.src)) continue;
                const img = warmImage(photo.src);
                galleryImageCache.set(photo.src, img);
            }
        }

        function renderPolaroidDeck() {
            const deck = document.getElementById('photo-deck');
            if (!deck || !galleryPhotos.length) return;

            if (!deck.dataset.ready) {
                deck.innerHTML = `
                    <div class="gallery-stage">
                        <div class="gallery-main-card relative">
                            <img id="gallery-main-image" src="" alt="" class="w-full h-full object-cover">
                            <div class="gallery-main-caption">
                                <div id="gallery-main-caption" class="text-yard-cream font-brush text-lg md:text-xl leading-tight tracking-wider"></div>
                            </div>
                            <button type="button" onclick="prevPhoto()" aria-label="上一张照片" class="gallery-main-nav-zone left"></button>
                            <button type="button" onclick="nextPhoto()" aria-label="下一张照片" class="gallery-main-nav-zone right"></button>
                        </div>
                        <div class="gallery-strip-shell">
                            <div id="gallery-strip" class="gallery-strip-grid"></div>
                        </div>
                    </div>
                `;
                deck.dataset.ready = '1';
                attachGalleryTapNavigation();
            }

            syncPolaroidDeck();

            const counter = document.getElementById('photo-counter');
            if (counter) {
                counter.textContent = `${currentPhotoIndex + 1} / ${galleryPhotos.length}`;
            }
        }

        function syncPolaroidDeck() {
            const deck = document.getElementById('photo-deck');
            if (!deck || !galleryPhotos.length) return;

            const window = getGalleryWindow();
            const mainImage = document.getElementById('gallery-main-image');
            const mainCaption = document.getElementById('gallery-main-caption');
            const strip = document.getElementById('gallery-strip');
            const updateToken = ++galleryUpdateToken;

            const setMain = (photo) => {
                if (updateToken !== galleryUpdateToken) return;
                if (mainImage) {
                    mainImage.src = photo.src;
                    mainImage.alt = photo.caption;
                }
                if (mainCaption) {
                    mainCaption.textContent = photo.caption;
                }
            };

            setMain(window.current);

            if (strip) {
                strip.innerHTML = window.strip.map((photo, index) => `
                    <button onclick="selectGalleryPhoto(${photo.index})" class="gallery-thumb-card${index === 0 ? ' is-active' : ''}" aria-label="${photo.caption}">
                        <img src="${photo.src}" alt="${photo.caption}" loading="eager" decoding="async" class="gallery-thumb-image">
                    </button>
                `).join('');
            }

        }

        function nextPhoto() {
            currentPhotoIndex = (currentPhotoIndex + 1) % galleryPhotos.length;
            renderPolaroidDeck();
        }

        function prevPhoto() {
            currentPhotoIndex = (currentPhotoIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
            renderPolaroidDeck();
        }

        function selectGalleryPhoto(index) {
            const total = galleryPhotos.length;
            currentPhotoIndex = ((index % total) + total) % total;
            renderPolaroidDeck();
        }

        function initPolaroidSwipe() {
            const deck = document.getElementById('photo-deck');
            let startX = 0;
            let currentX = 0;

            deck.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            }, {passive: true});

            deck.addEventListener('touchmove', (e) => {
                currentX = e.touches[0].clientX;
            }, {passive: true});

            deck.addEventListener('touchend', () => {
                const diff = startX - currentX;
                if (Math.abs(diff) > 40) {
                    if (diff > 0) nextPhoto();
                    else prevPhoto();
                }
                startX = 0;
                currentX = 0;
            });

            renderPolaroidDeck();
        }

        function attachGalleryTapNavigation() {
            const deck = document.getElementById('photo-deck');
            if (!deck || deck.dataset.tapBound === '1') return;
            const mainCard = deck.querySelector('.gallery-main-card');
            if (!mainCard) return;

            mainCard.addEventListener('click', (event) => {
                const target = event.target;
                if (target.closest('button, a')) return;
                const rect = mainCard.getBoundingClientRect();
                const x = event.clientX - rect.left;
                if (x < rect.width / 2) {
                    prevPhoto();
                } else {
                    nextPhoto();
                }
            });

            deck.dataset.tapBound = '1';
        }

        // Local gate music player
        let gateMusicAudio = null;

        function ensureGateMusicAudio() {
            if (!gateMusicAudio) {
                gateMusicAudio = document.getElementById('gate-music-audio');
                if (!gateMusicAudio) {
                    return null;
                }
                gateMusicAudio.preload = 'auto';
                gateMusicAudio.loop = true;
                gateMusicAudio.volume = 0.75;
                gateMusicAudio.playsInline = true;
                gateMusicAudio.addEventListener('play', () => {
                    isMusicPlaying = true;
                    updateGateMusicUI(true);
                });
                gateMusicAudio.addEventListener('pause', () => {
                    if (!gateMusicAudio || gateMusicAudio.currentTime === 0 || gateMusicAudio.ended) {
                        isMusicPlaying = false;
                        updateGateMusicUI(false);
                    }
                });
                gateMusicAudio.addEventListener('ended', () => {
                    isMusicPlaying = false;
                    updateGateMusicUI(false);
                });
            }
            return gateMusicAudio;
        }

        function warmGateMusicAudio() {
            const audio = ensureGateMusicAudio();
            if (audio) {
                audio.load();
            }
        }

        function toggleSynthMusic() {
            if (isMusicPlaying) {
                stopAmbientMusic();
            } else {
                startAmbientMusic();
            }
        }

        async function startAmbientMusic(options = {}) {
            try {
                const audio = ensureGateMusicAudio();
                if (!audio) throw new Error('audio element missing');
                audio.volume = 0.75;
                audio.loop = true;
                await audio.play();
                isMusicPlaying = true;
                updateGateMusicUI(true);
            } catch (e) {
                console.warn(e);
                isMusicPlaying = false;
                updateGateMusicUI(false);
            }
        }

        function stopAmbientMusic() {
            const audio = ensureGateMusicAudio();
            if (!audio) return;
            audio.pause();
            audio.currentTime = 0;
            isMusicPlaying = false;
            updateGateMusicUI(false);
        }

        function updateGateMusicUI(playing) {
            const icon = document.getElementById('gate-music-icon');
            const btn = document.getElementById('gate-music-btn');
            if (!icon || !btn) return;
            if (playing) {
                icon.className = 'fas fa-music text-[11px] gate-music-spin text-yard-wood';
                btn.classList.add('bg-yard-lightGreen');
            } else {
                icon.className = 'fas fa-music text-[11px] text-yard-darkGreen';
                btn.classList.remove('bg-yard-lightGreen');
            }
        }

        // Identity Selector Highlight
// Identity Selector Highlight
// Identity Selector Highlight
        function selectIdentity(identityName) {
            activeIdentity = identityName;
            
            const tags = document.querySelectorAll('.identity-tag');
            tags.forEach(tag => {
                if (tag.innerText.trim() === identityName) {
                    tag.classList.add('is-selected', 'bg-yard-darkGreen', 'text-yard-cream', 'border-transparent');
                    tag.classList.remove('bg-yard-cream', 'text-yard-charcoal/80', 'border-yard-wood/40');
                } else {
                    tag.classList.remove('is-selected', 'bg-yard-darkGreen', 'text-yard-cream', 'border-transparent');
                    tag.classList.add('bg-yard-cream', 'text-yard-charcoal/80', 'border-yard-wood/40');
                }
            });
        }

        // Bullet Wall scroller
        function renderEmptyMessageState() {
            const scroller = document.getElementById('bullet-scroller');
            if (!scroller) return;

            scroller.innerHTML = `
                <div id="message-empty-state" class="h-full min-h-64 flex flex-col items-center justify-center text-center px-6 text-yard-charcoal/45">
                    <i class="fas fa-envelope-open-text text-2xl text-yard-lightGreen mb-4"></i>
                    <p class="text-xs font-bold tracking-[0.18em] text-yard-darkGreen/70">还没有真实来信</p>
                    <p class="mt-2 text-[11px] leading-relaxed tracking-wider">第一封小院短笺，等你写下。</p>
                </div>
            `;
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, (char) => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char]));
        }

        function formatMessageTime(value) {
            const date = value ? new Date(value) : new Date();
            if (Number.isNaN(date.getTime())) {
                return '刚刚';
            }

            return new Intl.DateTimeFormat('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date);
        }

        function buildBulletMarkup(name, content, createdAt, suffix = '') {
            const isNeon = name.includes('萌新');
            const tagColorClass = isNeon ? 'text-yard-terracotta' : (name.includes('学长') || name.includes('学姐') ? 'text-yard-darkGreen' : 'text-yard-wood');
            const time = formatMessageTime(createdAt);

            return `
                <div class="flex items-center justify-between gap-3 mb-1">
                    <span class="font-bold ${tagColorClass}">#${escapeHtml(name)}</span>
                    <span class="text-[9px] text-yard-charcoal/35 font-roman tracking-[0.12em] shrink-0">${escapeHtml(time)}</span>
                </div>
                <div>“${escapeHtml(content)}” ${suffix}</div>
            `;
        }

        function renderMessageItem(message, options = {}) {
            const scroller = document.getElementById('bullet-scroller');
            const div = document.createElement('div');
            div.className = "bullet-item text-[11px] bg-white/70 p-3 rounded-xl border border-yard-lightGreen/30 shadow-xs text-yard-charcoal/90 leading-relaxed tracking-wider transition-all opacity-0 scale-95";

            const name = message.name || '26级萌新';
            const content = message.content || '';
            const suffix = options.justNow ? '<span class="text-yard-terracotta text-[9px] ml-1.5 font-bold">刚刚发布</span>' : '';

            div.innerHTML = buildBulletMarkup(name, content, message.created_at, suffix);
            scroller.appendChild(div);

            requestAnimationFrame(() => {
                div.classList.remove('opacity-0', 'scale-95');
                div.classList.add('opacity-100', 'scale-100');
                scroller.scrollTop = scroller.scrollHeight;
            });

            while (scroller.children.length > 80) {
                scroller.children[0].remove();
            }
        }

        async function loadMessages() {
            try {
                const response = await fetch('/api/messages?limit=80', {
                    headers: { 'accept': 'application/json' }
                });
                if (!response.ok) return;

                const data = await response.json();
                const messages = Array.isArray(data.messages) ? data.messages : [];
                if (!messages.length) {
                    renderEmptyMessageState();
                    return;
                }

                const scroller = document.getElementById('bullet-scroller');
                scroller.innerHTML = '';
                messages.forEach((message) => renderMessageItem(message));
            } catch (error) {
                console.warn('Failed to load messages', error);
            }
        }

        async function submitMessage() {
            if (isSubmittingMessage) return;

            const textarea = document.getElementById('message-input');
            const message = textarea.value.trim();
            if (!message) {
                showToast('写下你的短笺后再发布吧', 'fa-pen-fancy');
                return;
            }

            const submitButton = document.getElementById('submit-message-btn');
            isSubmittingMessage = true;
            submitButton?.classList.add('opacity-70', 'pointer-events-none');

            try {
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: activeIdentity,
                        content: message
                    })
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(data.error || '留言发布失败');
                }

                renderMessageItem(data.message || { name: activeIdentity, content: message }, { justNow: true });
                generatePostcard();
                textarea.value = '';
            } catch (error) {
                showToast(error.message || '留言发布失败，请稍后再试', 'fa-circle-exclamation');
            } finally {
                isSubmittingMessage = false;
                submitButton?.classList.remove('opacity-70', 'pointer-events-none');
            }
        }

        // Elegant flowing petal generator for background visual depth
        function spawnPetalsLoop() {
            const container = document.getElementById('petal-container');
            const maxPetals = 8;
            
            function createPetal() {
                if(container.children.length >= maxPetals) return;
                
                const petal = document.createElement('div');
                petal.className = 'petal';
                
                // Random position & speed
                petal.style.left = Math.random() * 90 + '%';
                petal.style.width = Math.random() * 8 + 6 + 'px';
                petal.style.height = Math.random() * 12 + 8 + 'px';
                
                const duration = Math.random() * 10 + 8;
                petal.style.animationDuration = duration + 's';
                
                container.appendChild(petal);
                
                setTimeout(() => {
                    petal.remove();
                }, duration * 1000);
            }
            
            // Continuous spawn
            setInterval(createPetal, 2000);
        }

        // MUSEUM-LEVEL WATERCOLOUR POSTCARD COMPOSER (宣纸质感墨韵明信片)
        function generatePostcard() {
            const message = document.getElementById('message-input').value.trim();
            if(!message) {
                showToast('📝 写下一两句期待再雕缕吧！', 'fa-pen-fancy');
                return;
            }

            const canvas = document.getElementById('postcard-canvas');
            const ctx = canvas.getContext('2d');

            // High resolution output layout
            const exportWidth = 800;
            const exportHeight = 1000;
            canvas.width = exportWidth;
            canvas.height = exportHeight;

            showToast('🎨 宣纸泼墨中，请稍候...', 'fa-magic');

            // 1. Draw elegant Rice Paper textured base (凝脂仿古纸张色)
            ctx.fillStyle = '#FCFAF2';
            ctx.fillRect(0, 0, exportWidth, exportHeight);

            // 2. Generate exquisite mist green watercolor gradient wash
            const washGrad = ctx.createLinearGradient(0, 0, 0, exportHeight * 0.85);
            washGrad.addColorStop(0, '#EAEFE9');
            washGrad.addColorStop(0.3, '#FAF7F2');
            washGrad.addColorStop(0.75, '#FDFCF7');
            washGrad.addColorStop(1, '#EBF0EB');
            ctx.fillStyle = washGrad;
            ctx.fillRect(0, 0, exportWidth, exportHeight);

            // 3. Superimpose highly optimized paper fiber noise (模拟磨砂纸纹理)
            ctx.fillStyle = 'rgba(195, 161, 121, 0.04)';
            for (let i = 0; i < 450; i++) {
                const rx = Math.random() * exportWidth;
                const ry = Math.random() * exportHeight;
                const rLength = Math.random() * 15 + 4;
                const rThick = Math.random() * 1.5 + 0.3;
                ctx.lineWidth = rThick;
                ctx.strokeStyle = 'rgba(195,161,121,0.12)';
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(rx + rLength * Math.cos(Math.random() * Math.PI), ry + rLength * Math.sin(Math.random() * Math.PI));
                ctx.stroke();
            }

            // Outer Classic Wooden Borders
            ctx.strokeStyle = '#1F3E29';
            ctx.lineWidth = 15;
            ctx.strokeRect(30, 30, exportWidth - 60, exportHeight - 60);

            ctx.strokeStyle = '#CBB191';
            ctx.lineWidth = 2;
            ctx.strokeRect(45, 45, exportWidth - 90, exportHeight - 90);

            // 4. Draw Zen Hand-Drawn Bamboo Wash Silhouette (水墨竹影背景)
            ctx.strokeStyle = 'rgba(31, 62, 41, 0.05)';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(110, 800);
            ctx.quadraticCurveTo(130, 600, 105, 400);
            ctx.quadraticCurveTo(80, 250, 115, 100);
            ctx.stroke();

            // Draw dainty hand stroke leaves along stem
            function drawBambooLeaf(lx, ly, isLeft = true) {
                ctx.fillStyle = 'rgba(31, 62, 41, 0.06)';
                ctx.beginPath();
                if(isLeft) {
                    ctx.moveTo(lx, ly);
                    ctx.quadraticCurveTo(lx - 40, ly - 10, lx - 70, ly - 5);
                    ctx.quadraticCurveTo(lx - 35, ly + 8, lx, ly);
                } else {
                    ctx.moveTo(lx, ly);
                    ctx.quadraticCurveTo(lx + 40, ly - 15, lx + 75, ly - 8);
                    ctx.quadraticCurveTo(lx + 35, ly + 6, lx, ly);
                }
                ctx.fill();
            }
            drawBambooLeaf(120, 500, true);
            drawBambooLeaf(115, 380, false);
            drawBambooLeaf(100, 220, true);
            drawBambooLeaf(112, 160, false);

            // 5. Classic Engraved Post stamp (古典复古邮票)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(570, 80, 150, 180);
            ctx.strokeStyle = '#1F3E29';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(570, 80, 150, 180);
            
            // Stamp mini art
            ctx.fillStyle = '#E6ECE8';
            ctx.fillRect(580, 90, 130, 160);
            ctx.fillStyle = '#1F3E29';
            ctx.font = 'bold 36px "Noto Serif SC", serif';
            ctx.fillText('山艺', 615, 155);
            ctx.font = '13px "Cinzel", sans-serif';
            ctx.fillStyle = '#CBB191';
            ctx.fillText('COZY YARD 2026', 594, 215);

            // Cinnabar red postmark cancel stamp (朱砂复古日戳)
            ctx.strokeStyle = 'rgba(184, 92, 72, 0.65)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(560, 240, 52, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(560, 240, 44, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(184, 92, 72, 0.65)';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('SHANDONG ART', 522, 238);
            ctx.fillText('YARD M.Y.', 534, 256);

            // 6. Header Typography
            ctx.fillStyle = '#1F3E29';
            ctx.font = 'bold 44px "Noto Serif SC", serif';
            ctx.fillText('山艺文艺小院', 85, 130);
            ctx.font = 'bold 19px "Cinzel", serif';
            ctx.fillStyle = '#CBB191';
            ctx.fillText('COZY ARTISTIC SANCTUARY FROM SHANDONG', 85, 170);

            // Golden Divider
            ctx.strokeStyle = '#CBB191';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(85, 195);
            ctx.lineTo(520, 195);
            ctx.stroke();

            // 7. Core content text (仿墨迹柔顺排版)
            ctx.fillStyle = '#2F3431';
            ctx.font = '32px "Noto Serif SC", "Microsoft Yahei", serif';
            
            const lineGap = 68;
            const startY = 320;
            const textLines = splitTextIntoLines(ctx, message, 630);
            
            textLines.forEach((line, index) => {
                if (index < 6) { 
                    ctx.fillText(line, 85, startY + (index * lineGap));
                    // Dynamic faint ink guides
                    ctx.strokeStyle = 'rgba(195, 161, 121, 0.28)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(85, startY + (index * lineGap) + 18);
                    ctx.lineTo(715, startY + (index * lineGap) + 18);
                    ctx.stroke();
                }
            });

            // 8. Signatures & Identity Seal (朱砂篆印)
            const signatureY = 750;
            ctx.fillStyle = '#1F3E29';
            ctx.font = 'bold 28px "Noto Serif SC", serif';
            ctx.fillText(`寄信人：${activeIdentity}`, 430, signatureY);

            const today = new Date();
            const yearStr = today.getFullYear();
            const monthStr = String(today.getMonth() + 1).padStart(2, '0');
            const dayStr = String(today.getDate()).padStart(2, '0');
            ctx.fillStyle = '#2F3431';
            ctx.font = '22px "ZCOOL XiaoWei", serif';
            ctx.fillText(`公元 ${yearStr} 年 ${monthStr} 月 ${dayStr} 日`, 430, signatureY + 45);

            // Cinnabar Seal Block (红泥印记)
            ctx.fillStyle = '#B85C48';
            ctx.fillRect(660, signatureY - 20, 55, 55);
            ctx.strokeStyle = '#B85C48';
            ctx.strokeRect(658, signatureY - 22, 59, 59);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 18px "Ma Shan Zheng", cursive';
            ctx.fillText('山艺', 671, signatureY + 12);
            ctx.fillText('雅印', 671, signatureY + 34);

            // Bottom Classic Slogan
            ctx.fillStyle = '#1F3E29';
            ctx.fillRect(80, 840, 640, 80);
            ctx.fillStyle = '#FAF7F2';
            ctx.font = 'italic 21px "Noto Serif SC", serif';
            ctx.fillText('“推开文艺小院的门，开启云端漫游，遇见你的大学时光”', 122, 888);

            // Unique serial code
            ctx.fillStyle = '#2F3431';
            ctx.font = '15px monospace';
            const rndNum = Math.floor(100 + Math.random() * 900);
            ctx.fillText(`CARD NO: ${yearStr}${monthStr}${dayStr}-${rndNum}`, 80, 825);

            // Trigger postcard view popup
            const postcardModal = document.getElementById('postcard-modal');
            const inner = postcardModal.querySelector('div');
            
            postcardModal.classList.remove('pointer-events-none');
            postcardModal.classList.add('opacity-100');
            inner.classList.remove('scale-90');
            inner.classList.add('scale-100');

        }

        // Split text helper
        function splitTextIntoLines(ctx, text, maxWidth) {
            let words = text.split('');
            let lines = [];
            let currentLine = words[0] || '';

            for (let i = 1; i < words.length; i++) {
                let word = words[i];
                let width = ctx.measureText(currentLine + word).width;
                if (width < maxWidth) {
                    currentLine += word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
        }

        // Postcard Modal controller
        function closePostcardModal() {
            const postcardModal = document.getElementById('postcard-modal');
            const inner = postcardModal.querySelector('div');
            
            postcardModal.classList.add('pointer-events-none');
            postcardModal.classList.remove('opacity-100');
            inner.classList.add('scale-90');
            inner.classList.remove('scale-100');
        }

        function downloadPostcard() {
            const canvas = document.getElementById('postcard-canvas');
            try {
                const image = canvas.toDataURL("image/png");
                const link = document.createElement('a');
                link.download = `山艺小院风华明信片_${Date.now()}.png`;
                link.href = image;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToast('💾 墨宝已存入行囊，请查看系统下载', 'fa-save');
            } catch(e) {
                showToast('🌐 触屏长按画卷可将明信片存入相册', 'fa-exclamation-triangle');
            }
        }
