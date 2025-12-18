# 📰 API de Foros/Anuncios

Sistema de publicaciones donde el ADMIN/COACH escribe posts y todos los usuarios autenticados pueden leerlos.

---

## 📋 Modelo de Datos

```typescript
{
  id: string           // ID único del post
  title: string        // Título del post
  content: string      // Contenido (puede ser largo, tipo Text)
  authorId: string     // ID del usuario que lo creó
  author: User         // Relación con el autor
  published: boolean   // true = publicado, false = borrador
  createdAt: DateTime  // Fecha de creación
  updatedAt: DateTime  // Última actualización
}
```

---

## 🔌 ENDPOINTS

### 📝 ADMIN/COACH - Crear Post

```http
POST /forums
Authorization: Bearer <token>
Content-Type: application/json
```

**Acceso:** Solo ADMIN o COACH

**Body:**
```json
{
  "title": "Horarios Especiales - Diciembre 2025",
  "content": "Les informamos que durante diciembre tendremos los siguientes cambios de horario:\n\n- 24/12: Cerrado\n- 25/12: Cerrado\n- 31/12: Solo turno mañana (7am-12pm)\n- 01/01: Cerrado\n\nGracias por su comprensión!",
  "published": true
}
```

**Campos:**
- `title` (string, requerido): Título del post
- `content` (string, requerido): Contenido completo
- `published` (boolean, opcional): true = publicado inmediatamente, false = guardar como borrador (default: true)

**Respuesta:**
```json
{
  "id": "cm5xyz123",
  "title": "Horarios Especiales - Diciembre 2025",
  "content": "Les informamos que...",
  "authorId": "cm123admin",
  "published": true,
  "createdAt": "2025-10-31T10:00:00.000Z",
  "updatedAt": "2025-10-31T10:00:00.000Z",
  "author": {
    "id": "cm123admin",
    "email": "admin@box.com",
    "role": "ADMIN"
  }
}
```

---

### 📖 PÚBLICO - Listar Posts

```http
GET /forums
GET /forums?includeUnpublished=true
Authorization: Bearer <token>
```

**Acceso:** Todos los usuarios autenticados

**Query params:**
- `includeUnpublished` (boolean, opcional): Solo ADMIN/COACH pueden ver posts no publicados (default: false)

**Respuesta:**
```json
[
  {
    "id": "cm5xyz123",
    "title": "Horarios Especiales - Diciembre 2025",
    "content": "Les informamos que...",
    "authorId": "cm123admin",
    "published": true,
    "createdAt": "2025-10-31T10:00:00.000Z",
    "updatedAt": "2025-10-31T10:00:00.000Z",
    "author": {
      "id": "cm123admin",
      "email": "admin@box.com",
      "role": "ADMIN"
    }
  },
  {
    "id": "cm5abc456",
    "title": "Nuevo WOD: Murph Challenge",
    "content": "El sábado 15/11 haremos el clásico Murph...",
    "published": true,
    "createdAt": "2025-10-30T08:00:00.000Z",
    "author": {
      "id": "cm456coach",
      "email": "coach@box.com",
      "role": "COACH"
    }
  }
]
```

**Nota:** Los posts se devuelven ordenados por `createdAt` descendente (más recientes primero).

---

### 📄 PÚBLICO - Ver un Post

```http
GET /forums/:id
Authorization: Bearer <token>
```

**Acceso:** Todos los usuarios autenticados

**Respuesta:**
```json
{
  "id": "cm5xyz123",
  "title": "Horarios Especiales - Diciembre 2025",
  "content": "Les informamos que durante diciembre tendremos los siguientes cambios de horario:\n\n- 24/12: Cerrado\n- 25/12: Cerrado\n- 31/12: Solo turno mañana (7am-12pm)\n- 01/01: Cerrado\n\nGracias por su comprensión!",
  "authorId": "cm123admin",
  "published": true,
  "createdAt": "2025-10-31T10:00:00.000Z",
  "updatedAt": "2025-10-31T10:00:00.000Z",
  "author": {
    "id": "cm123admin",
    "email": "admin@box.com",
    "role": "ADMIN"
  }
}
```

**Errores:**
- 404: Post no encontrado

---

