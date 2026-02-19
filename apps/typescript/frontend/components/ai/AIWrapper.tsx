'use client';

import React from 'react';
import { AIProvider } from './AIContext';
import { AIChat } from './AIChat';

export function AIWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AIProvider>
      {children}
      <AIChat />
    </AIProvider>
  );
}
