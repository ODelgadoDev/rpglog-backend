# RPGLog Backend API

Backend oficial de **RPGLog**, desplegado en producción y conectado a **MongoDB Atlas**, desarrollado con **Node.js + Express + Mongoose**.

Este backend proporciona autenticación, progreso RPG, misiones, sincronización y endpoints listos para ser consumidos por el frontend.

---

## Tecnologías usadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- CORS
- dotenv

---

## Estado del proyecto

Actualmente el backend ya cuenta con:

- Autenticación con registro y login
- Endpoint `/api/auth/me`
- Perfil de usuario RPG
- Sistema de progreso global
- Sistema de atributos
- Misiones diarias y personalizadas
- Recompensas por completar misiones
- XP global + XP por stats
- Coins
- Sincronización básica (`sync`)
- Deploy en Render

---

## URL de producción

```txt
https://rpglog-backend.onrender.com

Health check

GET /health

Ejemplo:

https://rpglog-backend.onrender.com/health


⸻

Estructura del proyecto

rpglog-backend/
├── src/
│   ├── config/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── progress.controller.js
│   │   ├── quests.controller.js
│   │   └── sync.controller.js
│   ├── db/
│   │   └── mongo.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── Quest.js
│   │   ├── User.js
│   │   ├── UserProfile.js
│   │   ├── UserStat.js
│   │   └── XpLog.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── progress.routes.js
│   │   ├── quests.routes.js
│   │   └── sync.routes.js
│   ├── services/
│   │   ├── rewardEngine.service.js
│   │   └── userProgress.service.js
│   ├── utils/
│   │   ├── dailyQuests.js
│   │   ├── jwt.js
│   │   ├── progression.js
│   │   └── xp.js
│   ├── app.js
│   └── index.js
├── .env
├── .env.example
├── package.json
└── README.md


⸻

Instalación local

1. Clonar repositorio

git clone https://github.com/ODelgadoDev/rpglog-backend.git
cd rpglog-backend

2. Instalar dependencias

npm install

3. Crear archivo .env

Basarse en .env.example:

PORT=3001
NODE_ENV=development
MONGO_URI=TU_URI_DE_MONGODB_ATLAS
JWT_SECRET=TU_SECRETO
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://localhost:4173

4. Ejecutar en desarrollo

npm run dev

5. Ejecutar en producción local

npm start


⸻

Scripts

npm run dev
npm start


⸻

Endpoints principales

Base URL local

http://localhost:3001

Base URL producción

https://rpglog-backend.onrender.com


⸻

Auth

Ping

GET /api/auth/ping

Register

POST /api/auth/register

Body:

{
  "username": "Orlando",
  "email": "orlando@test.com",
  "password": "123456"
}

Login

POST /api/auth/login

Body:

{
  "email": "orlando@test.com",
  "password": "123456"
}

Me

GET /api/auth/me
Authorization: Bearer TU_TOKEN


⸻

Progress

Progress Summary

GET /api/progress/summary
Authorization: Bearer TU_TOKEN

Devuelve:
	•	nivel global
	•	XP total
	•	XP del nivel actual
	•	XP siguiente nivel
	•	coins
	•	streak
	•	stats con progreso porcentual

⸻

Quests

Listar quests

GET /api/quests
Authorization: Bearer TU_TOKEN

Crear quest

POST /api/quests
Authorization: Bearer TU_TOKEN
Content-Type: application/json

Body ejemplo:

{
  "title": "Entrenamiento rápido",
  "description": "Rutina de 15 minutos",
  "type": "daily",
  "globalXpReward": 30,
  "coinReward": 15,
  "statRewards": [
    { "statKey": "str", "amount": 20 },
    { "statKey": "res", "amount": 15 }
  ]
}

Completar quest

PATCH /api/quests/:id/complete
Authorization: Bearer TU_TOKEN

Eliminar quest

DELETE /api/quests/:id
Authorization: Bearer TU_TOKEN


⸻

Daily Quests

Generar quests diarias

POST /api/quests/seed-daily
Authorization: Bearer TU_TOKEN


⸻

Custom Quests

Listar custom quests

GET /api/quests/custom
Authorization: Bearer TU_TOKEN

Crear custom quest

POST /api/quests/custom
Authorization: Bearer TU_TOKEN
Content-Type: application/json

Editar custom quest

PATCH /api/quests/custom/:id
Authorization: Bearer TU_TOKEN
Content-Type: application/json

Eliminar custom quest

DELETE /api/quests/custom/:id
Authorization: Bearer TU_TOKEN


⸻

Sync

Push

POST /api/sync/push
Authorization: Bearer TU_TOKEN
Content-Type: application/json

Pull

GET /api/sync/pull
Authorization: Bearer TU_TOKEN


⸻

Sistema RPG implementado

Progreso global

Cada usuario tiene:
	•	xpTotal
	•	level
	•	xpCurrentLevel
	•	xpNextLevel
	•	coins
	•	streak

Stats implementadas
	•	str → fuerza
	•	res → resistencia
	•	agi → agilidad
	•	int → inteligencia
	•	soc → social
	•	disc → disciplina

Cada stat sube mediante misiones y tiene progreso independiente.

⸻

Autenticación

Todas las rutas protegidas requieren:

Authorization: Bearer TU_TOKEN

El token se obtiene en login/register.

⸻

Notas para frontend
	•	Guardar el token JWT en localStorage o contexto global
	•	Incluir siempre el header Authorization en rutas protegidas
	•	Manejar errores 401 (token expirado)
	•	Consumir base URL desde variable de entorno

Ejemplo:

const API = "https://rpglog-backend.onrender.com";


⸻

Deploy

El backend está desplegado en:
	•	Render

Variables necesarias:

PORT=3001
MONGO_URI=...
JWT_SECRET=...
NODE_ENV=production
CORS_ORIGIN=...


⸻

Autor

Desarrollado por:

Orlando Delgado
UTCH - Desarrollo de Software Multiplataforma

⸻

Estado actual

Backend funcional en producción listo para integración con frontend.

⸻



