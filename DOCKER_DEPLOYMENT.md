# AI Task Manager - Docker Deployment Guide

## 📋 Contenido

1. [Desarrollo Local](#desarrollo-local)
2. [Producción con VPS](#producción-con-vps)
3. [GitHub Actions](#github-actions)
4. [Comandos Útiles](#comandos-útiles)

---

## 🛠️ Desarrollo Local

### Prerequisitos

- Docker >= 20.10
- Docker Compose >= 2.0

### Configuración Inicial

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/henryromero-dev/ai-task-manager.git
   cd ai-task-manager
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita `.env` y configura:
   - `DB_USER`: Usuario de la base de datos
   - `DB_PASSWORD`: Contraseña de la base de datos
   - `DB_ROOT_PASSWORD`: Contraseña root de MySQL
   - `OPENPROJECT_URL`: URL de tu instancia OpenProject
   - `OPENPROJECT_API_KEY`: API Key de OpenProject

3. **Levantar los servicios**
   ```bash
   docker-compose up -d
   ```

4. **Verificar que todo está corriendo**
   ```bash
   docker-compose ps
   ```

5. **Ver logs**
   ```bash
   docker-compose logs -f api
   ```

6. **Acceder a la API**
   ```
   http://localhost:3000
   ```

---

## 🚀 Producción con VPS

### Prerequisitos en el VPS

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### Configuración del VPS

1. **Crear directorio para la aplicación**
   ```bash
   mkdir -p ~/ai-task-manager
   cd ~/ai-task-manager
   ```

2. **Crear archivo de variables de entorno**
   ```bash
   nano .env
   ```
   
   Contenido del `.env`:
   ```env
   # API Configuration
   API_PORT=3000
   NODE_ENV=production

   # Database Configuration
   DB_HOST=db
   DB_PORT=3306
   DB_USER=taskmanager
   DB_PASSWORD=TU_PASSWORD_SEGURO_AQUI
   DB_ROOT_PASSWORD=TU_ROOT_PASSWORD_AQUI
   DB_NAME=task_manager
   DB_EXTERNAL_PORT=3306

   # OpenProject Integration
   OPENPROJECT_URL=https://tu-instancia.openproject.com
   OPENPROJECT_API_KEY=tu_api_key_aqui

   # Sync Configuration
   SYNC_INTERVAL_MINUTES=30
   ```

3. **Descargar el docker-compose para producción**
   ```bash
   wget https://raw.githubusercontent.com/henryromero-dev/ai-task-manager/main/docker-compose.production.yml -O docker-compose.yml
   ```

4. **Autenticarse en GitHub Container Registry**
   ```bash
   # Crear un Personal Access Token en GitHub con permisos de read:packages
   echo "TU_GITHUB_TOKEN" | docker login ghcr.io -u TU_USUARIO_GITHUB --password-stdin
   ```

5. **Levantar los servicios**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

### Configurar Nginx como Reverse Proxy (Opcional pero Recomendado)

1. **Instalar Nginx**
   ```bash
   sudo apt install nginx -y
   ```

2. **Crear configuración del sitio**
   ```bash
   sudo nano /etc/nginx/sites-available/task-manager
   ```
   
   Contenido:
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Activar el sitio**
   ```bash
   sudo ln -s /etc/nginx/sites-available/task-manager /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Configurar SSL con Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d tu-dominio.com
   ```

### Actualizar a una Nueva Versión

```bash
cd ~/ai-task-manager
docker-compose pull
docker-compose up -d
```

---

## 🔄 GitHub Actions

### Crear un Tag para Generar la Imagen

La imagen de Docker se crea automáticamente cuando creas un tag en GitHub:

```bash
# Crear un tag localmente
git tag v1.0.0
git push origin v1.0.0
```

Esto activará el workflow de GitHub Actions que:
1. Construirá la imagen Docker
2. La subirá a GitHub Container Registry
3. Creará un release en GitHub

### Formato de Tags

- **Versiones completas**: `v1.0.0`, `v2.1.3`
- Se generarán automáticamente tags adicionales:
  - `v1.0.0` → también tagueado como `v1.0` y `v1`
  - `latest` → para el tag más reciente en la rama principal

### Ver las Imágenes Disponibles

Las imágenes estarán disponibles en:
```
ghcr.io/henryromero-dev/ai-task-manager:latest
ghcr.io/henryromero-dev/ai-task-manager:v1.0.0
ghcr.io/henryromero-dev/ai-task-manager:v1.0
ghcr.io/henryromero-dev/ai-task-manager:v1
```

---

## 🔧 Comandos Útiles

### Docker Compose

```bash
# Ver estado de los servicios
docker-compose ps

# Ver logs
docker-compose logs -f
docker-compose logs -f api
docker-compose logs -f db

# Reiniciar servicios
docker-compose restart
docker-compose restart api

# Detener servicios
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores + volúmenes
docker-compose down -v

# Reconstruir las imágenes
docker-compose build
docker-compose up -d --build

# Ejecutar comandos en un contenedor
docker-compose exec api sh
docker-compose exec db mysql -u root -p
```

### Docker

```bash
# Listar contenedores
docker ps
docker ps -a

# Ver logs de un contenedor
docker logs task-manager-api
docker logs -f task-manager-api

# Entrar a un contenedor
docker exec -it task-manager-api sh

# Ver uso de recursos
docker stats

# Limpiar sistema
docker system prune -a
docker volume prune
```

### Base de Datos

```bash
# Conectarse a MySQL
docker-compose exec db mysql -u root -p

# Backup de la base de datos
docker-compose exec db mysqldump -u root -p task_manager > backup.sql

# Restaurar backup
docker-compose exec -T db mysql -u root -p task_manager < backup.sql

# Ver logs de MySQL
docker-compose logs -f db
```

### Mantenimiento

```bash
# Ver espacio usado por Docker
docker system df

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar volúmenes no usados
docker volume prune

# Limpiar todo (contenedores detenidos, redes, imágenes, cache)
docker system prune -a --volumes
```

---

## 🔒 Seguridad

### Recomendaciones

1. **Variables de entorno**: Nunca hagas commit del archivo `.env`
2. **Contraseñas**: Usa contraseñas fuertes para la base de datos
3. **Firewall**: Configura el firewall del VPS
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```
4. **Actualizaciones**: Mantén el sistema y Docker actualizados
5. **GitHub Token**: Usa un token con permisos mínimos (solo `read:packages`)

---

## 🐛 Troubleshooting

### La API no inicia

```bash
# Ver logs detallados
docker-compose logs -f api

# Verificar variables de entorno
docker-compose exec api env | grep DB

# Reiniciar el contenedor
docker-compose restart api
```

### Error de conexión a la base de datos

```bash
# Verificar que MySQL esté corriendo
docker-compose ps db

# Ver logs de MySQL
docker-compose logs db

# Verificar conectividad
docker-compose exec api ping db
```

### Puerto ya en uso

```bash
# Cambiar el puerto en .env
API_PORT=3001

# O encontrar qué proceso usa el puerto
sudo lsof -i :3000
sudo netstat -tulpn | grep 3000
```

---

## 📞 Soporte

Si encuentras problemas, revisa:
- Los logs: `docker-compose logs -f`
- GitHub Issues: https://github.com/henryromero-dev/ai-task-manager/issues
- Documentación técnica: `TECHNICAL_DOCS.md`
