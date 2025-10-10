# 🔧 Docker Commands Cheatsheet

## 📦 Docker Compose Commands

### Servicios

```bash
# Iniciar todos los servicios
docker-compose up -d

# Iniciar servicios específicos
docker-compose up -d api
docker-compose up -d db

# Detener todos los servicios
docker-compose down

# Detener sin eliminar volúmenes
docker-compose stop

# Reiniciar servicios
docker-compose restart
docker-compose restart api

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs
docker-compose logs -f              # Follow mode
docker-compose logs -f api          # Solo API
docker-compose logs --tail=100 api  # Últimas 100 líneas
```

### Construcción y Actualización

```bash
# Reconstruir imágenes
docker-compose build
docker-compose build --no-cache  # Sin caché

# Actualizar imágenes
docker-compose pull
docker-compose pull api

# Recrear contenedores
docker-compose up -d --force-recreate
```

### Limpieza

```bash
# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores + volúmenes
docker-compose down -v

# Detener y eliminar contenedores + volúmenes + imágenes
docker-compose down -v --rmi all
```

---

## 🐳 Docker Commands

### Contenedores

```bash
# Listar contenedores activos
docker ps

# Listar todos los contenedores
docker ps -a

# Ver logs de un contenedor
docker logs task-manager-api
docker logs -f task-manager-api
docker logs --tail=100 task-manager-api

# Entrar en un contenedor
docker exec -it task-manager-api sh
docker exec -it task-manager-db bash

# Ejecutar comando en contenedor
docker exec task-manager-api node -v
docker exec task-manager-db mysql --version

# Detener contenedor
docker stop task-manager-api

# Iniciar contenedor detenido
docker start task-manager-api

# Reiniciar contenedor
docker restart task-manager-api

# Eliminar contenedor
docker rm task-manager-api
docker rm -f task-manager-api  # Forzar
```

### Imágenes

```bash
# Listar imágenes
docker images

# Descargar imagen
docker pull ghcr.io/henryromero-dev/ai-task-manager:latest

# Eliminar imagen
docker rmi ghcr.io/henryromero-dev/ai-task-manager:latest

# Construir imagen
docker build -t ai-task-manager .
docker build -t ai-task-manager:v1.0.0 .

# Limpiar imágenes no usadas
docker image prune
docker image prune -a  # Todas
```

### Volúmenes

```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect ai-task-manager_db-data

# Eliminar volumen
docker volume rm ai-task-manager_db-data

# Limpiar volúmenes no usados
docker volume prune
```

### Redes

```bash
# Listar redes
docker network ls

# Inspeccionar red
docker network inspect ai-task-manager_task-network

# Eliminar red
docker network rm ai-task-manager_task-network
```

### Sistema

```bash
# Ver uso de espacio
docker system df

# Limpiar todo el sistema
docker system prune
docker system prune -a          # Incluir imágenes
docker system prune -a --volumes # Incluir volúmenes

# Ver estadísticas de recursos
docker stats
docker stats task-manager-api
```

---

## 🗄️ Database Commands

### Desde el host

```bash
# Conectarse a MySQL
docker-compose exec db mysql -u root -p

# Ejecutar query SQL
docker-compose exec db mysql -u root -p -e "SHOW DATABASES;"

# Importar SQL
docker-compose exec -T db mysql -u root -p task_manager < backup.sql

# Exportar base de datos (backup)
docker-compose exec db mysqldump -u root -p task_manager > backup.sql

# Exportar solo estructura
docker-compose exec db mysqldump -u root -p --no-data task_manager > structure.sql

# Exportar solo datos
docker-compose exec db mysqldump -u root -p --no-create-info task_manager > data.sql
```

### Dentro del contenedor

```bash
# Entrar al contenedor
docker-compose exec db bash

# Conectarse a MySQL
mysql -u root -p

# Queries útiles
SHOW DATABASES;
USE task_manager;
SHOW TABLES;
SELECT * FROM tasks LIMIT 10;
DESCRIBE tasks;
```

---

## 🔍 Debugging

### Ver información detallada

```bash
# Inspeccionar contenedor
docker inspect task-manager-api

# Ver procesos en contenedor
docker top task-manager-api

# Ver cambios en el filesystem
docker diff task-manager-api

# Health check
docker inspect --format='{{.State.Health.Status}}' task-manager-api
```

### Copiar archivos

```bash
# Del host al contenedor
docker cp local-file.txt task-manager-api:/app/

# Del contenedor al host
docker cp task-manager-api:/app/exports/task.md ./
```