### ✏️ ADMIN/COACH - Actualizar Post

```http
PUT /forums/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Acceso:** Solo ADMIN o COACH

**Body (todos los campos opcionales):**
```json
{
  "title": "Horarios Especiales - ACTUALIZADO",
  "content": "Contenido actualizado...",
  "published": false
}
```

**Respuesta:**
```json
{
  "id": "cm5xyz123",
  "title": "Horarios Especiales - ACTUALIZADO",
  "content": "Contenido actualizado...",
  "published": false,
  "updatedAt": "2025-10-31T11:30:00.000Z",
  "author": {
    "id": "cm123admin",
    "email": "admin@box.com",
    "role": "ADMIN"
  }
}
```

---

### 🔄 ADMIN/COACH - Cambiar Estado Publicación

```http
PUT /forums/:id/toggle
Authorization: Bearer <token>
```

**Acceso:** Solo ADMIN o COACH

**Acción:** Cambia `published` de true → false o false → true

**Respuesta:**
```json
{
  "id": "cm5xyz123",
  "title": "Horarios Especiales - Diciembre 2025",
  "published": false,
  "updatedAt": "2025-10-31T12:00:00.000Z",
  "author": {
    "id": "cm123admin",
    "email": "admin@box.com",
    "role": "ADMIN"
  }
}
```

**Uso:** Útil para ocultar/mostrar rápidamente un post sin eliminarlo.

---

### 🗑️ ADMIN/COACH - Eliminar Post

```http
DELETE /forums/:id
Authorization: Bearer <token>
```

**Acceso:** Solo ADMIN o COACH

**Respuesta:**
```json
{
  "message": "Post eliminado",
  "id": "cm5xyz123"
}
```

**Nota:** Esto elimina permanentemente el post de la base de datos.

---

## 🎨 EJEMPLOS DE USO EN FRONTEND

### 1. Listar Posts (Vista Pública)

```typescript
// Componente: ForumList.tsx
async function loadForumPosts() {
  try {
    const response = await fetch('http://localhost:3000/forums', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Error al cargar posts');
    
    const posts = await response.json();
    
    // Mostrar en UI
    posts.forEach(post => {
      console.log(`${post.title} - por ${post.author.email}`);
      console.log(post.content);
      console.log(`Publicado: ${new Date(post.createdAt).toLocaleDateString()}`);
    });
    
    return posts;
  } catch (error) {
    console.error(error);
  }
}
```

---

### 2. Crear Post (Admin)

```typescript
// Componente: CreateForumPost.tsx (Admin Panel)
async function createPost(formData) {
  try {
    const response = await fetch('http://localhost:3000/forums', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: formData.title,
        content: formData.content,
        published: true // o false para guardar como borrador
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const newPost = await response.json();
    alert('Post creado exitosamente!');
    return newPost;
    
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}
```

---

### 3. Ver Detalle de un Post

```typescript
// Componente: ForumPostDetail.tsx
async function loadPostDetail(postId) {
  try {
    const response = await fetch(`http://localhost:3000/forums/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Post no encontrado');
      }
      throw new Error('Error al cargar el post');
    }
    
    const post = await response.json();
    
    // Renderizar
    return {
      title: post.title,
      content: post.content,
      author: post.author.email,
      date: new Date(post.createdAt).toLocaleDateString(),
      isPublished: post.published
    };
    
  } catch (error) {
    console.error(error);
  }
}
```

---

### 4. Actualizar Post (Admin)

```typescript
// Componente: EditForumPost.tsx
async function updatePost(postId, updates) {
  try {
    const response = await fetch(`http://localhost:3000/forums/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: updates.title,
        content: updates.content,
        published: updates.published
      })
    });
    
    if (!response.ok) throw new Error('Error al actualizar');
    
    const updatedPost = await response.json();
    alert('Post actualizado!');
    return updatedPost;
    
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}
```

---

### 5. Publicar/Despublicar (Toggle)

```typescript
// Botón rápido para ocultar/mostrar post
async function togglePublish(postId) {
  try {
    const response = await fetch(`http://localhost:3000/forums/${postId}/toggle`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!response.ok) throw new Error('Error al cambiar estado');
    
    const updatedPost = await response.json();
    const status = updatedPost.published ? 'publicado' : 'ocultado';
    alert(`Post ${status} exitosamente`);
    
    return updatedPost;
    
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}
```

---

### 6. Eliminar Post (Admin)

```typescript
async function deletePost(postId) {
  if (!confirm('¿Estás seguro de eliminar este post? Esta acción no se puede deshacer.')) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3000/forums/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!response.ok) throw new Error('Error al eliminar');
    
    const result = await response.json();
    alert('Post eliminado exitosamente');
    
    // Recargar lista de posts
    window.location.reload();
    
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}
```

---

## 🎯 CASOS DE USO COMUNES

### Caso 1: Feed de Anuncios en Home

```typescript
// Mostrar últimos 5 anuncios en página principal
const recentPosts = await fetch('/forums')
  .then(r => r.json());

const feed = recentPosts.slice(0, 5).map(post => ({
  title: post.title,
  excerpt: post.content.substring(0, 150) + '...',
  date: new Date(post.createdAt).toLocaleDateString(),
  id: post.id
}));

// Renderizar cards con link a detalle
```

---

### Caso 2: Panel Admin con Borradores

```typescript
// Admin puede ver todos los posts incluyendo borradores
const allPosts = await fetch('/forums?includeUnpublished=true', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
}).then(r => r.json());

