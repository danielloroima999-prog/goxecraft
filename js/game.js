// ============================================
// MOTOR PRINCIPAL DEL JUEGO
// ============================================

class Game {
    constructor() {
        // Three.js
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Sistemas del juego
        this.blockManager = null;
        this.world = null;
        this.player = null;
        this.controls = null;
        
        // Loop
        this.clock = new THREE.Clock();
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;
        this.fpsUpdateInterval = 0;
        
        // Estado
        this.isRunning = false;
        this.isPaused = false;
    }

    /**
     * Inicializa el juego
     */
    init() {
        console.log('🎮 Iniciando Goxecraft...');
        
        try {
            this.initThreeJS();
            this.initSystems();
            this.initWorld();
            this.initPlayer();
            this.initControls();
            this.start();
            
            console.log('✅ Juego iniciado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar el juego:', error);
            throw error;
        }
    }

    /**
     * Inicializa Three.js
     */
    initThreeJS() {
        console.log('Inicializando Three.js...');
        
        // Escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(RENDER_CONFIG.FOG_COLOR);
        
        // Niebla
        this.scene.fog = new THREE.Fog(
            RENDER_CONFIG.FOG_COLOR,
            RENDER_CONFIG.FOG_NEAR,
            RENDER_CONFIG.FOG_FAR
        );
        
        // Cámara
        this.camera = new THREE.PerspectiveCamera(
            RENDER_CONFIG.FOV,
            window.innerWidth / window.innerHeight,
            RENDER_CONFIG.NEAR,
            RENDER_CONFIG.FAR
        );
        
        // Renderer
        const container = document.getElementById('canvas-container');
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        container.appendChild(this.renderer.domElement);
        
        // Luces
        const ambientLight = new THREE.AmbientLight(RENDER_CONFIG.AMBIENT_LIGHT, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(RENDER_CONFIG.DIRECTIONAL_LIGHT, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        
        // Configurar sombras
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.mapSize.width = RENDER_CONFIG.SHADOW_MAP_SIZE;
        directionalLight.shadow.mapSize.height = RENDER_CONFIG.SHADOW_MAP_SIZE;
        
        this.scene.add(directionalLight);
        
        // Resize handler
        window.addEventListener('resize', () => this.onWindowResize());
        
        console.log('✅ Three.js inicializado');
    }

    /**
     * Inicializa los sistemas del juego
     */
    initSystems() {
        console.log('Inicializando sistemas...');
        this.blockManager = new BlockManager();
        console.log('✅ Sistemas inicializados');
    }

    /**
     * Inicializa el mundo
     */
    initWorld() {
        console.log('Generando mundo...');
        this.world = new World(this.scene, this.blockManager);
        console.log('✅ Mundo generado');
    }

    /**
     * Inicializa el jugador
     */
    initPlayer() {
        console.log('Configurando jugador...');
        
        this.player = new Player(this.camera, this.world);
        
        // Encontrar posición de spawn
        const spawnX = 0;
        const spawnZ = 0;
        const spawnY = this.world.getHeightAt(spawnX, spawnZ) + 5;
        
        this.player.position.set(spawnX, spawnY, spawnZ);
        this.camera.position.copy(this.player.position);
        
        console.log(`✅ Jugador spawneado en (${spawnX}, ${spawnY}, ${spawnZ})`);
    }

    /**
     * Inicializa los controles
     */
    initControls() {
        console.log('Inicializando controles...');
        this.controls = new Controls(this.player, this.camera, this.renderer.domElement);
        console.log('✅ Controles inicializados');
    }

    /**
     * Inicia el loop del juego
     */
    start() {
        console.log('Iniciando loop del juego...');
        this.isRunning = true;
        this.clock.start();
        this.lastTime = performance.now();
        this.animate();
    }

    /**
     * Pausa el juego
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Reanuda el juego
     */
    resume() {
        this.isPaused = false;
    }

    /**
     * Loop principal del juego
     */
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        if (this.isPaused) return;
        
        // Calcular delta time
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        // Actualizar FPS cada 0.5 segundos
        this.fpsUpdateInterval += deltaTime;
        if (this.fpsUpdateInterval >= 0.5) {
            this.fps = Math.round(1 / deltaTime);
            this.updateHUD();
            this.fpsUpdateInterval = 0;
        }
        
        // Actualizar controles
        this.controls.update(deltaTime);
        
        // Actualizar jugador
        this.player.update(deltaTime);
        
        // Actualizar mundo (chunks)
        this.world.update(this.player.position);
        
        // Renderizar
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Actualiza el HUD
     */
    updateHUD() {
        if (typeof window.updateHUD === 'function') {
            window.updateHUD({
                fps: this.fps,
                position: this.player.position,
                selectedBlock: this.player.selectedBlockType,
                flying: this.player.isFlying
            });
        }
    }

    /**
     * Maneja el resize de la ventana
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Limpia recursos del juego
     */
    dispose() {
        console.log('Limpiando recursos del juego...');
        
        this.isRunning = false;
        
        if (this.controls) {
            this.controls.dispose();
        }
        
        if (this.world) {
            this.world.dispose();
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        console.log('✅ Recursos limpiados');
    }
}

console.log('✅ Game.js cargado correctamente');
