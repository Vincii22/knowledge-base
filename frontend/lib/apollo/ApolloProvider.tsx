'use client';

import { ApolloProvider as ApolloProviderBase } from '@apollo/client';
import client from './client';
import { ReactNode } from 'react';

export function ApolloProvider({ children }: { children: ReactNode }) {
  return <ApolloProviderBase client={client}>{children}</ApolloProviderBase>;
}