/**
 * Goxecraft - Sistema del Jugador
 * Maneja física, movimiento, colisiones y acciones del jugador
 */

class Player {
    constructor(camera, world) {
        this.camera = camera;
        this.world = world;
        
        // Posición y física
        this.position = new THREE.Vector3(0, CONFIG.WORLD.SEA_LEVEL + 10, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        
        // Estados
        this.isFlying = false;
        this.isSprinting = false;
        this.isOnGround = false;
        this.isJumping = false;
        
        // Inventario
        this.inventory = new BlockInventory();
        
        // Raycaster para interacción
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = CONFIG.PLAYER.REACH;
        
        // Inicializar posición de la cámara
        this.updateCamera();
    }

    updateCamera() {
        this.camera.position.copy(this.position);
        this.camera.rotation.copy(this.rotation);
    }

    /**
     * Actualiza el jugador cada frame
     */
    update(deltaTime, input) {
        // Actualizar movimiento
        this.updateMovement(deltaTime, input);
        
        // Aplicar física
        if (!this.isFlying) {
            this.applyGravity(deltaTime);
            this.checkCollisions();
        }
        
        // Actualizar cámara
        this.updateCamera();
        
        // Actualizar chunks del mundo
        this.world.updateChunks(this.position.x, this.position.z);
    }

    /**
     * Actualiza el movimiento basado en input
     */
    updateMovement(deltaTime, input) {
        const speed = this.isFlying ? CONFIG.PLAYER.FLY_SPEED : 
                     (this.isSprinting ? CONFIG.PLAYER.SPEED * CONFIG.PLAYER.SPRINT_MULTIPLIER : CONFIG.PLAYER.SPEED);
        
        const moveVector = new THREE.Vector3();
        
        // Calcular dirección de movimiento
        if (input.forward) moveVector.z -= 1;
        if (input.backward) moveVector.z += 1;
        if (input.left) moveVector.x -= 1;
        if (input.right) moveVector.x += 1;
        
        // Normalizar para movimiento diagonal consistente
        if (moveVector.length() > 0) {
            moveVector.normalize();
        }
        
        // Aplicar rotación de la cámara
        moveVector.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
        
        // Aplicar velocidad
        if (this.isFlying) {
            // Movimiento en vuelo (incluye vertical)
            this.velocity.x = moveVector.x * speed;
            this.velocity.z = moveVector.z * speed;
            
            if (input.jump) {
                this.velocity.y = speed;
            } else if (input.crouch) {
                this.velocity.y = -speed;
            } else {
                this.velocity.y = 0;
            }
        } else {
            // Movimiento en tierra
            this.velocity.x = moveVector.x * speed;
            this.velocity.z = moveVector.z * speed;
            
            // Saltar
            if (input.jump && this.isOnGround && !this.isJumping) {
                this.velocity.y = CONFIG.PLAYER.JUMP_FORCE;
                this.isJumping = true;
                this.isOnGround = false;
            }
        }
        
        // Aplicar velocidad a posición
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // Toggle vuelo
        if (input.toggleFly) {
            this.isFlying = !this.isFlying;
            if (this.isFlying) {
                this.velocity.y = 0;
            }
            input.toggleFly = false;
        }
        
        // Sprint
        this.isSprinting = input.sprint && !this.isFlying;
    }

    /**
     * Aplica gravedad
     */
    applyGravity(deltaTime) {
        if (!this.isOnGround) {
            this.velocity.y -= CONFIG.PLAYER.GRAVITY * deltaTime;
            // Limitar velocidad de caída
            this.velocity.y = Math.max(this.velocity.y, -50);
        }
    }

    /**
     * Verifica colisiones con el mundo
     */
    checkCollisions() {
        const playerBox = this.getBoundingBox();
        this.isOnGround = false;
        
        // Verificar colisión vertical (Y)
        const blockBelow = this.world.getBlock(
            Math.floor(this.position.x),
            Math.floor(this.position.y - CONFIG.PLAYER.HEIGHT / 2 - 0.1),
            Math.floor(this.position.z)
        );
        
        if (blockBelow && blockBelow.isSolid()) {
            const blockTop = Math.floor(this.position.y - CONFIG.PLAYER.HEIGHT / 2) + 1;
            this.position.y = blockTop + CONFIG.PLAYER.HEIGHT / 2;
            this.velocity.y = 0;
            this.isOnGround = true;
            this.isJumping = false;
        }
        
        // Verificar colisión horizontal
        this.checkHorizontalCollisions();
    }

    /**
     * Verifica colisiones horizontales
     */
    checkHorizontalCollisions() {
        const radius = 0.3;
        const checks = [
            { x: radius, z: 0 },
            { x: -radius, z: 0 },
            { x: 0, z: radius },
            { x: 0, z: -radius },
        ];
        
        for (const check of checks) {
            const checkX = Math.floor(this.position.x + check.x);
            const checkZ = Math.floor(this.position.z + check.z);
            const checkY = Math.floor(this.position.y);
            
            const block = this.world.getBlock(checkX, checkY, checkZ);
            
            if (block && block.isSolid()) {
                // Empujar al jugador fuera del bloque
                if (check.x !== 0) {
                    this.position.x = Math.floor(this.position.x) + 0.5 - Math.sign(check.x) * 0.5;
                    this.velocity.x = 0;
                }
                if (check.z !== 0) {
                    this.position.z = Math.floor(this.position.z) + 0.5 - Math.sign(check.z) * 0.5;
                    this.velocity.z = 0;
                }
            }
        }
    }

    /**
     * Obtiene la caja de colisión del jugador
     */
    getBoundingBox() {
        const halfWidth = 0.3;
        const halfHeight = CONFIG.PLAYER.HEIGHT / 2;
        
        return new THREE.Box3(
            new THREE.Vector3(
                this.position.x - halfWidth,
                this.position.y - halfHeight,
                this.position.z - halfWidth
            ),
            new THREE.Vector3(
                this.position.x + halfWidth,
                this.position.y + halfHeight,
                this.position.z + halfWidth
            )
        );
    }

    /**
     * Rota la cámara del jugador
     */
    rotate(deltaX, deltaY) {
        this.rotation.y -= deltaX;
        this.rotation.x -= deltaY;
        
        // Limitar rotación vertical
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
    }

    /**
     * Obtiene el bloque que el jugador está mirando
     */
    getTargetBlock() {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyEuler(this.rotation);
        
        this.raycaster.set(this.camera.position, direction);
        
        // Buscar intersecciones con bloques
        const step = 0.1;
        const maxDistance = CONFIG.PLAYER.REACH;
        
        for (let distance = 0; distance < maxDistance; distance += step) {
            const checkPos = this.camera.position.clone().add(direction.clone().multiplyScalar(distance));
            const x = Math.floor(checkPos.x);
            const y = Math.floor(checkPos.y);
            const z = Math.floor(checkPos.z);
            
            const block = this.world.getBlock(x, y, z);
            
            if (block && block.isSolid()) {
                return {
                    block: block,
                    position: { x, y, z },
                    distance: distance
                };
            }
        }
        
        return null;
    }

    /**
     * Rompe el bloque que el jugador está mirando
     */
    breakBlock() {
        const target = this.getTargetBlock();
        
        if (target) {
            this.world.setBlock(target.position.x, target.position.y, target.position.z, 'air');
            return true;
        }
        
        return false;
    }

    /**
     * Coloca un bloque
     */
    placeBlock() {
        const target = this.getTargetBlock();
        
        if (!target) return false;
        
        // Calcular posición donde colocar el bloque (cara del bloque objetivo)
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyEuler(this.rotation);
        
        const placePos = this.camera.position.clone().add(
            direction.clone().multiplyScalar(target.distance + 0.5)
        );
        
        const x = Math.floor(placePos.x);
        const y = Math.floor(placePos.y);
        const z = Math.floor(placePos.z);
        
        // No colocar bloque en la posición del jugador
        const playerBlockX = Math.floor(this.position.x);
        const playerBlockY = Math.floor(this.position.y);
        const playerBlockZ = Math.floor(this.position.z);
        
        if (x === playerBlockX && y === playerBlockY && z === playerBlockZ) {
            return false;
        }
        
        // Verificar que no haya un bloque sólido ya
        const existingBlock = this.world.getBlock(x, y, z);
        if (existingBlock && existingBlock.isSolid()) {
            return false;
        }
        
        // Colocar bloque
        const blockType = this.inventory.getSelectedBlock();
        this.world.setBlock(x, y, z, blockType);
        
        return true;
    }

    /**
     * Obtiene información de posición para el HUD
     */
    getPositionString() {
        return `${Math.floor(this.position.x)}, ${Math.floor(this.position.y)}, ${Math.floor(this.position.z)}`;
    }

    /**
     * Teleporta al jugador a una posición
     */
    teleport(x, y, z) {
        this.position.set(x, y, z);
        this.velocity.set(0, 0, 0);
        this.updateCamera();
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Player };
}