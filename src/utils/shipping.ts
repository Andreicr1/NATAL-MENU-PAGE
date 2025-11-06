// Cálculo de frete baseado em distância
// CEP Origem: 88010-001 (Centro de Florianópolis)
const ORIGIN_CEP = '88010001';
const ORIGIN_COORDS = { lat: -27.5969, lng: -48.5495 }; // Centro Florianópolis

// Configuração de preços
const BASE_FEE = 15.00; // Taxa base R$ 15,00
const PRICE_PER_KM = 2.00; // R$ 2,00 por km

// CEPs da Grande Florianópolis (principais municípios)
const GRANDE_FLORIANOPOLIS_CITIES = [
  'Florianópolis',
  'São José',
  'Palhoça',
  'Biguaçu',
  'Santo Amaro da Imperatriz',
  'Governador Celso Ramos',
  'Antônio Carlos',
  'Águas Mornas',
  'São Pedro de Alcântara'
];

interface CEPData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

interface ShippingResult {
  success: boolean;
  value?: number;
  distance?: number;
  message?: string;
  city?: string;
}

/**
 * Calcula distância entre dois pontos usando fórmula de Haversine
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Busca coordenadas aproximadas do CEP usando ViaCEP + coordenadas conhecidas
 */
async function getCEPCoordinates(cep: string): Promise<{ lat: number; lng: number; city: string } | null> {
  try {
    const cleanCep = cep.replace(/\D/g, '');
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

    if (!response.ok) {
      throw new Error('CEP não encontrado');
    }

    const data: CEPData = await response.json();

    if (data.erro) {
      throw new Error('CEP inválido');
    }

    console.log('ViaCEP retornou:', { cidade: data.localidade, bairro: data.bairro, cep: cleanCep });

    // Verificar se é da Grande Florianópolis
    const isGrandeFlora = GRANDE_FLORIANOPOLIS_CITIES.some(city =>
      data.localidade.toLowerCase().includes(city.toLowerCase())
    );

    if (!isGrandeFlora) {
      return null; // Fora da área de entrega
    }

    // Coordenadas aproximadas dos principais bairros/cidades da Grande Florianópolis
    const coordinates = getApproximateCoordinates(data.localidade, data.bairro, cleanCep);

    console.log('Coordenadas calculadas:', coordinates);

    return {
      ...coordinates,
      city: data.localidade
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    throw error;
  }
}

/**
 * Retorna coordenadas aproximadas baseado na cidade/bairro ou CEP
 */
function getApproximateCoordinates(city: string, neighborhood: string, cep: string): { lat: number; lng: number } {
  const cityLower = city.toLowerCase();
  const neighborhoodLower = neighborhood?.toLowerCase() || '';
  const cepNum = parseInt(cep);

  // Coordenadas aproximadas dos principais municípios
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    'florianópolis': { lat: -27.5969, lng: -48.5495 },
    'são josé': { lat: -27.5969, lng: -48.6289 },
    'palhoça': { lat: -27.6445, lng: -48.6703 },
    'biguaçu': { lat: -27.4939, lng: -48.6558 },
    'santo amaro da imperatriz': { lat: -27.6861, lng: -48.7792 },
    'governador celso ramos': { lat: -27.3156, lng: -48.5581 },
    'antônio carlos': { lat: -27.5189, lng: -48.7631 },
    'águas mornas': { lat: -27.6997, lng: -48.8253 },
    'são pedro de alcântara': { lat: -27.5661, lng: -48.8092 }
  };

  // Bairros principais de Florianópolis com coordenadas precisas
  const floriaNeighborhoods: Record<string, { lat: number; lng: number }> = {
    'centro': { lat: -27.5969, lng: -48.5495 },
    'agronômica': { lat: -27.5950, lng: -48.5250 },
    'trindade': { lat: -27.6006, lng: -48.5206 },
    'pantanal': { lat: -27.6100, lng: -48.5600 },
    'saco grande': { lat: -27.5700, lng: -48.5100 },
    'ingleses': { lat: -27.4367, lng: -48.3969 },
    'canasvieiras': { lat: -27.4275, lng: -48.4550 },
    'jurerê': { lat: -27.4250, lng: -48.4950 },
    'lagoa': { lat: -27.5706, lng: -48.4758 },
    'barra da lagoa': { lat: -27.5750, lng: -48.4200 },
    'campeche': { lat: -27.6819, lng: -48.4792 },
    'córrego grande': { lat: -27.5856, lng: -48.5169 },
    'itacorubi': { lat: -27.5833, lng: -48.5056 },
    'estreito': { lat: -27.5833, lng: -48.5581 },
    'coqueiros': { lat: -27.5850, lng: -48.5650 },
    'monte verde': { lat: -27.5900, lng: -48.5400 },
    'santa mônica': { lat: -27.6050, lng: -48.5350 },
    'serrinha': { lat: -27.6100, lng: -48.5200 }
  };

  // Mapeamento por faixa de CEP para Florianópolis
  const cepRanges: Array<{ min: number; max: number; coords: { lat: number; lng: number } }> = [
    { min: 88010000, max: 88019999, coords: { lat: -27.5969, lng: -48.5495 } }, // Centro
    { min: 88020000, max: 88029999, coords: { lat: -27.6000, lng: -48.5300 } }, // Agronômica/Trindade
    { min: 88030000, max: 88039999, coords: { lat: -27.5833, lng: -48.5100 } }, // Itacorubi/Córrego
    { min: 88040000, max: 88049999, coords: { lat: -27.4500, lng: -48.4200 } }, // Norte (Canasvieiras)
    { min: 88050000, max: 88069999, coords: { lat: -27.4400, lng: -48.4000 } }, // Ingleses/Santinho
    { min: 88070000, max: 88089999, coords: { lat: -27.6800, lng: -48.4800 } }, // Sul (Campeche)
  ];

  // Se for Florianópolis, tentar mapear por bairro primeiro
  if (cityLower.includes('florianópolis') || cityLower.includes('florianopolis')) {
    // Tentar encontrar bairro específico
    for (const [bairro, coords] of Object.entries(floriaNeighborhoods)) {
      if (neighborhoodLower.includes(bairro)) {
        console.log(`Bairro encontrado: ${bairro}`, coords);
        return coords;
      }
    }

    // Se não encontrou bairro, usar faixa de CEP
    for (const range of cepRanges) {
      if (cepNum >= range.min && cepNum <= range.max) {
        console.log(`Usando faixa de CEP: ${range.min}-${range.max}`, range.coords);
        return range.coords;
      }
    }
  }

  // Retornar coordenadas da cidade
  for (const [cityName, coords] of Object.entries(cityCoords)) {
    if (cityLower.includes(cityName)) {
      return coords;
    }
  }

  // Padrão: centro de Florianópolis
  return cityCoords['florianópolis'];
}

