/**
 * Goxecraft - Sistema de Bloques
 * Define todos los tipos de bloques y sus propiedades
 */

class BlockType {
    constructor(name, color, transparent = false, solid = true) {
        this.name = name;
        this.color = color;
        this.transparent = transparent;
        this.solid = solid;
    }
}

// Definición de tipos de bloques
const BLOCK_TYPES = {
    AIR: new BlockType('air', 0x000000, true, false),
    GRASS: new BlockType('grass', 0x7CFC00, false, true),
    DIRT: new BlockType('dirt', 0x8B4513, false, true),
    STONE: new BlockType('stone', 0x808080, false, true),
    WOOD: new BlockType('wood', 0xA0522D, false, true),
    SAND: new BlockType('sand', 0xF4A460, false, true),
    WATER: new BlockType('water', 0x1E90FF, true, false),
    LEAVES: new BlockType('leaves', 0x228B22, true, true),
    COBBLESTONE: new BlockType('cobblestone', 0x696969, false, true),
};

// Mapeo de nombres a IDs
const BLOCK_IDS = {
    'air': 0,
    'grass': 1,
    'dirt': 2,
    'stone': 3,
    'wood': 4,
    'sand': 5,
    'water': 6,
    'leaves': 7,
    'cobblestone': 8,
};

// Mapeo inverso
const ID_TO_BLOCK = Object.keys(BLOCK_IDS).reduce((acc, key) => {
    acc[BLOCK_IDS[key]] = key;
    return acc;
}, {});

/**
 * Clase para gestionar bloques individuales
 */
class Block {
    constructor(type, x, y, z) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh = null;
    }

    getBlockType() {
        return BLOCK_TYPES[this.type.toUpperCase()];
    }

    isTransparent() {
        return this.getBlockType().transparent;
    }

    isSolid() {
        return this.getBlockType().solid;
    }

    /**
     * Crea la geometría del bloque con face culling optimizado
     */
    createMesh(neighbors = {}) {
        const blockType = this.getBlockType();
        const size = CONFIG.WORLD.BLOCK_SIZE;
        
        // Si el bloque está completamente rodeado de bloques sólidos, no renderizar
        if (this.isCompletelyHidden(neighbors)) {
            return null;
        }

        // Crear geometría solo para las caras visibles
        const geometry = this.createOptimizedGeometry(neighbors, size);
        
        const material = new THREE.MeshLambertMaterial({
            color: blockType.color,
            transparent: blockType.transparent,
            opacity: blockType.transparent ? 0.7 : 1.0,
            side: THREE.FrontSide,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Guardar referencia al bloque
        this.mesh.userData.block = this;
        
        return this.mesh;
    }

    /**
     * Verifica si el bloque está completamente oculto
     */
    isCompletelyHidden(neighbors) {
        if (!CONFIG.PERFORMANCE.FACE_CULLING) return false;
        
        const directions = ['top', 'bottom', 'front', 'back', 'left', 'right'];
        return directions.every(dir => {
            const neighbor = neighbors[dir];
            return neighbor && !neighbor.isTransparent() && neighbor.isSolid();
        });
    }

    /**
     * Crea geometría optimizada solo con caras visibles
     */
    createOptimizedGeometry(neighbors, size) {
        const vertices = [];
        const indices = [];
        const normals = [];
        const uvs = [];
        
        let vertexIndex = 0;

        // Función auxiliar para agregar una cara
        const addFace = (positions, normal, uvCoords) => {
            const startIndex = vertexIndex;
            
            // Agregar vértices
            positions.forEach(pos => {
                vertices.push(...pos);
                normals.push(...normal);
            });
            
            // Agregar UVs
            uvCoords.forEach(uv => uvs.push(...uv));
            
            // Agregar índices (dos triángulos por cara)
            indices.push(
                startIndex, startIndex + 1, startIndex + 2,
                startIndex, startIndex + 2, startIndex + 3
            );
            
            vertexIndex += 4;
        };

        const s = size / 2;

        // Top face
        if (!neighbors.top || neighbors.top.isTransparent()) {
            addFace(
                [[-s, s, -s], [s, s, -s], [s, s, s], [-s, s, s]],
                [0, 1, 0],
                [[0, 0], [1, 0], [1, 1], [0, 1]]
            );
        }

        // Bottom face
        if (!neighbors.bottom || neighbors.bottom.isTransparent()) {
            addFace(
                [[-s, -s, -s], [-s, -s, s], [s, -s, s], [s, -s, -s]],
                [0, -1, 0],
                [[0, 0], [0, 1], [1, 1], [1, 0]]
            );
        }

        // Front face
        if (!neighbors.front || neighbors.front.isTransparent()) {
            addFace(
                [[-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]],
                [0, 0, 1],
                [[0, 0], [1, 0], [1, 1], [0, 1]]
            );
        }

        // Back face
        if (!neighbors.back || neighbors.back.isTransparent()) {
            addFace(
                [[s, -s, -s], [-s, -s, -s], [-s, s, -s], [s, s, -s]],
                [0, 0, -1],
                [[0, 0], [1, 0], [1, 1], [0, 1]]
            );
        }

        // Right face
        if (!neighbors.right || neighbors.right.isTransparent()) {
            addFace(
                [[s, -s, s], [s, -s, -s], [s, s, -s], [s, s, s]],
                [1, 0, 0],
                [[0, 0], [1, 0], [1, 1], [0, 1]]
            );
        }

        // Left face
        if (!neighbors.left || neighbors.left.isTransparent()) {
            addFace(
                [[-s, -s, -s], [-s, -s, s], [-s, s, s], [-s, s, -s]],
                [-1, 0, 0],
                [[0, 0], [1, 0], [1, 1], [0, 1]]
            );
        }

        // Crear geometría
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        
        return geometry;
    }

    /**
     * Destruye el mesh del bloque
     */
    destroy() {
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
            this.mesh = null;
        }
    }
}

/**
 * Gestor de bloques para el inventario
 */
class BlockInventory {
    constructor() {
        this.selectedBlock = 'grass';
        this.blocks = ['grass', 'dirt', 'stone', 'wood', 'sand', 'water'];
        this.selectedIndex = 0;
    }

    selectBlock(blockName) {
        if (this.blocks.includes(blockName)) {
            this.selectedBlock = blockName;
            this.selectedIndex = this.blocks.indexOf(blockName);
            this.updateUI();
        }
    }

    selectByIndex(index) {
        if (index >= 0 && index < this.blocks.length) {
            this.selectedIndex = index;
            this.selectedBlock = this.blocks[index];
            this.updateUI();
        }
    }

    nextBlock() {
        this.selectedIndex = (this.selectedIndex + 1) % this.blocks.length;
        this.selectedBlock = this.blocks[this.selectedIndex];
        this.updateUI();
    }

    previousBlock() {
        this.selectedIndex = (this.selectedIndex - 1 + this.blocks.length) % this.blocks.length;
        this.selectedBlock = this.blocks[this.selectedIndex];
        this.updateUI();
    }

    getSelectedBlock() {
        return this.selectedBlock;
    }

    updateUI() {
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            if (index === this.selectedIndex) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Block, BlockType, BLOCK_TYPES, BLOCK_IDS, ID_TO_BLOCK, BlockInventory };
}