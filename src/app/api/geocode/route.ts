import { NextRequest, NextResponse } from 'next/server';

type GeocodeResult = {
    display_name: string;
    display_full: string;
    lat: string;
    lon: string;
    source: 'brasilapi' | 'viacep+nominatim' | 'nominatim';
    distance_km?: number;
};

type CacheItem = {
    expiresAt: number;
    data: GeocodeResult[];
};

const cache = new Map<string, CacheItem>();
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 dias

// Fallback aproximado para São Gonçalo/RJ caso o usuário não permita localização.
// Troque se seu público principal for outra cidade.
const DEFAULT_CENTER = {
    lat: -22.8268,
    lng: -43.0634,
};

function onlyDigits(value: string) {
    return value.replace(/\D/g, '');
}

function isCEP(value: string) {
    return /^\d{8}$/.test(onlyDigits(value));
}

function normalizeQuery(value: string) {
    return value.trim().toLowerCase();
}

function getNumber(value: string | null) {
    if (!value) return null;

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function getCache(key: string) {
    const item = cache.get(key);

    if (!item) return null;

    if (Date.now() > item.expiresAt) {
        cache.delete(key);
        return null;
    }

    return item.data;
}

function setCache(key: string, data: GeocodeResult[]) {
    cache.set(key, {
        expiresAt: Date.now() + CACHE_TTL,
        data,
    });
}

function buildAddressText(data: {
    street?: string;
    logradouro?: string;
    neighborhood?: string;
    bairro?: string;
    city?: string;
    localidade?: string;
    state?: string;
    uf?: string;
}) {
    const street = data.street || data.logradouro || '';
    const neighborhood = data.neighborhood || data.bairro || '';
    const city = data.city || data.localidade || '';
    const state = data.state || data.uf || '';

    return [street, neighborhood, city, state].filter(Boolean).join(', ');
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const radius = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return radius * c;
}

function sortByDistance(results: GeocodeResult[], centerLat: number, centerLng: number) {
    return results
        .map((item) => {
            const lat = Number(item.lat);
            const lon = Number(item.lon);

            if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
                return item;
            }

            return {
                ...item,
                distance_km: Number(haversineKm(centerLat, centerLng, lat, lon).toFixed(2)),
            };
        })
        .sort((a, b) => {
            const distanceA = a.distance_km ?? Number.MAX_SAFE_INTEGER;
            const distanceB = b.distance_km ?? Number.MAX_SAFE_INTEGER;

            return distanceA - distanceB;
        });
}

function buildViewbox(centerLat: number, centerLng: number) {
    // Aproximadamente uma área de busca de 70km a 90km.
    // Nominatim usa: left,top,right,bottom
    const deltaLat = 0.8;
    const deltaLng = 0.8;

    const left = centerLng - deltaLng;
    const top = centerLat + deltaLat;
    const right = centerLng + deltaLng;
    const bottom = centerLat - deltaLat;

    return `${left},${top},${right},${bottom}`;
}

async function geocodeWithNominatim(
    query: string,
    options?: {
        limit?: number;
        centerLat?: number;
        centerLng?: number;
        bounded?: boolean;
    }
): Promise<GeocodeResult[]> {
    const limit = options?.limit ?? 7;
    const centerLat = options?.centerLat;
    const centerLng = options?.centerLng;

    const url = new URL('https://nominatim.openstreetmap.org/search');

    url.searchParams.set('format', 'json');
    url.searchParams.set('q', query);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('extratags', '1');
    url.searchParams.set('namedetails', '1');
    url.searchParams.set('countrycodes', 'br');

    if (typeof centerLat === 'number' && typeof centerLng === 'number') {
        url.searchParams.set('viewbox', buildViewbox(centerLat, centerLng));
        // bounded=0 prioriza perto, mas não bloqueia resultados de fora caso falte resultado.
        url.searchParams.set('bounded', options?.bounded ? '1' : '0');
    }

    const res = await fetch(url.toString(), {
        headers: {
            'Accept-Language': 'pt-BR',
            // Troque pelo seu domínio/e-mail real.
            'User-Agent': 'AlertLoc/1.0 suporte@seudominio.com.br',
        },
        next: {
            revalidate: 60 * 60 * 24 * 7,
        },
    });

    if (!res.ok) {
        throw new Error('Erro ao consultar Nominatim');
    }

    const data = await res.json();

    const results: GeocodeResult[] = data.map((place: any) => {
        const parts = String(place.display_name || '')
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean);

        return {
            display_name: parts.slice(0, 3).join(', '),
            display_full: place.display_name,
            lat: String(place.lat),
            lon: String(place.lon),
            source: 'nominatim',
        };
    });

    if (typeof centerLat === 'number' && typeof centerLng === 'number') {
        return sortByDistance(results, centerLat, centerLng);
    }

    return results;
}

