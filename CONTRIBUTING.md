# 🤝 Guía de Contribución a Goxecraft

¡Gracias por tu interés en contribuir a Goxecraft! Este documento te guiará a través del proceso.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Guía de Estilo](#guía-de-estilo)
- [Estructura del Código](#estructura-del-código)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código. Por favor reporta comportamientos inaceptables.

## 🎯 ¿Cómo puedo contribuir?

### Reportar Bugs

Si encuentras un bug:

1. **Verifica** que no haya sido reportado antes en [Issues](https://github.com/danielloroima999-prog/goxecraft/issues)
2. **Abre un nuevo issue** con:
   - Título descriptivo
   - Pasos para reproducir el bug
   - Comportamiento esperado vs actual
   - Screenshots si es posible
   - Información del navegador/dispositivo

### Sugerir Mejoras

Para sugerir nuevas características:

1. Abre un issue con el tag `enhancement`
2. Describe claramente la funcionalidad
3. Explica por qué sería útil
4. Proporciona ejemplos de uso

### Contribuir con Código

1. Fork el repositorio
2. Crea una rama desde `main`:
   ```bash
   git checkout -b feature/mi-nueva-caracteristica
   ```
3. Realiza tus cambios
4. Commit con mensajes descriptivos
5. Push a tu fork
6. Abre un Pull Request

## 🛠️ Configuración del Entorno de Desarrollo

### Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Editor de código (VS Code recomendado)
- Servidor local (opcional pero recomendado)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/danielloroima999-prog/goxecraft.git
cd goxecraft

# Abrir con servidor local
python -m http.server 8000
# O
npx http-server
```

### Estructura de Archivos

```
goxecraft/
├── index.html          # Punto de entrada
├── js/
│   ├── config.js      # Configuración global
│   ├── blocks.js      # Sistema de bloques
│   ├── world.js       # Generación de mundo
│   ├── player.js      # Lógica del jugador
│   ├── controls.js    # Sistema de input
│   └── game.js        # Loop principal
└── README.md
```

## 🔄 Proceso de Pull Request

1. **Actualiza tu fork** con los últimos cambios de `main`
2. **Asegúrate** de que tu código funciona correctamente
3. **Prueba** en diferentes navegadores si es posible
4. **Documenta** cualquier cambio en la API o configuración
5. **Escribe** mensajes de commit claros:
   ```
   feat: agregar nuevo tipo de bloque de vidrio
   fix: corregir colisión con bloques de agua
   docs: actualizar README con nuevos controles
   perf: optimizar renderizado de chunks
   ```

### Checklist del PR

- [ ] El código funciona sin errores en consola
- [ ] Se probó en PC y móvil (si aplica)
- [ ] Se actualizó la documentación si es necesario
- [ ] Los commits tienen mensajes descriptivos
- [ ] El código sigue la guía de estilo del proyecto

## 🎨 Guía de Estilo

### JavaScript

```javascript
// ✅ Bueno
class MiClase {
    constructor(parametro) {
        this.parametro = parametro;
    }
    
    miMetodo() {
        // Código claro y comentado
        const resultado = this.calcular();
        return resultado;
    }
}

// ❌ Malo
class miclase{
constructor(p){this.p=p;}
miMetodo(){return this.calcular();}
}
```

### Convenciones

- **Nombres de clases**: PascalCase (`Player`, `World`, `BlockType`)
- **Nombres de funciones/variables**: camelCase (`updatePlayer`, `blockCount`)
- **Constantes**: UPPER_SNAKE_CASE (`CHUNK_SIZE`, `MAX_HEIGHT`)
- **Archivos**: kebab-case o camelCase (`world.js`, `player.js`)

### Comentarios

```javascript
/**
 * Descripción de la función
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @returns {Block} El bloque en esa posición
 */
getBlock(x, y) {
    // Implementación
}
```

## 🏗️ Estructura del Código

### Agregar un Nuevo Tipo de Bloque

1. En `js/blocks.js`, agrega el tipo:
```javascript
const BLOCK_TYPES = {
    // ... existentes
    GLASS: new BlockType('glass', 0xE0F7FA, true, true),
};
```

2. Agrega el ID:
```javascript
const BLOCK_IDS = {
    // ... existentes
    'glass': 9,
};
```

3. Actualiza el inventario si es necesario

### Modificar la Generación de Terreno

Edita `js/world.js` en el método `generate()` de la clase `Chunk`:

```javascript
generate() {
    // Tu lógica de generación aquí
}
```

### Agregar Nuevos Controles

En `js/controls.js`, agrega los event listeners necesarios:

```javascript
initKeyboard() {
    document.addEventListener('keydown', (e) => {
        // Tu lógica aquí
    });
}
```

## 🧪 Testing

Aunque no tenemos tests automatizados aún, por favor prueba:

1. **Funcionalidad básica**: Movimiento, colocar/romper bloques
2. **Rendimiento**: No debe haber lag significativo
3. **Compatibilidad**: Chrome, Firefox, Safari
4. **Móvil**: Si modificas controles táctiles

## 📝 Documentación

Si agregas nuevas características:

1. Actualiza el `README.md`
2. Agrega comentarios en el código
3. Documenta en el PR qué hace tu cambio

## 🐛 Debugging

### Herramientas útiles

```javascript
// En la consola del navegador
window.game.player.position  // Ver posición
window.game.world.chunks     // Ver chunks cargados
CONFIG.WORLD.RENDER_DISTANCE = 8  // Cambiar configuración en vivo
```

### Problemas Comunes

- **Bloques no se renderizan**: Verifica face culling en `blocks.js`
- **Lag en móvil**: Reduce `RENDER_DISTANCE` en `config.js`
- **Colisiones extrañas**: Revisa `checkCollisions()` en `player.js`

## 💡 Ideas para Contribuir

### Fácil
- Agregar más tipos de bloques
- Mejorar la UI del inventario
- Agregar sonidos
- Mejorar los colores de los bloques

### Medio
- Sistema de guardado/carga
- Mejores texturas con imágenes
- Modo día/noche
- Partículas al romper bloques

### Difícil
- Multijugador con WebRTC
- Generación de cuevas
- Sistema de iluminación
- Shaders personalizados

## 📞 Contacto

Si tienes preguntas:
- Abre un [Issue](https://github.com/danielloroima999-prog/goxecraft/issues)
- Comenta en un PR existente

## 🙏 Agradecimientos

¡Gracias por contribuir a Goxecraft! Cada contribución, grande o pequeña, es valiosa.

---

**¡Happy Coding! 🎮**