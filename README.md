# Tripy - Backend

Tripy es una aplicación diseñada para conectar usuarios interesados en realizar viajes compartidos a distintas locaciones de México. Este backend gestiona la autenticación, validación de usuarios, creación de viajes, comunicación entre viajeros y el manejo de gastos compartidos.

## 🛠️ Tecnologías utilizadas

- **Node.js** con **Express** para la API.
- **Prisma ORM** para la gestión de la base de datos.
- **OAuth 2.0 API** y **autenticación interna** para el acceso de usuarios.
- **JWT** para el manejo de sesiones.
- **Resend** para el envío de correos electrónicos.
- **WebSockets** para la comunicación en tiempo real (chat entre viajeros).

## 🔄 Flujo principal de la aplicación

1. **Registro de usuario**:  
   - El usuario crea una cuenta con su correo y contraseña o mediante OAuth.  
   - Se envía un correo de verificación usando **Resend**.  

2. **Validación por un administrador**:  
   - El usuario sube una identificación y una foto de su rostro.  
   - Un administrador revisa los documentos y aprueba o rechaza la cuenta.  

3. **Creación de un viaje**:  
   - Un usuario validado puede publicar un viaje con destino, fecha y detalles.  

4. **Unirse a un viaje**:  
   - Otro usuario visualiza el viaje y solicita unirse.  
   - El creador del viaje recibe la solicitud y decide si aceptarla o rechazarla.  

5. **Chat y gastos compartidos**:  
   - Si la solicitud es aceptada, se abre un **chat** entre los dos usuarios.  
   - Pueden agregar y registrar **gastos compartidos** del viaje.  

6. **Finalización del viaje**:  
   - Al terminar el viaje, este se agrega al **historial** de ambos usuarios.  
   - Los usuarios pueden seguir en contacto después del viaje.
  
## Producto Finalizado
https://tripyweb-production.up.railway.app

## 📌 Instalación y configuración

### 1️⃣ Clonar el repositorio
```sh
git clone https://github.com/UrielCandelas/Tripy_Back2.0.git
cd tripy-backend
```
### 2️⃣ Instalar dependencias
```sh
npm install
```
### 3️⃣ Configurar variables de entorno
Crea un archivo .env en la raíz del proyecto con el siguiente contenido:
```ini
DATABASE_URL="mysql://root:<user>@localhost:5432/<tubd>" 
PORT=3000 
SECRET_KEY="isSecret" 
#Email de donde se van a enviar los mails para mailgun, nodemailer y resend
SENDER_EMAIL="sender@mail.com" 
#Contraseña del email para nodemailer
SENDER_PASSWORD="senderpasswd" 
#Claves para el login con google
CLIENT_ID="client_id" 
CLIENT_SECRET="client_secret" 
GOOGLE_REDIRECT_URL="http://127.0.0.1:3000/api/oauth"
ALLOWED_ORIGIN="http://localhost:5173" 
#Login con google en movil
ANDROID_CLIENT_ID="client_id" 
#Claves para cloudinary
CLOUDINARY_CLOUD_NAME="name" 
CLOUDINARY_API_KEY="api_key" 
CLOUDINARY_API_SECRET="secret"
#Claves para mailgun
MAILGUN_API_KEY="api_key"
DOMAIN="dominio"
#Clave para resend (recomendado)
RESEND_API="clave_resend"
```
### 4️⃣ Ejecutar las migraciones de la base de datos
```sh
npx prisma migrate dev --name init
```
5️⃣ Iniciar el servidor
```sh
npm run dev
```
### 🤝 Contribución
Si deseas contribuir, puedes hacer un fork del repositorio y abrir un pull request con tus mejoras.

Este archivo incluye toda la información relevante para el backend de **Tripy**. 🚀
