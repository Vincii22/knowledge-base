import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client';

// --- NEW INTERFACES TO FIX TS ERROR ---
interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
}

interface LoginPayload {
  token: string;
  user: User;
}

interface LoginMutationData {
  login: LoginPayload;
}
// -------------------------------------

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
      user {
        id
        email
        username
        name
        role
      }
    }
  }
`;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Create a temporary Apollo Client for authentication
          const client = new ApolloClient({
            link: new HttpLink({
              uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
            }),
            cache: new InMemoryCache(),
          });

          // Apply the type to the mutate call
          const { data } = await client.mutate<LoginMutationData>({
            mutation: LOGIN_MUTATION,
            variables: {
              email: credentials.email,
              password: credentials.password,
            },
          });

          if (data?.login?.token && data?.login?.user) {
            // Note: NextAuth's User type only has id, name, email, image by default.
            // Other properties (role, username, token) are custom and passed here
            // to be picked up by the jwt callback.
            return {
              id: data.login.user.id,
              email: data.login.user.email,
              name: data.login.user.name,
              username: data.login.user.username,
              role: data.login.user.role,
              token: data.login.token, // Custom property to hold the JWT
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          // For security, always throw a generic error for the user
          throw new Error('Invalid credentials'); 
        }
      },
    }),
  ],
  callbacks: {
    // ... your callbacks are structured correctly to handle the custom properties ...
    async jwt({ token, user }) {
      if (user) {
        // user type here includes your custom properties from authorize() return
        token.id = user.id;
        token.role = (user as any).role; // Type assertion for custom property
        token.username = (user as any).username; // Type assertion for custom property
        token.accessToken = (user as any).token; // Type assertion for custom property
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).username = token.username as string;
        (session as any).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};