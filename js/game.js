/**
 * Goxecraft - Motor Principal del Juego
 * Integra todos los sistemas y maneja el loop principal
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.loadingScreen = document.getElementById('loading');
        this.loadingProgress = document.getElementById('loadingProgress');
        
        // Three.js
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Sistemas del juego
        this.world = null;
        this.player = null;
        this.controls = null;
        
        // Loop
        this.clock = new THREE.Clock();
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        
        // Estado
        this.isRunning = false;
        this.isPaused = false;
    }

    /**
     * Inicializa el juego
     */
    async init() {
        try {
            this.updateLoadingProgress(10, 'Inicializando Three.js...');
            await this.initThreeJS();
            
            this.updateLoadingProgress(30, 'Creando mundo...');
            await this.initWorld();
            
            this.updateLoadingProgress(50, 'Configurando jugador...');
            await this.initPlayer();
            
            this.updateLoadingProgress(70, 'Inicializando controles...');
            await this.initControls();
            
            this.updateLoadingProgress(90, 'Cargando chunks iniciales...');
            await this.loadInitialChunks();
            
            this.updateLoadingProgress(100, 'Listo!');
            
            // Ocultar pantalla de carga
            setTimeout(() => {
                this.loadingScreen.classList.add('hidden');
                this.start();
            }, 500);
            
        } catch (error) {
            console.error('Error al inicializar el juego:', error);
            alert('Error al cargar el juego. Por favor recarga la página.');
        }
    }

    /**
     * Inicializa Three.js
     */
    async initThreeJS() {
        // Escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.GRAPHICS.FOG_COLOR);
        
        // Niebla
        if (CONFIG.GRAPHICS.FOG_ENABLED) {
            this.scene.fog = new THREE.Fog(
                CONFIG.GRAPHICS.FOG_COLOR,
                CONFIG.GRAPHICS.FOG_NEAR,
                CONFIG.GRAPHICS.FOG_FAR
            );
        }
        
        // Cámara
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.GRAPHICS.FOV,
            window.innerWidth / window.innerHeight,
            CONFIG.GRAPHICS.NEAR,
            CONFIG.GRAPHICS.FAR
        );
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: !CONFIG.IS_MOBILE, // Desactivar antialiasing en móvil para mejor rendimiento
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limitar pixel ratio
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Luces
        const ambientLight = new THREE.AmbientLight(0xffffff, CONFIG.GRAPHICS.AMBIENT_LIGHT);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, CONFIG.GRAPHICS.DIRECTIONAL_LIGHT);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Resize handler
        window.addEventListener('resize', () => this.onWindowResize());
        
        return Promise.resolve();
    }

    /**
     * Inicializa el mundo
     */
    async initWorld() {
        this.world = new World(this.scene);
        return Promise.resolve();
    }

    /**
     * Inicializa el jugador
     */
    async initPlayer() {
        this.player = new Player(this.camera, this.world);
        
        // Encontrar una posición de spawn válida
        const spawnX = 0;
        const spawnZ = 0;
        const spawnY = this.world.getTerrainHeight(spawnX, spawnZ) + 5;
        
        this.player.teleport(spawnX, spawnY, spawnZ);
        
        // Hacer disponible globalmente para debugging
        window.game = this;
        
        return Promise.resolve();
    }

    /**
     * Inicializa los controles
     */
    async initControls() {
        this.controls = new Controls(this.player, this.canvas);
        return Promise.resolve();
    }

    /**
     * Carga los chunks iniciales
     */
    async loadInitialChunks() {
        // Generar chunks alrededor del jugador
        this.world.updateChunks(this.player.position.x, this.player.position.z);
        
        // Dar tiempo para que se generen
        return new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * Inicia el loop del juego
     */
    start() {
        this.isRunning = true;
        this.clock.start();
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
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Limitar delta
        this.lastTime = currentTime;
        
        // Actualizar FPS
        this.frameCount++;
        if (this.frameCount % 10 === 0) {
            this.fps = Math.round(1 / deltaTime);
            this.updateHUD();
        }
        
        // Actualizar jugador
        const input = this.controls.getInput();
        this.player.update(deltaTime, input);
        
        // Renderizar
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Actualiza el HUD
     */
    updateHUD() {
        document.getElementById('fps').textContent = this.fps;
        document.getElementById('position').textContent = this.player.getPositionString();
        document.getElementById('blockCount').textContent = this.world.getBlockCount();
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
     * Actualiza la barra de progreso de carga
     */
    updateLoadingProgress(percent, text) {
        this.loadingProgress.style.width = percent + '%';
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    /**
     * Limpia recursos del juego
     */
    dispose() {
        this.isRunning = false;
        
        if (this.controls) {
            this.controls.dispose();
        }
        
        if (this.world) {
            this.world.chunks.forEach(chunk => chunk.destroy());
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Inicializar el juego cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});

// Prevenir comportamientos por defecto en móvil
document.addEventListener('touchmove', (e) => {
    if (e.target === document.getElementById('gameCanvas')) {
        e.preventDefault();
    }
}, { passive: false });

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game };
}