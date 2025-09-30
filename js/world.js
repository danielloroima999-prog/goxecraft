/**
 * Goxecraft - Sistema de Generación de Mundo
 * Genera terreno procedural con ruido Perlin simplificado
 */

/**
 * Generador de ruido Perlin simplificado
 */
class SimplexNoise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.perm = this.buildPermutationTable();
    }

    buildPermutationTable() {
        const p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }
        
        // Shuffle usando seed
        let n, q;
        for (let i = 255; i > 0; i--) {
            n = Math.floor((this.seed + i) * (i + 1)) % (i + 1);
            q = p[i];
            p[i] = p[n];
            p[n] = q;
        }
        
        // Duplicar para evitar overflow
        for (let i = 0; i < 256; i++) {
            p[256 + i] = p[i];
        }
        
        return p;
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise2D(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const a = this.perm[X] + Y;
        const aa = this.perm[a];
        const ab = this.perm[a + 1];
        const b = this.perm[X + 1] + Y;
        const ba = this.perm[b];
        const bb = this.perm[b + 1];
        
        return this.lerp(v,
            this.lerp(u, this.grad(this.perm[aa], x, y), this.grad(this.perm[ba], x - 1, y)),
            this.lerp(u, this.grad(this.perm[ab], x, y - 1), this.grad(this.perm[bb], x - 1, y - 1))
        );
    }

    octaveNoise2D(x, y, octaves, persistence) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += this.noise2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }
        
        return total / maxValue;
    }
}

/**
 * Chunk del mundo
 */
class Chunk {
    constructor(x, z, world) {
        this.x = x;
        this.z = z;
        this.world = world;
        this.blocks = new Map();
        this.mesh = null;
        this.generated = false;
    }

    getKey(x, y, z) {
        return `${x},${y},${z}`;
    }

    setBlock(x, y, z, blockType) {
        const key = this.getKey(x, y, z);
        if (blockType === 'air') {
            this.blocks.delete(key);
        } else {
            this.blocks.set(key, new Block(blockType, x, y, z));
        }
    }

    getBlock(x, y, z) {
        const key = this.getKey(x, y, z);
        return this.blocks.get(key) || null;
    }

    generate() {
        const chunkSize = CONFIG.WORLD.CHUNK_SIZE;
        const worldX = this.x * chunkSize;
        const worldZ = this.z * chunkSize;

        for (let x = 0; x < chunkSize; x++) {
            for (let z = 0; z < chunkSize; z++) {
                const worldPosX = worldX + x;
                const worldPosZ = worldZ + z;
                
                // Generar altura usando ruido
                const height = this.world.getTerrainHeight(worldPosX, worldPosZ);
                
                // Generar columna de bloques
                for (let y = 0; y < height; y++) {
                    let blockType;
                    
                    if (y < height - 4) {
                        blockType = 'stone';
                    } else if (y < height - 1) {
                        blockType = 'dirt';
                    } else {
                        // Capa superior
                        if (height < CONFIG.WORLD.SEA_LEVEL - 2) {
                            blockType = 'sand';
                        } else {
                            blockType = 'grass';
                        }
                    }
                    
                    this.setBlock(worldPosX, y, worldPosZ, blockType);
                }
                
                // Generar agua
                if (height < CONFIG.WORLD.SEA_LEVEL) {
                    for (let y = height; y < CONFIG.WORLD.SEA_LEVEL; y++) {
                        this.setBlock(worldPosX, y, worldPosZ, 'water');
                    }
                }
                
                // Generar árboles ocasionalmente
                if (height >= CONFIG.WORLD.SEA_LEVEL && Math.random() < CONFIG.TERRAIN.TREE_CHANCE) {
                    this.generateTree(worldPosX, height, worldPosZ);
                }
            }
        }
        
        this.generated = true;
    }

    generateTree(x, y, z) {
        const trunkHeight = 4 + Math.floor(Math.random() * 2);
        
        // Tronco
        for (let i = 0; i < trunkHeight; i++) {
            this.setBlock(x, y + i, z, 'wood');
        }
        
        // Hojas
        const leavesY = y + trunkHeight;
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = 0; dy < 3; dy++) {
                    if (dx === 0 && dz === 0 && dy < 2) continue;
                    if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
                    
                    this.setBlock(x + dx, leavesY + dy, z + dz, 'leaves');
                }
            }
        }
    }

    buildMesh() {
        if (this.mesh) {
            this.destroyMesh();
        }

        const group = new THREE.Group();
        
        this.blocks.forEach(block => {
            const neighbors = this.getNeighbors(block.x, block.y, block.z);
            const mesh = block.createMesh(neighbors);
            if (mesh) {
                group.add(mesh);
            }
        });

        this.mesh = group;
        return this.mesh;
    }

    getNeighbors(x, y, z) {
        return {
            top: this.world.getBlock(x, y + 1, z),
            bottom: this.world.getBlock(x, y - 1, z),
            front: this.world.getBlock(x, y, z + 1),
            back: this.world.getBlock(x, y, z - 1),
            right: this.world.getBlock(x + 1, y, z),
            left: this.world.getBlock(x - 1, y, z),
        };
    }

    destroyMesh() {
        if (this.mesh) {
            this.mesh.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
            this.mesh = null;
        }
    }

    destroy() {
        this.destroyMesh();
        this.blocks.clear();
    }
}

