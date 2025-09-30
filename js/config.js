/**
 * Goxecraft - Configuración del juego
 * Todas las constantes y configuraciones centralizadas
 */

const CONFIG = {
    // Configuración del mundo
    WORLD: {
        CHUNK_SIZE: 16,          // Tamaño de cada chunk
        RENDER_DISTANCE: 4,      // Distancia de renderizado en chunks
        WORLD_HEIGHT: 64,        // Altura máxima del mundo
        SEA_LEVEL: 32,           // Nivel del mar
        BLOCK_SIZE: 1,           // Tamaño de cada bloque
    },

    // Configuración del jugador
    PLAYER: {
        HEIGHT: 1.8,             // Altura del jugador
        SPEED: 5,                // Velocidad de movimiento
        SPRINT_MULTIPLIER: 1.5,  // Multiplicador de velocidad al correr
        FLY_SPEED: 10,           // Velocidad de vuelo
        JUMP_FORCE: 8,           // Fuerza de salto
        GRAVITY: 20,             // Gravedad
        REACH: 5,                // Alcance para colocar/romper bloques
        MOUSE_SENSITIVITY: 0.002, // Sensibilidad del mouse
    },

    // Configuración de generación de terreno
    TERRAIN: {
        SEED: Math.random() * 10000,
        SCALE: 0.05,             // Escala del ruido Perlin
        OCTAVES: 4,              // Número de octavas para el ruido
        PERSISTENCE: 0.5,        // Persistencia del ruido
        LACUNARITY: 2.0,         // Lacunaridad del ruido
        HEIGHT_MULTIPLIER: 20,   // Multiplicador de altura
        TREE_CHANCE: 0.02,       // Probabilidad de generar un árbol
    },

    // Configuración de rendimiento
    PERFORMANCE: {
        MAX_BLOCKS_PER_FRAME: 100,  // Máximo de bloques a generar por frame
        FRUSTUM_CULLING: true,       // Activar frustum culling
        FACE_CULLING: true,          // Activar face culling (no renderizar caras ocultas)
        USE_INSTANCING: true,        // Usar instancing para bloques similares
        SHADOW_QUALITY: 'medium',    // Calidad de sombras: 'low', 'medium', 'high'
    },

    // Configuración de controles
    CONTROLS: {
        MOBILE_THRESHOLD: 768,   // Ancho de pantalla para activar controles móviles
        JOYSTICK_DEADZONE: 0.1,  // Zona muerta del joystick
        TOUCH_SENSITIVITY: 0.003, // Sensibilidad táctil
    },

    // Configuración visual
    GRAPHICS: {
        FOV: 75,                 // Campo de visión
        NEAR: 0.1,               // Plano cercano
        FAR: 1000,               // Plano lejano
        FOG_ENABLED: true,       // Activar niebla
        FOG_COLOR: 0x87CEEB,     // Color de la niebla (azul cielo)
        FOG_NEAR: 50,            // Inicio de la niebla
        FOG_FAR: 150,            // Fin de la niebla
        AMBIENT_LIGHT: 0.6,      // Intensidad de luz ambiental
        DIRECTIONAL_LIGHT: 0.8,  // Intensidad de luz direccional
    },

    // Teclas de control
    KEYS: {
        FORWARD: ['KeyW', 'ArrowUp'],
        BACKWARD: ['KeyS', 'ArrowDown'],
        LEFT: ['KeyA', 'ArrowLeft'],
        RIGHT: ['KeyD', 'ArrowRight'],
        JUMP: ['Space'],
        SPRINT: ['ShiftLeft', 'ShiftRight'],
        FLY: ['KeyF'],
        INVENTORY_1: ['Digit1'],
        INVENTORY_2: ['Digit2'],
        INVENTORY_3: ['Digit3'],
        INVENTORY_4: ['Digit4'],
        INVENTORY_5: ['Digit5'],
        INVENTORY_6: ['Digit6'],
    }
};

// Detectar si es dispositivo móvil
CONFIG.IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= CONFIG.CONTROLS.MOBILE_THRESHOLD;

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}