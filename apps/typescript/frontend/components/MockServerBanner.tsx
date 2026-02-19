'use client';

import React, { useEffect, useState } from 'react';

interface ServiceStatus {
  name: string;
  type: 'mock' | 'live';
  url: string;
  connected: boolean;
}

interface SystemStatus {
  environment: string;
  usingMockServers: boolean;
  services: {
    jira: ServiceStatus;
    tempo: ServiceStatus;
  };
}

export function MockServerBanner() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/status');
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    };

    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Don't render if not using mock servers or status not loaded
  if (!status?.usingMockServers) {
    return null;
  }

  if (!isVisible) {
    // Minimized state - small floating indicator
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-full shadow-lg hover:bg-amber-600 transition-all duration-200"
        title="Mock servers active - click to expand"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        MOCK
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          {/* Left: Icon and main message */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <span className="font-semibold">Development Mode</span>
              <span className="mx-2 opacity-60">|</span>
              <span className="text-white/90">Using mock servers for testing</span>
            </div>
          </div>

          {/* Right: Service pills and controls */}
          <div className="flex items-center gap-3">
            {/* Service status pills */}
            <div className="hidden sm:flex items-center gap-2">
              <ServicePill service={status.services.jira} />
              <ServicePill service={status.services.tempo} />
            </div>

            {/* Expand/Details button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30 transition-colors"
            >
              <span>Details</span>
              <svg
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Minimize button */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Minimize"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="pb-3 pt-1 border-t border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <ServiceCard service={status.services.jira} />
              <ServiceCard service={status.services.tempo} />
            </div>
            <p className="text-xs text-white/70 mt-3">
              Mock servers simulate Jira and Tempo APIs for development and testing. Data shown is synthetic and resets on restart.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ServicePill({ service }: { service: ServiceStatus }) {
  const isMock = service.type === 'mock';

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
      isMock ? 'bg-white/20' : 'bg-green-500/30'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isMock ? 'bg-yellow-300' : 'bg-green-300'}`} />
      <span>{service.name}</span>
      <span className="opacity-70">{isMock ? 'Mock' : 'Live'}</span>
    </div>
  );
}

function ServiceCard({ service }: { service: ServiceStatus }) {
  const isMock = service.type === 'mock';

  return (
    <div className="bg-white/10 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isMock ? 'bg-yellow-300' : 'bg-green-400'}`} />
          <span className="font-medium">{service.name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${
          isMock ? 'bg-yellow-500/30 text-yellow-100' : 'bg-green-500/30 text-green-100'
        }`}>
          {isMock ? 'MOCK' : 'LIVE'}
        </span>
      </div>
      <p className="text-xs text-white/70 mt-1 truncate" title={service.url}>
        {service.url}
      </p>
    </div>
  );
}

export default MockServerBanner;
