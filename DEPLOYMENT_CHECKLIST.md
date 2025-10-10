# 📦 Archivos de Configuración Docker y CI/CD

## ✅ Archivos Creados

### 🐳 Docker
- **`Dockerfile`** - Imagen multi-stage optimizada para producción
- **`docker-compose.yml`** - Configuración para desarrollo local
- **`docker-compose.production.yml`** - Configuración para producción en VPS
- **`.dockerignore`** - Archivos excluidos de la imagen Docker
- **`.env.example`** - Plantilla de variables de entorno

### 🔄 GitHub Actions
- **`.github/workflows/docker-build.yml`** - Workflow que:
  - Se activa al crear un tag (ej: `v1.0.0`)
  - Construye la imagen Docker multi-plataforma (amd64/arm64)
  - La sube a GitHub Container Registry
  - Crea un release automáticamente

### 📝 Documentación
- **`DOCKER_DEPLOYMENT.md`** - Guía completa de deployment
- **`QUICKSTART.md`** - Guía rápida de inicio
- **`README.md`** - Actualizado con información de Docker

### 🛠️ Scripts
- **`scripts/deploy.sh`** - Script de deployment para Linux/macOS
- **`scripts/deploy.ps1`** - Script de deployment para Windows/PowerShell
- **`scripts/init-db.sql`** - Script de inicialización de base de datos

### 🔧 Configuración
- **`.gitignore`** - Actualizado para ignorar archivos de Docker
- **`api/exports/.gitkeep`** - Mantiene el directorio de exports en git

---

## 🚀 Uso Rápido

### Desarrollo Local
```bash
docker-compose up -d
```

### Crear Release (genera imagen automáticamente)
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Deploy en VPS
```bash
# Primera vez
docker login ghcr.io -u TU_USUARIO
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# Actualizaciones
docker-compose pull
docker-compose up -d
```

---

## 📋 Checklist de Deployment

### Antes de crear el primer tag:

1. ✅ Configurar GitHub Actions
   - Los workflows ya están listos en `.github/workflows/`
   - No requiere configuración adicional

2. ✅ Preparar el VPS
   - Instalar Docker y Docker Compose
   - Configurar firewall (puertos 80, 443, 3000)
   - Obtener un GitHub Personal Access Token con permisos `read:packages`

3. ✅ Configurar variables de entorno
   - Copiar `.env.example` a `.env`
   - Configurar todas las variables requeridas
   - **NUNCA** hacer commit del archivo `.env`

4. ✅ Probar localmente
   ```bash
   docker-compose up -d
   docker-compose logs -f
   curl http://localhost:3000/health
   ```

### Para crear un release:

```bash
# 1. Asegúrate de que todo está commiteado
git status

# 2. Crea el tag (usa versionado semántico)
git tag v1.0.0

# 3. Push del tag
git push origin v1.0.0

# 4. Ve a GitHub Actions para ver el progreso
# https://github.com/henryromero-dev/ai-task-manager/actions

# 5. Una vez completado, la imagen estará disponible en:
# ghcr.io/henryromero-dev/ai-task-manager:v1.0.0
# ghcr.io/henryromero-dev/ai-task-manager:latest
```

### En el VPS:

```bash
# 1. Login a GitHub Container Registry
echo "TU_GITHUB_TOKEN" | docker login ghcr.io -u TU_USUARIO --password-stdin

# 2. Descargar docker-compose.production.yml
cd ~/ai-task-manager
wget https://raw.githubusercontent.com/henryromero-dev/ai-task-manager/main/docker-compose.production.yml -O docker-compose.yml

# 3. Crear .env
cp .env.example .env
nano .env  # Configurar variables

# 4. Deploy
docker-compose pull
docker-compose up -d

# 5. Verificar
docker-compose ps
docker-compose logs -f api
curl http://localhost:3000/health
```

---

## 🔐 Seguridad

### GitHub Token (Personal Access Token)

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Nombre: "VPS Docker Pull"
4. Permisos: Solo marca `read:packages`
5. Genera y copia el token
6. Úsalo para login en el VPS:
   ```bash
   echo "ghp_xxxxxxxxxxxx" | docker login ghcr.io -u tu-usuario --password-stdin
   ```

### Variables de Entorno Sensibles

**NUNCA** incluyas en git:
- Contraseñas de base de datos
- API keys de OpenProject
- Tokens de GitHub
- Cualquier secreto

El archivo `.env` ya está en `.gitignore`.

---

## 🎯 Estructura de Tags Recomendada

```bash
v1.0.0    # Release principal
v1.0.1    # Bugfix
v1.1.0    # Nueva funcionalidad menor
v2.0.0    # Breaking changes
```

GitHub Actions creará automáticamente:
- `v1.0.0` (tag exacto)
- `v1.0` (minor version)
- `v1` (major version)
- `latest` (última versión)

---

## 📊 Monitoreo

### Ver logs en tiempo real
```bash
docker-compose logs -f api
```

### Estado de los servicios
```bash
docker-compose ps
```

### Uso de recursos
```bash
docker stats
```

### Health check
```bash
curl http://localhost:3000/health
```

---

## 🆘 Troubleshooting

### Error al construir la imagen
- Verifica que todos los archivos están commiteados
- Revisa los logs en GitHub Actions
- Verifica que el Dockerfile no tiene errores de sintaxis

### Error al hacer pull en VPS
- Verifica que estás autenticado: `docker login ghcr.io`
- Verifica que el token tiene permisos `read:packages`
- Verifica que la imagen existe: ve a GitHub Packages

### Servicios no inician
```bash
docker-compose logs
docker-compose down -v
docker-compose up -d
```

### Puerto ocupado
```bash
# Cambiar puerto en .env
API_PORT=3001
docker-compose up -d
```

---

## 📚 Documentación Adicional

- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Guía completa
- [QUICKSTART.md](QUICKSTART.md) - Inicio rápido
- [TECHNICAL_DOCS.md](TECHNICAL_DOCS.md) - Documentación técnica
- [api/README.md](api/README.md) - API docs
- [mcp/README.md](mcp/README.md) - MCP docs