### Variables de entorno

```bash
# Ver todas las variables
docker-compose exec api env

# Ver variable específica
docker-compose exec api printenv DB_HOST
```

---

## 🚀 Deployment Commands

### Desarrollo

```bash
# Iniciar en modo desarrollo
docker-compose up

# Rebuild y reiniciar
docker-compose up --build

# Ver logs en tiempo real
docker-compose logs -f
```

### Producción

```bash
# Pull imagen desde registry
docker-compose -f docker-compose.production.yml pull

# Iniciar servicios
docker-compose -f docker-compose.production.yml up -d

# Ver estado
docker-compose -f docker-compose.production.yml ps

# Ver logs
docker-compose -f docker-compose.production.yml logs -f api

# Actualizar (zero downtime)
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d --no-deps api
```

---

## 📊 Monitoring

### Logs

```bash
# Logs en tiempo real con timestamps
docker-compose logs -f -t

# Filtrar logs
docker-compose logs | grep ERROR
docker-compose logs api | grep "listening on"

# Guardar logs
docker-compose logs > logs.txt
```

### Recursos

```bash
# Ver uso de CPU/Memoria
docker stats

# Ver uso continuo
docker stats --no-stream

# Stats de un contenedor específico
docker stats task-manager-api
```

### Health Checks

```bash
# Verificar health de la API
curl http://localhost:3000/health

# Dentro del contenedor
docker-compose exec api wget -O- http://localhost:3000/health

# Ver estado del health check
docker inspect --format='{{json .State.Health}}' task-manager-api | jq
```

---

## 🔐 Security & Maintenance

### Actualizaciones

```bash
# Actualizar imágenes base
docker-compose pull
docker-compose up -d

# Ver qué imágenes tienen actualizaciones
docker images --filter "dangling=false"
```

### Backups

```bash
# Backup completo
docker-compose exec db mysqldump -u root -p --all-databases > full-backup.sql

# Backup con fecha
docker-compose exec db mysqldump -u root -p task_manager > backup-$(date +%Y%m%d).sql

# Backup de volúmenes
docker run --rm -v ai-task-manager_db-data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz /data
```

### Limpieza programada

```bash
# Script de limpieza semanal (agregar a cron)
#!/bin/bash
docker system prune -f
docker volume prune -f
docker image prune -a -f --filter "until=168h"
```

---

## 💡 Tips & Tricks

### Alias útiles (agregar a ~/.bashrc o ~/.zshrc)

```bash
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcr='docker-compose restart'
alias dcp='docker-compose ps'
```

### PowerShell aliases (agregar a $PROFILE)

```powershell
function dps { docker ps $args }
function dpsa { docker ps -a $args }
function di { docker images $args }
function dcu { docker-compose up -d $args }
function dcd { docker-compose down $args }
function dcl { docker-compose logs -f $args }
function dcr { docker-compose restart $args }
function dcp { docker-compose ps $args }
```

### One-liners útiles

```bash
# Detener todos los contenedores
docker stop $(docker ps -q)

# Eliminar todos los contenedores detenidos
docker rm $(docker ps -a -q)

# Eliminar todas las imágenes
docker rmi $(docker images -q)

# Limpiar todo
docker system prune -a --volumes -f

# Ver IPs de contenedores
docker inspect -f '{{.Name}} - {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q)
```

---

## 🎯 Common Workflows

### Reinicio completo

```bash
docker-compose down -v
docker-compose up -d
docker-compose logs -f
```

### Actualizar solo API sin tocar DB

```bash
docker-compose pull api
docker-compose up -d --no-deps api
docker-compose logs -f api
```

### Debugging de problemas

```bash
# 1. Ver logs
docker-compose logs api

# 2. Ver variables de entorno
docker-compose exec api env

# 3. Entrar al contenedor
docker-compose exec api sh

# 4. Verificar conectividad
docker-compose exec api ping db

# 5. Ver procesos
docker-compose exec api ps aux
```

### Migración a otro servidor

```bash
# En el servidor viejo
docker-compose exec db mysqldump -u root -p task_manager > backup.sql
tar czf exports-backup.tar.gz api/exports/

# Transferir archivos al nuevo servidor
scp backup.sql user@new-server:~/
scp exports-backup.tar.gz user@new-server:~/

# En el servidor nuevo
docker-compose up -d
docker-compose exec -T db mysql -u root -p task_manager < backup.sql
tar xzf exports-backup.tar.gz
docker-compose restart api
```

---

## 📚 Referencias

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Project Documentation](./DOCKER_DEPLOYMENT.md)
