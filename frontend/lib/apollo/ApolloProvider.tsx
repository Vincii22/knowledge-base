'use client';

import { ApolloProvider } from '@apollo/client/react';
import client from './client';
import { ReactNode } from 'react';

export function ApolloClientProvider({ children }: { children: ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}