/**
 * Goxecraft - Sistema de Controles
 * Maneja input de teclado, mouse y controles táctiles
 */

class Controls {
    constructor(player, canvas) {
        this.player = player;
        this.canvas = canvas;
        
        // Estado de teclas
        this.keys = {};
        
        // Estado de input
        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            crouch: false,
            sprint: false,
            toggleFly: false,
        };
        
        // Mouse
        this.isPointerLocked = false;
        this.mouseSensitivity = CONFIG.PLAYER.MOUSE_SENSITIVITY;
        
        // Touch
        this.touches = new Map();
        this.joystickActive = false;
        this.joystickCenter = { x: 0, y: 0 };
        this.joystickStart = { x: 0, y: 0 };
        
        // Inicializar controles
        this.initKeyboard();
        this.initMouse();
        
        if (CONFIG.IS_MOBILE) {
            this.initTouch();
            this.showMobileControls();
        }
    }

    /**
     * Inicializa controles de teclado
     */
    initKeyboard() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.updateInput();
            
            // Prevenir scroll con espacio
            if (e.code === 'Space') {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.updateInput();
        });
    }

    /**
     * Inicializa controles de mouse
     */
    initMouse() {
        // Click para capturar puntero
        this.canvas.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                this.canvas.requestPointerLock();
            }
        });

        // Eventos de pointer lock
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas;
        });

        // Movimiento del mouse
        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                this.player.rotate(
                    e.movementX * this.mouseSensitivity,
                    e.movementY * this.mouseSensitivity
                );
            }
        });

        // Click izquierdo - romper bloque
        document.addEventListener('mousedown', (e) => {
            if (this.isPointerLocked && e.button === 0) {
                this.player.breakBlock();
            }
        });

        // Click derecho - colocar bloque
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.isPointerLocked) {
                this.player.placeBlock();
            }
        });

        // Rueda del mouse - cambiar bloque
        document.addEventListener('wheel', (e) => {
            if (this.isPointerLocked) {
                e.preventDefault();
                if (e.deltaY > 0) {
                    this.player.inventory.nextBlock();
                } else {
                    this.player.inventory.previousBlock();
                }
            }
        });
    }

    /**
     * Inicializa controles táctiles
     */
    initTouch() {
        const joystick = document.getElementById('joystick');
        const joystickKnob = document.getElementById('joystickKnob');
        
        // Joystick
        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = joystick.getBoundingClientRect();
            
            this.joystickActive = true;
            this.joystickCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            this.joystickStart = {
                x: touch.clientX,
                y: touch.clientY
            };
        });

        joystick.addEventListener('touchmove', (e) => {
            if (!this.joystickActive) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.joystickCenter.x;
            const deltaY = touch.clientY - this.joystickCenter.y;
            
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = 50;
            
            let normalizedX = deltaX / maxDistance;
            let normalizedY = deltaY / maxDistance;
            
            if (distance > maxDistance) {
                normalizedX = (deltaX / distance);
                normalizedY = (deltaY / distance);
            }
            
            // Actualizar posición del knob
            joystickKnob.style.transform = `translate(-50%, -50%) translate(${normalizedX * maxDistance}px, ${normalizedY * maxDistance}px)`;
            
            // Actualizar input
            const deadzone = CONFIG.CONTROLS.JOYSTICK_DEADZONE;
            this.input.left = normalizedX < -deadzone;
            this.input.right = normalizedX > deadzone;
            this.input.forward = normalizedY < -deadzone;
            this.input.backward = normalizedY > deadzone;
        });

        joystick.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.joystickActive = false;
            joystickKnob.style.transform = 'translate(-50%, -50%)';
            this.input.left = false;
            this.input.right = false;
            this.input.forward = false;
            this.input.backward = false;
        });

        // Botones de acción
        document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.input.jump = true;
        });

        document.getElementById('jumpBtn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.input.jump = false;
        });

        document.getElementById('flyBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.input.toggleFly = true;
        });

        document.getElementById('sprintBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.input.sprint = true;
        });

        document.getElementById('sprintBtn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.input.sprint = false;
        });

        document.getElementById('breakBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.player.breakBlock();
        });

        document.getElementById('placeBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.player.placeBlock();
        });

        // Touch para mirar alrededor (fuera del joystick)
        let lastTouchX = 0;
        let lastTouchY = 0;
        let lookTouchId = null;

        this.canvas.addEventListener('touchstart', (e) => {
            // Buscar un touch que no sea del joystick
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                const rect = joystick.getBoundingClientRect();
                
                if (touch.clientX < rect.left || touch.clientX > rect.right ||
                    touch.clientY < rect.top || touch.clientY > rect.bottom) {
                    lookTouchId = touch.identifier;
                    lastTouchX = touch.clientX;
                    lastTouchY = touch.clientY;
                    break;
                }
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                
                if (touch.identifier === lookTouchId) {
                    const deltaX = touch.clientX - lastTouchX;
                    const deltaY = touch.clientY - lastTouchY;
                    
                    this.player.rotate(
                        deltaX * CONFIG.CONTROLS.TOUCH_SENSITIVITY,
                        deltaY * CONFIG.CONTROLS.TOUCH_SENSITIVITY
                    );
                    
                    lastTouchX = touch.clientX;
                    lastTouchY = touch.clientY;
                    break;
                }
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === lookTouchId) {
                    lookTouchId = null;
                    break;
                }
            }
        });
    }

    /**
     * Actualiza el estado de input basado en teclas presionadas
     */
    updateInput() {
        // Movimiento
        this.input.forward = this.isKeyPressed(CONFIG.KEYS.FORWARD);
        this.input.backward = this.isKeyPressed(CONFIG.KEYS.BACKWARD);
        this.input.left = this.isKeyPressed(CONFIG.KEYS.LEFT);
        this.input.right = this.isKeyPressed(CONFIG.KEYS.RIGHT);
        
        // Acciones
        this.input.jump = this.isKeyPressed(CONFIG.KEYS.JUMP);
        this.input.sprint = this.isKeyPressed(CONFIG.KEYS.SPRINT);
        
        // Toggle vuelo
        if (this.isKeyPressed(CONFIG.KEYS.FLY) && !this.input.toggleFly) {
            this.input.toggleFly = true;
        } else if (!this.isKeyPressed(CONFIG.KEYS.FLY)) {
            this.input.toggleFly = false;
        }
        
        // Inventario
        for (let i = 1; i <= 6; i++) {
            const key = `INVENTORY_${i}`;
            if (this.isKeyPressed(CONFIG.KEYS[key])) {
                this.player.inventory.selectByIndex(i - 1);
            }
        }
    }

    /**
     * Verifica si una tecla está presionada
     */
    isKeyPressed(keyCodes) {
        if (!Array.isArray(keyCodes)) {
            keyCodes = [keyCodes];
        }
        return keyCodes.some(code => this.keys[code]);
    }

    /**
     * Muestra controles móviles
     */
    showMobileControls() {
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.classList.add('active');
        }
    }

    /**
     * Obtiene el estado actual de input
     */
    getInput() {
        return this.input;
    }

    /**
     * Limpia los controles
     */
    dispose() {
        // Aquí se pueden remover event listeners si es necesario
    }
}

// Inicializar inventario UI
document.addEventListener('DOMContentLoaded', () => {
    const inventorySlots = document.querySelectorAll('.inventory-slot');
    
    inventorySlots.forEach((slot, index) => {
        slot.addEventListener('click', () => {
            if (window.game && window.game.player) {
                window.game.player.inventory.selectByIndex(index);
            }
        });
    });
});

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Controls };
}