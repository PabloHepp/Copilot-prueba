<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Sistema Educativo Infantil - Instrucciones para Copilot

Este es un proyecto de sistema educativo para niños de 5-8 años que simula un entorno de escritorio educativo con modo kiosco.

## Características del Proyecto:

### Arquitectura
- **Tecnologías**: TypeScript, HTML5, CSS3, Vite
- **Estructura**: Aplicaciones modulares con clase base `Application`
- **Modo Kiosco**: Sistema de seguridad para prevenir salida accidental
- **Optimización**: Diseñado para PCs de bajos recursos

### Aplicaciones Educativas
1. **MathApp**: Matemáticas básicas (suma, resta, multiplicación)
2. **LettersApp**: Aprendizaje de letras (identificación, parejas mayúsculas/minúsculas, escritura)
3. **ColorsApp**: Reconocimiento de colores
4. **ShapesApp**: Identificación de formas geométricas
5. **MusicApp**: Piano virtual e instrumentos musicales
6. **PuzzleApp**: Rompecabezas con diferentes dificultades
7. **AdminApp**: Panel de administración para profesores

### Consideraciones de Diseño
- **Interfaz**: Amigable para niños con iconos grandes y colores vibrantes
- **Accesibilidad**: Soporte táctil, botones grandes, retroalimentación visual/auditiva
- **Seguridad**: Modo kiosco previene acceso a funciones del sistema
- **Educativo**: Progresión de dificultad y sistema de puntuación

### Patrones de Código
- Todas las aplicaciones extienden la clase base `Application`
- Uso de Web Audio API para efectos de sonido
- LocalStorage para persistencia de datos
- Responsive design para diferentes tamaños de pantalla

### Modo Kiosco
- Deshabilitación de atajos de teclado peligrosos
- Prevención de zoom accidental
- Mantenimiento de pantalla completa
- Código de salida de emergencia: "SALIR123"

Cuando trabajes en este proyecto, ten en cuenta que está dirigido a niños pequeños, por lo que prioriza la simplicidad, la accesibilidad y la seguridad.