/**
 * Calcula o frete baseado no CEP de destino
 */
export async function calculateShipping(destinationCep: string): Promise<ShippingResult> {
  try {
    const cleanCep = destinationCep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return {
        success: false,
        message: 'CEP inválido. Deve conter 8 dígitos.'
      };
    }

    // Buscar coordenadas do CEP de destino
    const destCoords = await getCEPCoordinates(cleanCep);

    if (!destCoords) {
      return {
        success: false,
        message: 'Entregamos apenas na Grande Florianópolis. Entre em contato pelo WhatsApp: (48) 99196-0811'
      };
    }

    // Calcular distância
    const distance = calculateDistance(
      ORIGIN_COORDS.lat,
      ORIGIN_COORDS.lng,
      destCoords.lat,
      destCoords.lng
    );

    // Calcular valor do frete
    const shippingValue = BASE_FEE + (distance * PRICE_PER_KM);

    return {
      success: true,
      value: Math.round(shippingValue * 100) / 100, // Arredondar para 2 casas decimais
      distance: Math.round(distance * 10) / 10, // Arredondar para 1 casa decimal
      city: destCoords.city,
      message: `Entrega para ${destCoords.city} (${distance.toFixed(1)} km)`
    };
  } catch (error: any) {
    console.error('Erro ao calcular frete:', error);
    return {
      success: false,
      message: 'Erro ao calcular frete. Verifique o CEP e tente novamente.'
    };
  }
}

/**
 * Valida se CEP é da Grande Florianópolis
 */
export async function validateDeliveryArea(cep: string): Promise<boolean> {
  try {
    const cleanCep = cep.replace(/\D/g, '');
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

    if (!response.ok) return false;

    const data: CEPData = await response.json();

    if (data.erro) return false;

    return GRANDE_FLORIANOPOLIS_CITIES.some(city =>
      data.localidade.toLowerCase().includes(city.toLowerCase())
    );
  } catch {
    return false;
  }
}
