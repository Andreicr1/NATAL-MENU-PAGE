// Serviço de consulta de CEP usando ViaCEP
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function consultarCEP(cep: string): Promise<ViaCEPResponse | null> {
  try {
    const cleanCEP = cep.replace(/\D/g, '');

    if (cleanCEP.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);

    if (!response.ok) {
      throw new Error('Erro ao consultar CEP');
    }

    const data: ViaCEPResponse = await response.json();

    if (data.erro) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    return null;
  }
}
