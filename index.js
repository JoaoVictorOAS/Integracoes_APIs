// index.js
const fastify = require('fastify')({ logger: true });
require('dotenv').config();

// Registrando o plugin CORS para permitir requisições de outras origens
fastify.register(require('@fastify/cors'), {
  origin: "*", // Permite todas as origens (bom para desenvolvimento)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Garante que OPTIONS está habilitado
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite cabeçalhos comuns
});

// Registrando o plugin JWT com uma chave secreta
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'supersecret'
});
const users = [
  { id: 1, name: 'Mayk', email: 'mayk@example.com', password: '123456', role: 'admin' },
  { id: 2, name: 'Diego', email: 'diego@example.com', password: 'abcdef', role: 'user' }
];

fastify.post('/login', async (request, reply) => {
  const { email, password } = request.body;

  const user = users.find(u => u.email === email);
  if (!user || user.password !== password) {
    return reply.code(401).send({ error: 'Credenciais inválidas' });
  }

  const tokenPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };

  const token = fastify.jwt.sign(tokenPayload, { expiresIn: '1h' });

  return reply.send({ 
    token,
    message: `Bem-vindo, ${user.name}!`,
  });
});
fastify.decorate("authenticate", async function(request, reply) {
  try {
    await request.jwtVerify(); // verifica o token JWT presente no header Authorization
  } catch (err) {
    reply.code(401).send({ error: 'Token inválido ou ausente' });
  }
});

fastify.get('/profile', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const userData = request.user;
  return reply.send({ profile: userData });
});


fastify.get('/admin', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  const user = request.user;
  if (user.role !== 'admin') {
    return reply.code(403).send({ error: 'Acesso negado: você não é admin.' });
  }
  return reply.send({ secretInfo: 'Só admins veem isso aqui 😎' });
});
fastify.listen({ port: 3000 }, err => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Servidor rodando em http://localhost:3000 🚀');
});