# Publicar el catálogo público

Este sitio es estático y no usa cuentas, Supabase ni base de datos. Todo elemento incluido en `library.json` y todo archivo publicado en el repositorio es público: cualquier visitante puede verlo o descargarlo.

## Recibir propuestas

Los visitantes pueden proponer un enlace desde el botón **Proponer contenido**. El formulario prepara un correo a la dirección receptora configurada en `app.js`; el visitante debe abrir su aplicación de correo y pulsar **Enviar**. El sitio no manda ni almacena las propuestas automáticamente. La dirección receptora está en el JavaScript público del sitio.

Después de revisar una propuesta:

1. Si la aceptas, agrega el archivo público necesario a `assets/` o usa el enlace enviado.
2. Edita el arreglo `items` en `library.json`.
3. Guarda los cambios en GitHub para volver a publicar el catálogo.

El formulario acepta enlaces, no sube archivos. Para proponer un documento, una imagen u otro archivo, el visitante debe enviar un enlace público de descarga. No publiques contenido privado ni materiales sin permiso.

Ejemplo de canción de YouTube en `library.json`:

```json
{
  "id": "mi-video-favorito",
  "category": "music",
  "kind": "youtube",
  "title": "Nombre de la canción",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

Ejemplo de imagen subida al repositorio:

```json
{
  "id": "foto-de-ejemplo",
  "category": "images",
  "kind": "image",
  "title": "Foto de ejemplo",
  "url": "assets/foto.jpg"
}
```

Categorías admitidas: `music`, `documents`, `games`, `images` y `other`.

Tipos admitidos:

- `youtube`: enlace de YouTube; usa el reproductor oficial.
- `audio`: URL directa a un archivo de audio compatible.
- `image`: imagen pública; aparece en la galería.
- `file`: archivo público que se abre o descarga.
- `link`: enlace externo que se abre en otra pestaña.

Usa rutas relativas del sitio, como `assets/mi-cancion.mp3`, para archivos del repositorio. YouTube se reproduce con su reproductor oficial. Otros sitios solo se reproducen dentro de la página si el enlace va directamente al archivo de audio; en caso contrario, guárdalos como `link`.

## Publicar con GitHub Pages

Sube el repositorio a GitHub, abre **Settings → Pages**, elige desplegar desde la rama principal y la carpeta raíz. No necesitas configurar variables, claves, usuarios ni servicios externos.

Los archivos que se guardaron en el navegador en una versión anterior siguen en ese navegador, pero no se publican ni aparecen automáticamente en el catálogo compartido. Añade solamente el contenido que quieras hacer público a `library.json` y al repositorio. No incluyas material privado, protegido por derechos que no tengas permiso para publicar ni información personal.