const published = allPosts.filter(p => p.published);
const drafts = allPosts.filter(p => !p.published);

console.log(`${published.length} publicados, ${drafts.length} borradores`);
```

---

### Caso 3: Notificación de Nuevo Post

```typescript
// Cuando admin crea post, notificar a todos
async function createAndNotify(postData) {
  const newPost = await createPost(postData);
  
  // Enviar notificación push/email a todos los atletas
  await fetch('/notifications/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: `Nuevo anuncio: ${newPost.title}`,
      message: newPost.content.substring(0, 100) + '...',
      link: `/forums/${newPost.id}`
    })
  });
}
```

---

## 📝 NOTAS IMPORTANTES

1. **Autenticación requerida**: Todos los endpoints requieren JWT válido
2. **Permisos**:
   - ADMIN/COACH: Crear, editar, eliminar, publicar/despublicar
   - ATHLETE: Solo leer posts publicados
3. **Contenido**: El campo `content` soporta texto largo (type `Text` en BD)
4. **Markdown**: Puedes usar Markdown en el frontend para formatear el contenido
5. **Ordenamiento**: Posts se listan por fecha descendente (más nuevos primero)
6. **Soft delete**: No hay soft delete; usar `published: false` para ocultar sin borrar

---

## 🚀 TESTING CON CURL

```bash
# Login como admin
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.access_token')

# Crear post
curl -X POST http://localhost:3000/forums \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Horarios Especiales",
    "content": "Cerrado 24 y 25 de diciembre",
    "published": true
  }'

# Listar posts
curl http://localhost:3000/forums \
  -H "Authorization: Bearer $TOKEN"

# Ver un post
curl http://localhost:3000/forums/POST_ID \
  -H "Authorization: Bearer $TOKEN"

# Actualizar post
curl -X PUT http://localhost:3000/forums/POST_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "Nuevo título"}'

# Toggle publicación
curl -X PUT http://localhost:3000/forums/POST_ID/toggle \
  -H "Authorization: Bearer $TOKEN"

# Eliminar post
curl -X DELETE http://localhost:3000/forums/POST_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## ❓ FAQ

**P: ¿Puedo usar HTML en el contenido?**
R: Sí, pero debes sanitizarlo en el frontend para evitar XSS. Recomendamos usar Markdown.

**P: ¿Hay límite de caracteres?**
R: No en el backend (type `Text`). En frontend puedes poner validación.

**P: ¿Los posts borrados se pueden recuperar?**
R: No, el DELETE es permanente. Usa `published: false` si quieres ocultar temporalmente.

**P: ¿Puedo agregar comentarios?**
R: No en esta versión. Requeriría crear modelo `ForumComment` con relación a `Forum`.

**P: ¿Puedo subir imágenes?**
R: No directamente. Sube la imagen al endpoint `/media/upload` primero y luego incluye la URL en el `content`.

---

**Última actualización:** 31 de Octubre, 2025
