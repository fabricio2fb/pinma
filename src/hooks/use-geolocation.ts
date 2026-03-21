'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Interface para os dados de localização retornados pelo hook.
 */
export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
}

/**
 * Objeto de erro com mensagens descritivas.
 */
export interface LocationError {
  code: number;
  message: string;
}

// Configurações unificadas e obrigatórias definidas nos requisitos
const GEO_OPTIONS = {
  enableHighAccuracy: true, // Força uso do GPS no mobile, se disponível
  timeout: 10000,           // Tempo máximo de 10s para conseguir precisão
  maximumAge: 0,            // Não usa cache, pega sempre a localização mais recente
};

/**
 * Utilitário de formatação de erro da API de Geolocation para humanos.
 */
function handleGeoError(error: GeolocationPositionError): LocationError {
  switch (error.code) {
    case 1: // PERMISSION_DENIED
      return { code: error.code, message: 'Permissão de localização negada pelo usuário.' };
    case 2: // POSITION_UNAVAILABLE
      return { code: error.code, message: 'Informações de localização estão indisponíveis.' };
    case 3: // TIMEOUT
      return { code: error.code, message: 'A requisição para obter a localização expirou (Timeout).' };
    default:
      return { code: error.code, message: 'Ocorreu um erro desconhecido ao obter a localização.' };
  }
}

/**
 * Verifica se a API de geolocalização está disponível no navegador.
 */
export function isGeolocationAvailable(): boolean {
  return typeof window !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Hook customizado para usar a localização no React de forma modular e reativa.
 * Preparado para integrar com bibliotecas de mapa (pode ser usado para dar map.setCenter, etc)
 */
export function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  /**
   * 1. Função para obter a localização atual UMA única vez (getCurrentPosition).
   * Útil para o carregamento inicial.
   */
  const getLocation = useCallback(() => {
    if (!isGeolocationAvailable()) {
      setError({ code: 0, message: 'Geolocalização não é suportada pelo seu navegador.' });
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setIsLoading(false);
      },
      (err) => {
        setError(handleGeoError(err));
        setIsLoading(false);
      },
      GEO_OPTIONS
    );
  }, []);

  /**
   * 2. Função para rastrear a localização do usuário em tempo real (watchPosition).
   * Ideal para evitar "pulos" e manter o marcador ou o centro sempre atualizado,
   * especialmente quando o usuário está em movimento num dispositivo móvel.
   */
  const startWatching = useCallback(() => {
    if (!isGeolocationAvailable()) {
      setError({ code: 0, message: 'Geolocalização não é suportada pelo seu navegador.' });
      return;
    }

    setError(null);
    setIsLoading(true);

    // Se já estiver assistindo, limpa o watch anterior antes de criar outro
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setIsLoading(false);
      },
      (err) => {
        setError(handleGeoError(err));
        setIsLoading(false);
      },
      GEO_OPTIONS
    );
  }, []);

  /**
   * Função explícita para parar a atualização de localização em tempo real.
   */
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLoading(false);
  }, []);

  // Efeito de limpeza para garantir que encerramos o rastreamento ao desmontar o componente
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    location,
    error,
    isLoading,
    getLocation,
    startWatching,
    stopWatching,
  };
}
