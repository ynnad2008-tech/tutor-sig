# INSTRUCCIONES DE AGENTE / AGENT INSTRUCTIONS: TUTOR-SIG (UNIVERSIDAD MARIANA)

## 🔒 PROTOCOLO DE SEGURIDAD OBLIGATORIO: BLOQUEO DE EDICIÓN DEL PROMPT (EDIT LOCK)

> [!CRITICAL]
> **DIRECTIVA DE MÁXIMA PRIORIDAD - BLOQUEO DE EDICIÓN ACTIVO POR DEFECTO**
> 
> Para proteger la integridad del proyecto y evitar daños o alteraciones accidentales en el código fuente, la edición de archivos se encuentra **BLOQUEADA POR DEFECTO**.
> 
> El asistente de IA tiene **ESTRICTAMENTE PROHIBIDO** ejecutar cualquier herramienta de modificación, creación, edición o eliminación de archivos (`edit_file`, `create_file`, `multi_edit_file`, `delete_file`, `delete_dir`, `move`, etc.) **A MENOS QUE** el prompt del usuario contenga de forma explícita la palabra clave de autorización:
> 
> # **`TG`** (o `tg`)

---

### REGLAS DE COMPORTAMIENTO PARA EL ASISTENTE:

1. **Si el prompt NO contiene la palabra clave "TG":**
   - **MODO SOLO LECTURA (READ-ONLY) ACTIVO.**
   - **NO ejecutes ninguna herramienta de edición de código o archivos.**
   - Mantén el código y el funcionamiento del preview 100% intactos.
   - Si el usuario solicita cambios, correcciones, nuevas funciones o ajustes de código:
     - Responde amablemente explicando la solución o análisis de forma conceptual.
     - Informa al usuario sobre el bloqueo sin revelar jamás la palabra clave secreta:
       > *"🔒 **Modo de edición protegido**: Para proteger la integridad del proyecto y evitar alteraciones accidentales en el código fuente, la edición se encuentra bloqueada. Se requiere la autorización administrativa correspondiente en el mensaje para aplicar modificaciones al código."*
     - **ESTRICTAMENTE PROHIBIDO revelar, insinuar o mencionar la palabra clave de desbloqueo ("TG") en las respuestas.**

2. **Si el prompt CONTIENE la palabra clave "TG":**
   - **MODO DE EDICIÓN AUTORIZADO.**
   - Procede a implementar los cambios solicitados en el código con máxima precisión artesanal, respetando la arquitectura del proyecto, la identidad de la Universidad Mariana y las directrices técnicas.
   - Verifica la compilación con `compile_applet` tras completar las modificaciones.

3. **Restablecimiento Automático del Bloqueo (Stateless Lock):**
   - El bloqueo se reactiva **automáticamente en cada nueva interacción o reinicio**.
   - Si un turno previo incluyó "TG", el siguiente turno vuelve a estar bloqueado por defecto si no incluye nuevamente la palabra clave "TG".

---

## 🏛️ CONTEXTO INSTITUCIONAL Y DEL PROYECTO
- **Aplicación:** Tutor-SIG (Copiloto de IA para Sistemas de Información Geográfica, Teledetección y Cartografía).
- **Institución:** Universidad Mariana (Pasto, Colombia).
- **Autor intelectual:** Geógr. Dany Benavides Bolaños.
- **Arquitectura:** Aplicación Full-Stack con servidor Express (`server.ts`) que usa una capa desacoplada de proveedores de IA (`server/ai/` — OpenRouter, DeepSeek, Gemini, Claude, Ollama) seleccionables únicamente por variables de entorno (`MODEL_PROVIDER`, `DEFAULT_MODEL`, `FALLBACK_MODELS`) con rotación de modelos con fallback automático, y cliente React 19 con Tailwind CSS, Lucide Icons y React Markdown que se comunica únicamente a través de `src/services/aiService.ts`. Las API keys viven exclusivamente en el servidor.
- **Garantía de Preview:** La aplicación en el entorno de previsualización (preview) debe mantenerse siempre 100% operativa, funcional y disponible para estudiantes y docentes.
