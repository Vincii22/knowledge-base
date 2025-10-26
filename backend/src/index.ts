import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/typeDefs/index.js';
import { resolvers } from './graphql/resolvers/index.js';
import prisma from './config/database.js';
import { getUserFromToken } from './middleware/auth.js';
import { Context } from './types/context.js';

// Load environment variables
dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

async function startServer() {
  // Create Apollo Server
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    csrfPrevention: false, // ← Add this line (disable for development)
    formatError: (formattedError) => {
      console.error('GraphQL Error:', formattedError);
      return formattedError;
    },
  });

  const { url } = await startStandaloneServer(server, {
    context: async ({ req }): Promise<Context> => {
      const token = req.headers.authorization;
      const user = getUserFromToken(token);

      return {
        prisma,
        user,
      };
    },
    listen: { port: PORT },
  });

  console.log(`🚀 Server ready at ${url}`);
  console.log(`📊 Apollo Studio: https://studio.apollographql.com/sandbox/explorer`);
}

// Start the server
startServer().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});