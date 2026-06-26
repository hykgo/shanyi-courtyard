/* GLOBAL SYSTEM STATE */
        let activeIdentity = '26级萌新';
        let currentPhotoIndex = 0;
        let audioContext = null;
        let synthInterval = null;
        let isMusicPlaying = false;
        let isSubmittingMessage = false;
        
        // Window on-load
        window.onload = function() {
            // Spawn subtle falling elements across screen
            spawnPetalsLoop();
            
            // Set initial state selectors
            selectIdentity('26级萌新');
            startMockBulletFlow();
            loadMessages();
            
            // Initiate polaroid swipe listeners
            initPolaroidSwipe();
        };

        // Elegant gate sliding with CSS Spring and Delay
        function openTheGate() {
            const leftDoor = document.getElementById('left-door');
            const rightDoor = document.getElementById('right-door');
            const gateHud = document.getElementById('gate-hud');
            const gateOverlay = document.getElementById('gate-overlay');
            const mainContent = document.getElementById('main-content');
            
            gateHud.style.opacity = '0';
            
            leftDoor.style.transform = 'translateX(-100%)';
            rightDoor.style.transform = 'translateX(100%)';
            
            mainContent.classList.remove('opacity-0');
            mainContent.classList.add('opacity-100');
            
            setTimeout(() => {
                gateOverlay.style.display = 'none';
                showToast('✨ 扉门大启，伴风而行 ✨', 'fa-moon');
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

        // Timeline dataset
        const timelineData = [
            {
                date: '2025年7月7日 · 临沂平邑',
                title: '第一所文艺小院落地 🏡',
                desc: '落子沂蒙山村。师生利用当地自然黏土材料，现场雕砌具有山乡气度的艺术创客工作室，启动首个非遗美育与大地写生夏令营。艺术不再只是宣纸上的笔墨，更是与土地并肩呼吸的温度。',
                img: 'https://placehold.co/600x400/F0E9DF/2C5E43?text=Pingyi+Artistic+Courtyard'
            },
            {
                date: '2025年7月8日 · 菏泽定陶',
                title: '第二所文艺小院落地 🎨',
                desc: '在牡丹深处探寻齐鲁民俗气脉。结合定陶鲁西南剪纸、非物质陶艺工艺，师生协力开辟少儿公益第二课堂，为乡村孩子建造了一所“没有围墙的自然美术院落”，将大山黄土浸润斑斓创意。',
                img: 'https://placehold.co/600x400/F0E9DF/2C5E43?text=Dingtao+Artistic+Courtyard'
            },
            {
                date: '2026年4月1日 · 长清双泉',
                title: '第三所文艺小院落地 🌸',
                desc: '水波激荡处，樱花正怒放。长清双泉小院定位为“写生孵化与生态文旅实践地”。驻院艺术家以此山野为纸，引风拨弹琴弦，构建诗意美学研学环带，将田间闲置民居化作新中式精神桃花坞。',
                img: 'https://placehold.co/600x400/F0E9DF/2C5E43?text=Shuangquan+Artistic+Courtyard'
            },
            {
                date: '2026年4月17日 · 山东省青少年宫',
                title: '文艺小院再添新阵地 🏛️',
                desc: '山艺文艺风采进驻少年宫，共同孵化“大美育少儿先锋合唱基地”。在这里，老中青艺术家代际相传，举行常态化周末草坪合唱会和陶塑文创实践节，打造触手可及的都市美学温室。',
                img: 'https://placehold.co/600x400/F0E9DF/2C5E43?text=Youth+Palace+Courtyard'
            },
            {
                date: '2026年5月27日 · 长清大学城实验学校',
                title: '第四所文艺小院落地 🏫',
                desc: '携手构建高品质大学实验美育新校落。通过非遗文化互动展览、乐器现场演出及先锋绘画涂鸦，实现大、中、小学一体融合。将艺术的火种播种给未来之树，在校园激发起艺术浪漫狂想。',
                img: 'https://placehold.co/600x400/F0E9DF/2C5E43?text=University+Artistic+Courtyard'
            }
        ];

        function openTimelineModal(index) {
            const data = timelineData[index];
            document.getElementById('modal-date').innerText = data.date;
            document.getElementById('modal-title').innerText = data.title;
            document.getElementById('modal-desc').innerText = data.desc;
            document.getElementById('modal-image').style.backgroundImage = `url('${data.img}')`;
            
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

        // Polaroid card deck transformations
        const polaroids = document.querySelectorAll('.polaroid-card');
        
        function updatePolaroidStack() {
            polaroids.forEach((card, i) => {
                let offset = i - currentPhotoIndex;
                if (offset < 0) {
                    offset += polaroids.length;
                }
                
                if (offset === 0) {
                    card.style.transform = 'translate3d(0, 0, 0) rotate(1deg) scale(1)';
                    card.style.opacity = '1';
                    card.style.zIndex = '30';
                } else if (offset === 1) {
                    card.style.transform = 'translate3d(14px, 10px, 0) rotate(-5deg) scale(0.95)';
                    card.style.opacity = '0.85';
                    card.style.zIndex = '20';
                } else {
                    card.style.transform = 'translate3d(-12px, 14px, 0) rotate(4deg) scale(0.9)';
                    card.style.opacity = '0.7';
                    card.style.zIndex = '10';
                }
            });
        }

        function nextPhoto() {
            currentPhotoIndex = (currentPhotoIndex + 1) % polaroids.length;
            updatePolaroidStack();
        }

        function prevPhoto() {
            currentPhotoIndex = (currentPhotoIndex - 1 + polaroids.length) % polaroids.length;
            updatePolaroidStack();
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
            
            updatePolaroidStack();
        }

        // Ambient sound synthesiser engine (With built-in Delay Feedback Loop for huge spatial resonance)
        const poemLines = [
            '"山前微风起，我们在文艺小院等你"',
            '"竹影扫阶尘不动，心弦一抚曲自生"',
            '"在大地写就诗行，用笔尖温润这山河风貌"',
            '"暮钟敲碎林梢，看落日余晖点燃金色琴键"',
            '"泉声漫进轩窗，弹奏出美院少年独有的梦"'
        ];
        let poemIndex = 0;

        function toggleSynthMusic() {
            if (isMusicPlaying) {
                stopAmbientMusic();
            } else {
                startAmbientMusic();
            }
        }

        function startAmbientMusic() {
            try {
                if (!audioContext) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                
                isMusicPlaying = true;
                document.getElementById('play-icon').className = "fas fa-pause text-xs text-yard-wood";
                document.getElementById('player-indicator').classList.remove('opacity-0');
                document.getElementById('player-indicator').classList.add('opacity-100');
                document.getElementById('track-title').innerText = "🔊 治愈风雅和弦 · 空灵声学播放中";
                
                // Traditional Pentatonic Scale chords (C G C E / A E A C / F C F A / G D G B)
                const chordProgression = [
                    [130.81, 196.00, 261.63, 329.63], 
                    [110.00, 164.81, 220.00, 261.63], 
                    [87.31, 130.81, 174.61, 220.00],  
                    [98.00, 146.83, 196.00, 246.94]   
                ];
                let chordStep = 0;

                // Create feedback delay system for spacious wabi-sabi echo
                const mainDelay = audioContext.createDelay(1.0);
                mainDelay.delayTime.setValueAtTime(0.45, audioContext.currentTime);

                const delayFeedback = audioContext.createGain();
                delayFeedback.gain.setValueAtTime(0.4, audioContext.currentTime);

                mainDelay.connect(delayFeedback);
                delayFeedback.connect(mainDelay); // closed feedback loop
                
                const delayGain = audioContext.createGain();
                delayGain.gain.setValueAtTime(0.08, audioContext.currentTime);
                mainDelay.connect(delayGain);
                delayGain.connect(audioContext.destination);

                function playWarmPluck(freq, delaySec, duration = 3.5) {
                    const osc = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, audioContext.currentTime + delaySec);
                    
                    // Gentle envelope curve
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime + delaySec);
                    gainNode.gain.linearRampToValueAtTime(0.07, audioContext.currentTime + delaySec + 0.12);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + delaySec + duration);
                    
                    // Warm lowpass filter to emulate wood instrument resonate
                    const filter = audioContext.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(550, audioContext.currentTime + delaySec);
                    
                    osc.connect(filter);
                    filter.connect(gainNode);
                    
                    // Direct to out & feedback line
                    gainNode.connect(audioContext.destination);
                    gainNode.connect(mainDelay);
                    
                    osc.start(audioContext.currentTime + delaySec);
                    osc.stop(audioContext.currentTime + delaySec + duration + 0.5);
                }

                function playWindChime() {
                    const randomFreq = 950 + Math.random() * 1100;
                    const delay = Math.random() * 3.2;
                    
                    const osc = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(randomFreq, audioContext.currentTime + delay);
                    
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
                    gainNode.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + delay + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + delay + 1.6);
                    
                    osc.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    gainNode.connect(mainDelay);
                    
                    osc.start(audioContext.currentTime + delay);
                    osc.stop(audioContext.currentTime + delay + 2.0);
                }

                // 4 seconds interval step sequencer
                function tickMusic() {
                    const chord = chordProgression[chordStep];
                    chord.forEach((freq, idx) => {
                        // Spread notes for arpeggio warmth
                        playWarmPluck(freq, idx * 0.18);
                    });
                    
                    playWindChime();
                    if(Math.random() > 0.45) playWindChime();
                    
                    chordStep = (chordStep + 1) % chordProgression.length;

                    // Poem subtitle rotation
                    poemIndex = (poemIndex + 1) % poemLines.length;
                    const scrollingPoem = document.getElementById('scrolling-poem');
                    scrollingPoem.style.transform = 'translateY(-20px)';
                    scrollingPoem.style.opacity = '0';
                    setTimeout(() => {
                        scrollingPoem.innerText = poemLines[poemIndex];
                        scrollingPoem.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            scrollingPoem.style.transform = 'translateY(0)';
                            scrollingPoem.style.opacity = '1';
                        }, 50);
                    }, 400);
                }

                tickMusic();
                synthInterval = setInterval(tickMusic, 4200);
                showToast('🎻 竹风和弦电台开始低吟...', 'fa-music');
                
            } catch(e) {
                console.warn(e);
                showToast('设备不支持原生声学合成器', 'fa-volume-mute');
            }
        }

        function stopAmbientMusic() {
            isMusicPlaying = false;
            if (synthInterval) clearInterval(synthInterval);
            document.getElementById('play-icon').className = "fas fa-play text-xs translate-x-0.5 text-yard-wood";
            document.getElementById('player-indicator').classList.remove('opacity-100');
            document.getElementById('player-indicator').classList.add('opacity-0');
            document.getElementById('track-title').innerText = "山前微风吟 · 自然和弦 (已暂停)";
            showToast('🎵 电台已合弦收回', 'fa-volume-mute');
        }

        // Identity Selector Highlight
        function selectIdentity(identityName) {
            activeIdentity = identityName;
            
            const tags = document.querySelectorAll('.identity-tag');
            tags.forEach(tag => {
                if (tag.innerText.trim() === identityName) {
                    tag.classList.add('bg-yard-darkGreen', 'text-yard-cream', 'border-transparent');
                    tag.classList.remove('bg-yard-cream', 'text-yard-charcoal/80', 'border-yard-wood/40');
                } else {
                    tag.classList.remove('bg-yard-darkGreen', 'text-yard-cream', 'border-transparent');
                    tag.classList.add('bg-yard-cream', 'text-yard-charcoal/80', 'border-yard-wood/40');
                }
            });
        }

        // Bullet Wall scroller
        function startMockBulletFlow() {
            const scroller = document.getElementById('bullet-scroller');
            const additionalBullets = [
                { id: '26级萌新', text: '“平邑文艺小院听说都是葵花，好想带个速写本画上一整天！”' },
                { id: '知心学姐', text: '“这里的落日跟手冲茶极配，你会爱上山艺的静谧时光。”' },
                { id: '驻院艺术家', text: '“泥土与星空才是真正的画布，在这里，我们离自由很近。”' },
                { id: '温暖学长', text: '“别担心开学。小院里的风，早已吹暖了你前行的路。”' }
            ];
            
            let bulletIndex = 0;
            setInterval(() => {
                const bullet = additionalBullets[bulletIndex];
                
                const div = document.createElement('div');
                div.className = "bullet-item text-[11px] bg-white/70 p-3 rounded-xl border border-yard-lightGreen/30 shadow-xs text-yard-charcoal/90 leading-relaxed tracking-wider transition-all opacity-0 -translate-y-2";
                
                div.innerHTML = buildBulletMarkup(bullet.id, bullet.text.replace(/^“|”$/g, ''), new Date().toISOString());
                
                scroller.appendChild(div);
                
                setTimeout(() => {
                    div.classList.remove('opacity-0', '-translate-y-2');
                    div.classList.add('opacity-100', 'translate-y-0');
                }, 10);
                
                scroller.scrollTop = scroller.scrollHeight;
                
                if(scroller.children.length > 18) {
                    scroller.children[0].remove();
                }
                
                bulletIndex = (bulletIndex + 1) % additionalBullets.length;
            }, 3800);
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
                if (!messages.length) return;

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
