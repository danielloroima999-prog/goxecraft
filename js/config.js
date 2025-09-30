// ============================================
// CONFIGURACIÓN GLOBAL DEL JUEGO
// ============================================

// Tipos de bloques disponibles
const BLOCK_TYPES = [
    {
        id: 0,
        name: 'Pasto',
        color: '#7CFC00',
        transparent: false,
        solid: true
    },
    {
        id: 1,
        name: 'Tierra',
        color: '#8B4513',
        transparent: false,
        solid: true
    },
    {
        id: 2,
        name: 'Piedra',
        color: '#808080',
        transparent: false,
        solid: true
    },
    {
        id: 3,
        name: 'Madera',
        color: '#DEB887',
        transparent: false,
        solid: true
    },
    {
        id: 4,
        name: 'Arena',
        color: '#F4A460',
        transparent: false,
        solid: true
    },
    {
        id: 5,
        name: 'Agua',
        color: '#1E90FF',
        transparent: true,
        solid: false
    }
];

// Configuración del mundo
const WORLD_CONFIG = {
    CHUNK_SIZE: 16,
    CHUNK_HEIGHT: 64,
    RENDER_DISTANCE: 4,
    BLOCK_SIZE: 1,
    SEA_LEVEL: 32,
    TREE_PROBABILITY: 0.02
};

// Configuración del jugador
const PLAYER_CONFIG = {
    HEIGHT: 1.8,
    WIDTH: 0.6,
    SPEED: 5,
    SPRINT_MULTIPLIER: 1.5,
    JUMP_FORCE: 8,
    GRAVITY: 20,
    REACH_DISTANCE: 5,
    FLY_SPEED: 10
};

// Configuración de controles
const CONTROLS_CONFIG = {
    MOUSE_SENSITIVITY: 0.002,
    TOUCH_SENSITIVITY: 0.003,
    JOYSTICK_DEADZONE: 0.1
};

// Configuración de renderizado
const RENDER_CONFIG = {
    FOV: 75,
    NEAR: 0.1,
    FAR: 1000,
    FOG_NEAR: 50,
    FOG_FAR: 200,
    FOG_COLOR: 0x87CEEB,
    AMBIENT_LIGHT: 0x404040,
    DIRECTIONAL_LIGHT: 0xffffff,
    SHADOW_MAP_SIZE: 2048
};

// Configuración móvil
const MOBILE_CONFIG = {
    JOYSTICK_SIZE: 120,
    BUTTON_SIZE: 60,
    REDUCED_RENDER_DISTANCE: 3,
    REDUCED_SHADOW_MAP: 1024
};

console.log('✅ Config.js cargado correctamente');