/**
 * Mundo principal
 */
class World {
    constructor(scene) {
        this.scene = scene;
        this.chunks = new Map();
        this.noise = new SimplexNoise(CONFIG.TERRAIN.SEED);
        this.loadedChunks = new Set();
    }

    getChunkKey(chunkX, chunkZ) {
        return `${chunkX},${chunkZ}`;
    }

    getChunkCoords(worldX, worldZ) {
        return {
            x: Math.floor(worldX / CONFIG.WORLD.CHUNK_SIZE),
            z: Math.floor(worldZ / CONFIG.WORLD.CHUNK_SIZE)
        };
    }

    getTerrainHeight(x, z) {
        const scale = CONFIG.TERRAIN.SCALE;
        const noise = this.noise.octaveNoise2D(
            x * scale,
            z * scale,
            CONFIG.TERRAIN.OCTAVES,
            CONFIG.TERRAIN.PERSISTENCE
        );
        
        // Normalizar de [-1, 1] a [0, 1]
        const normalized = (noise + 1) / 2;
        
        // Aplicar altura
        const height = Math.floor(
            CONFIG.WORLD.SEA_LEVEL + 
            normalized * CONFIG.TERRAIN.HEIGHT_MULTIPLIER
        );
        
        return Math.max(1, Math.min(height, CONFIG.WORLD.WORLD_HEIGHT - 1));
    }

    getChunk(chunkX, chunkZ) {
        const key = this.getChunkKey(chunkX, chunkZ);
        return this.chunks.get(key);
    }

    getOrCreateChunk(chunkX, chunkZ) {
        let chunk = this.getChunk(chunkX, chunkZ);
        if (!chunk) {
            chunk = new Chunk(chunkX, chunkZ, this);
            const key = this.getChunkKey(chunkX, chunkZ);
            this.chunks.set(key, chunk);
        }
        return chunk;
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= CONFIG.WORLD.WORLD_HEIGHT) {
            return null;
        }
        
        const chunkCoords = this.getChunkCoords(x, z);
        const chunk = this.getChunk(chunkCoords.x, chunkCoords.z);
        
        if (!chunk) return null;
        return chunk.getBlock(x, y, z);
    }

    setBlock(x, y, z, blockType) {
        if (y < 0 || y >= CONFIG.WORLD.WORLD_HEIGHT) {
            return;
        }
        
        const chunkCoords = this.getChunkCoords(x, z);
        const chunk = this.getOrCreateChunk(chunkCoords.x, chunkCoords.z);
        
        chunk.setBlock(x, y, z, blockType);
        
        // Regenerar mesh del chunk
        if (chunk.mesh) {
            this.scene.remove(chunk.mesh);
            chunk.destroyMesh();
        }
        
        const mesh = chunk.buildMesh();
        if (mesh) {
            this.scene.add(mesh);
        }
    }

    updateChunks(playerX, playerZ) {
        const playerChunk = this.getChunkCoords(playerX, playerZ);
        const renderDistance = CONFIG.WORLD.RENDER_DISTANCE;
        
        const chunksToLoad = new Set();
        
        // Determinar chunks a cargar
        for (let x = -renderDistance; x <= renderDistance; x++) {
            for (let z = -renderDistance; z <= renderDistance; z++) {
                const chunkX = playerChunk.x + x;
                const chunkZ = playerChunk.z + z;
                const key = this.getChunkKey(chunkX, chunkZ);
                chunksToLoad.add(key);
            }
        }
        
        // Descargar chunks lejanos
        this.loadedChunks.forEach(key => {
            if (!chunksToLoad.has(key)) {
                const chunk = this.chunks.get(key);
                if (chunk && chunk.mesh) {
                    this.scene.remove(chunk.mesh);
                    chunk.destroyMesh();
                }
                this.loadedChunks.delete(key);
            }
        });
        
        // Cargar nuevos chunks
        chunksToLoad.forEach(key => {
            if (!this.loadedChunks.has(key)) {
                const [chunkX, chunkZ] = key.split(',').map(Number);
                const chunk = this.getOrCreateChunk(chunkX, chunkZ);
                
                if (!chunk.generated) {
                    chunk.generate();
                }
                
                if (!chunk.mesh) {
                    const mesh = chunk.buildMesh();
                    if (mesh) {
                        this.scene.add(mesh);
                    }
                }
                
                this.loadedChunks.add(key);
            }
        });
    }

    getBlockCount() {
        let count = 0;
        this.chunks.forEach(chunk => {
            count += chunk.blocks.size;
        });
        return count;
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { World, Chunk, SimplexNoise };
}