async function reverseGeocodeWithNominatim(lat: number, lng: number): Promise<GeocodeResult | null> {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'json');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('zoom', '18');

    const res = await fetch(url.toString(), {
        headers: {
            'Accept-Language': 'pt-BR',
            'User-Agent': 'AlertLoc/1.0 suporte@seudominio.com.br',
        },
        next: {
            revalidate: 60 * 60 * 24 * 7,
        },
    });

    if (!res.ok) {
        throw new Error('Erro ao consultar Nominatim reverse');
    }

    const data = await res.json();
    const display = String(data.display_name || '').trim();

    if (!display) return null;

    const parts = display.split(',').map((part) => part.trim()).filter(Boolean);

    return {
        display_name: parts.slice(0, 3).join(', '),
        display_full: display,
        lat: String(lat),
        lon: String(lng),
        source: 'nominatim',
    };
}

async function searchCEP(
    cep: string,
    centerLat: number,
    centerLng: number
): Promise<GeocodeResult[]> {
    const cleanCep = onlyDigits(cep);

    // 1. Tenta BrasilAPI V2 primeiro
    try {
        const brasilApiRes = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`, {
            next: {
                revalidate: 60 * 60 * 24 * 30,
            },
        });

        if (brasilApiRes.ok) {
            const data = await brasilApiRes.json();
            const addressText = buildAddressText(data);
            const lat = data?.location?.coordinates?.latitude;
            const lon = data?.location?.coordinates?.longitude;

            if (lat && lon) {
                return [
                    {
                        display_name: addressText,
                        display_full: addressText,
                        lat: String(lat),
                        lon: String(lon),
                        source: 'brasilapi',
                        distance_km: Number(haversineKm(centerLat, centerLng, Number(lat), Number(lon)).toFixed(2)),
                    },
                ];
            }

            if (addressText) {
                const geo = await geocodeWithNominatim(addressText, {
                    limit: 1,
                    centerLat,
                    centerLng,
                });

                return geo.map((item) => ({
                    ...item,
                    display_name: addressText,
                    display_full: addressText,
                    source: 'brasilapi',
                }));
            }
        }
    } catch (error) {
        console.error('Erro BrasilAPI:', error);
    }

    // 2. Fallback: ViaCEP
    try {
        const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
            next: {
                revalidate: 60 * 60 * 24 * 30,
            },
        });

        if (!viaCepRes.ok) return [];

        const data = await viaCepRes.json();

        if (data.erro) return [];

        const addressText = buildAddressText(data);

        if (!addressText) return [];

        const geo = await geocodeWithNominatim(addressText, {
            limit: 1,
            centerLat,
            centerLng,
        });

        return geo.map((item) => ({
            ...item,
            display_name: addressText,
            display_full: addressText,
            source: 'viacep+nominatim',
        }));
    } catch (error) {
        console.error('Erro ViaCEP:', error);
        return [];
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const query = normalizeQuery(q);
    const reverse = searchParams.get('reverse') === '1';

    const latParam = getNumber(searchParams.get('lat'));
    const lngParam = getNumber(searchParams.get('lng'));

    const centerLat = latParam ?? DEFAULT_CENTER.lat;
    const centerLng = lngParam ?? DEFAULT_CENTER.lng;

    if (reverse) {
        if (latParam === null || lngParam === null) {
            return NextResponse.json({ result: null }, { status: 400 });
        }

        const cacheKey = `reverse:${latParam.toFixed(5)},${lngParam.toFixed(5)}`;
        const cached = getCache(cacheKey);

        if (cached) {
            return NextResponse.json({ result: cached[0] ?? null, cached: true });
        }

        try {
            const result = await reverseGeocodeWithNominatim(latParam, lngParam);
            setCache(cacheKey, result ? [result] : []);
            return NextResponse.json({ result, cached: false });
        } catch (error) {
            console.error('Erro reverse geocode:', error);
            return NextResponse.json({ result: null, error: 'Erro ao buscar endereço.' }, { status: 500 });
        }
    }

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    if (query.length < 3 && !isCEP(query)) {
        return NextResponse.json({ results: [] });
    }

    const cacheKey = isCEP(query)
        ? `cep:${onlyDigits(query)}:${centerLat.toFixed(2)},${centerLng.toFixed(2)}`
        : `addr:${query}:${centerLat.toFixed(2)},${centerLng.toFixed(2)}`;

    const cached = getCache(cacheKey);

    if (cached) {
        return NextResponse.json({
            results: cached,
            cached: true,
        });
    }

    try {
        let results: GeocodeResult[] = [];

        if (isCEP(query)) {
            results = await searchCEP(query, centerLat, centerLng);
        } else {
            results = await geocodeWithNominatim(query, {
                limit: 10,
                centerLat,
                centerLng,
            });
        }

        setCache(cacheKey, results);

        return NextResponse.json({
            results,
            cached: false,
            center: {
                lat: centerLat,
                lng: centerLng,
            },
        });
    } catch (error) {
        console.error('Erro geral no geocode:', error);

        return NextResponse.json(
            {
                results: [],
                error: 'Erro ao buscar endereço.',
            },
            {
                status: 500,
            }
        );
    }
}
