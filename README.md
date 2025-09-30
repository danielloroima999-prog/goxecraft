# 🎮 Goxecraft

Un clon de Minecraft básico pero completo, desarrollado con Three.js, optimizado para web y dispositivos móviles Android.

![Goxecraft](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android-orange)

## ✨ Características

### 🌍 Generación de Mundo
- **Generación procedural** con algoritmo de ruido Perlin
- **Sistema de chunks** optimizado para carga dinámica
- **Terreno realista** con diferentes biomas (pasto, arena, agua)
- **Generación de árboles** procedural
- **Altura variable** del terreno con montañas y valles

### 🎮 Mecánicas de Juego
- ✅ **Colocar y romper bloques** con sistema de raycast
- ✅ **Inventario** con 6 tipos de bloques (pasto, tierra, piedra, madera, arena, agua)
- ✅ **Física realista** con gravedad y colisiones
- ✅ **Saltar** con detección de suelo
- ✅ **Volar** (modo creativo)
- ✅ **Correr** (sprint)
- ✅ **Animaciones suaves** de movimiento

### 🎯 Optimización
- **Face culling** - No renderiza caras ocultas de bloques
- **Frustum culling** - Solo renderiza lo visible
- **Sistema de chunks** - Carga/descarga dinámica según posición del jugador
- **Geometría optimizada** - Meshes combinados por chunk
- **Rendimiento móvil** - Ajustes automáticos para dispositivos móviles

### 📱 Controles

#### PC (Teclado y Mouse)
- **W, A, S, D** o **Flechas** - Movimiento
- **Espacio** - Saltar
- **Shift** - Correr
- **F** - Activar/desactivar vuelo
- **Click izquierdo** - Romper bloque
- **Click derecho** - Colocar bloque
- **Rueda del mouse** - Cambiar bloque seleccionado
- **1-6** - Seleccionar bloque del inventario
- **Mouse** - Mirar alrededor (click en pantalla para capturar cursor)

#### Android/Móvil
- **Joystick virtual** (izquierda) - Movimiento
- **Deslizar pantalla** - Mirar alrededor
- **Botón ⬆️** - Saltar
- **Botón ✈️** - Activar/desactivar vuelo
- **Botón 🏃** - Correr
- **Botón ⛏️** - Romper bloque
- **Botón ➕** - Colocar bloque
- **Tocar inventario** - Seleccionar bloque

## 🚀 Instalación y Uso

### Opción 1: Abrir directamente en el navegador

1. Clona el repositorio:
```bash
git clone https://github.com/danielloroima999-prog/goxecraft.git
cd goxecraft
```

2. Abre `index.html` en tu navegador web moderno (Chrome, Firefox, Safari, Edge)

### Opción 2: Servidor local (recomendado)

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (npx)
npx http-server

# Con PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000` en tu navegador.

### Opción 3: GitHub Pages

El juego está disponible en línea en:
```
https://danielloroima999-prog.github.io/goxecraft/
```

## 📁 Estructura del Proyecto

```
goxecraft/
├── index.html              # Página principal
├── js/
│   ├── config.js          # Configuración del juego
│   ├── blocks.js          # Sistema de bloques
│   ├── world.js           # Generación de mundo y chunks
│   ├── player.js          # Física y mecánicas del jugador
│   ├── controls.js        # Sistema de controles (PC y móvil)
│   └── game.js            # Motor principal del juego
└── README.md              # Este archivo
```

## 🎨 Tipos de Bloques

| Bloque | Emoji | Color | Descripción |
|--------|-------|-------|-------------|
| Pasto | 🟩 | Verde | Bloque de superficie |
| Tierra | 🟫 | Marrón | Bloque subterráneo |
| Piedra | ⬜ | Gris | Bloque de roca |
| Madera | 🟧 | Marrón claro | De los árboles |
| Arena | 🟨 | Amarillo | En playas |
| Agua | 🟦 | Azul | Transparente |

## ⚙️ Configuración

Puedes modificar la configuración del juego en `js/config.js`:

```javascript
const CONFIG = {
    WORLD: {
        CHUNK_SIZE: 16,          // Tamaño de cada chunk
        RENDER_DISTANCE: 4,      // Distancia de renderizado
        WORLD_HEIGHT: 64,        // Altura máxima
    },
    PLAYER: {
        SPEED: 5,                // Velocidad de movimiento
        FLY_SPEED: 10,           // Velocidad de vuelo
        JUMP_FORCE: 8,           // Fuerza de salto
    },
    // ... más opciones
};
```

## 🔧 Tecnologías Utilizadas

- **Three.js** (r128) - Motor de renderizado 3D
- **JavaScript ES6+** - Lógica del juego
- **HTML5 Canvas** - Renderizado
- **CSS3** - Interfaz de usuario

## 📱 Compatibilidad con Android

Para convertir el juego en una app Android nativa:

### Usando Capacitor

1. Instala Capacitor:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

2. Agrega la plataforma Android:
```bash
npm install @capacitor/android
npx cap add android
```

3. Copia los archivos web:
```bash
npx cap copy
```

4. Abre en Android Studio:
```bash
npx cap open android
```

### Usando Cordova

```bash
cordova create goxecraft-app com.goxecraft.app Goxecraft
cd goxecraft-app
cordova platform add android
# Copia los archivos del juego a www/
cordova build android
```

## 🎯 Roadmap / Futuras Mejoras

- [ ] Más tipos de bloques (vidrio, ladrillos, etc.)
- [ ] Sistema de guardado/carga de mundos
- [ ] Multijugador básico
- [ ] Mobs y animales
- [ ] Sistema de crafteo
- [ ] Día/noche
- [ ] Sonidos y música
- [ ] Texturas mejoradas
- [ ] Modo supervivencia con vida y hambre
- [ ] Mejores gráficos con shaders

## 🐛 Problemas Conocidos

- En algunos dispositivos móviles antiguos puede haber lag con muchos bloques
- El pointer lock puede no funcionar en algunos navegadores móviles
- La generación de chunks puede causar pequeños stutters

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar Goxecraft:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Daniel Loro** - [@danielloroima999-prog](https://github.com/danielloroima999-prog)

## 🙏 Agradecimientos

- Inspirado en Minecraft de Mojang Studios
- Three.js por el increíble motor 3D
- La comunidad de desarrollo de juegos web

## 📞 Soporte

Si tienes problemas o preguntas:
- Abre un [Issue](https://github.com/danielloroima999-prog/goxecraft/issues)
- Contacta al autor

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!

🎮 **¡Disfruta construyendo tu mundo en Goxecraft!**