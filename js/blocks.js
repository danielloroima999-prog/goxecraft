// ============================================
// SISTEMA DE BLOQUES Y GEOMETRÍA
// ============================================

// BlockManager - Gestiona la creación y renderizado de bloques
class BlockManager {
    constructor() {
        this.materials = this.createMaterials();
    }

    // Crear materiales para cada tipo de bloque
    createMaterials() {
        const materials = {};
        
        BLOCK_TYPES.forEach(blockType => {
            materials[blockType.id] = new THREE.MeshLambertMaterial({
                color: blockType.color,
                transparent: blockType.transparent,
                opacity: blockType.transparent ? 0.7 : 1.0,
                side: THREE.DoubleSide
            });
        });
        
        return materials;
    }

    // Obtener material por ID de bloque
    getMaterial(blockId) {
        return this.materials[blockId];
    }

    // Crear geometría de un bloque individual
    createBlockGeometry(x, y, z, blockId, neighbors) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        
        const size = WORLD_CONFIG.BLOCK_SIZE;
        const halfSize = size / 2;
        
        // Definir las 6 caras del cubo
        const faces = [
            // Cara superior (Y+)
            {
                check: !neighbors.top,
                vertices: [
                    [x - halfSize, y + halfSize, z - halfSize],
                    [x + halfSize, y + halfSize, z - halfSize],
                    [x + halfSize, y + halfSize, z + halfSize],
                    [x - halfSize, y + halfSize, z + halfSize]
                ],
                normal: [0, 1, 0]
            },
            // Cara inferior (Y-)
            {
                check: !neighbors.bottom,
                vertices: [
                    [x - halfSize, y - halfSize, z - halfSize],
                    [x - halfSize, y - halfSize, z + halfSize],
                    [x + halfSize, y - halfSize, z + halfSize],
                    [x + halfSize, y - halfSize, z - halfSize]
                ],
                normal: [0, -1, 0]
            },
            // Cara frontal (Z+)
            {
                check: !neighbors.front,
                vertices: [
                    [x - halfSize, y - halfSize, z + halfSize],
                    [x - halfSize, y + halfSize, z + halfSize],
                    [x + halfSize, y + halfSize, z + halfSize],
                    [x + halfSize, y - halfSize, z + halfSize]
                ],
                normal: [0, 0, 1]
            },
            // Cara trasera (Z-)
            {
                check: !neighbors.back,
                vertices: [
                    [x + halfSize, y - halfSize, z - halfSize],
                    [x + halfSize, y + halfSize, z - halfSize],
                    [x - halfSize, y + halfSize, z - halfSize],
                    [x - halfSize, y - halfSize, z - halfSize]
                ],
                normal: [0, 0, -1]
            },
            // Cara derecha (X+)
            {
                check: !neighbors.right,
                vertices: [
                    [x + halfSize, y - halfSize, z - halfSize],
                    [x + halfSize, y - halfSize, z + halfSize],
                    [x + halfSize, y + halfSize, z + halfSize],
                    [x + halfSize, y + halfSize, z - halfSize]
                ],
                normal: [1, 0, 0]
            },
            // Cara izquierda (X-)
            {
                check: !neighbors.left,
                vertices: [
                    [x - halfSize, y - halfSize, z - halfSize],
                    [x - halfSize, y + halfSize, z - halfSize],
                    [x - halfSize, y + halfSize, z + halfSize],
                    [x - halfSize, y - halfSize, z + halfSize]
                ],
                normal: [-1, 0, 0]
            }
        ];

        let vertexOffset = 0;

        // Agregar solo las caras visibles
        faces.forEach(face => {
            if (face.check) {
                // Agregar vértices
                face.vertices.forEach(vertex => {
                    vertices.push(...vertex);
                    normals.push(...face.normal);
                });

                // Agregar UVs
                uvs.push(0, 0, 1, 0, 1, 1, 0, 1);

                // Agregar índices para dos triángulos
                indices.push(
                    vertexOffset, vertexOffset + 1, vertexOffset + 2,
                    vertexOffset, vertexOffset + 2, vertexOffset + 3
                );

                vertexOffset += 4;
            }
        });

        // Configurar geometría
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);

        return geometry;
    }

    // Crear mesh de un bloque
    createBlockMesh(x, y, z, blockId, neighbors) {
        const geometry = this.createBlockGeometry(x, y, z, blockId, neighbors);
        const material = this.getMaterial(blockId);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    }

    // Combinar múltiples geometrías en una sola (optimización)
    mergeGeometries(geometries) {
        if (geometries.length === 0) return null;
        
        const mergedGeometry = new THREE.BufferGeometry();
        const vertices = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        let vertexOffset = 0;

        geometries.forEach(geometry => {
            const positionAttr = geometry.getAttribute('position');
            const normalAttr = geometry.getAttribute('normal');
            const uvAttr = geometry.getAttribute('uv');
            const indexAttr = geometry.getIndex();

            // Agregar vértices
            for (let i = 0; i < positionAttr.count; i++) {
                vertices.push(
                    positionAttr.getX(i),
                    positionAttr.getY(i),
                    positionAttr.getZ(i)
                );
                normals.push(
                    normalAttr.getX(i),
                    normalAttr.getY(i),
                    normalAttr.getZ(i)
                );
                uvs.push(
                    uvAttr.getX(i),
                    uvAttr.getY(i)
                );
            }

            // Agregar índices con offset
            for (let i = 0; i < indexAttr.count; i++) {
                indices.push(indexAttr.getX(i) + vertexOffset);
            }

            vertexOffset += positionAttr.count;
        });

        mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        mergedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        mergedGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        mergedGeometry.setIndex(indices);

        return mergedGeometry;
    }

    // Obtener información de un tipo de bloque
    getBlockType(blockId) {
        return BLOCK_TYPES.find(type => type.id === blockId);
    }

    // Verificar si un bloque es sólido
    isBlockSolid(blockId) {
        const blockType = this.getBlockType(blockId);
        return blockType ? blockType.solid : false;
    }

    // Verificar si un bloque es transparente
    isBlockTransparent(blockId) {
        const blockType = this.getBlockType(blockId);
        return blockType ? blockType.transparent : false;
    }
}

console.log('✅ Blocks.js cargado correctamente');
