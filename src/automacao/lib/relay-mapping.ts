/**
 * Mapeamento automático de tipo de equipamento para número do relay
 * Este mapeamento é fixo e gerenciado pelo sistema
 */

export const RELAY_MAPPING: Record<string, number> = {
  luz: 1,
  projetor: 2,
  computador: 4,
  audio: 6,
  rede: 9,
  ar_condicionado: 10,
}

/**
 * Obtém o número do relay para um tipo de equipamento
 */
export function getRelayIdPorTipo(tipo: string): number | null {
  return RELAY_MAPPING[tipo] || null
}

/**
 * Verifica se um tipo de equipamento tem relay configurado
 */
export function tipoTemRelay(tipo: string): boolean {
  return tipo in RELAY_MAPPING
}

/**
 * Obtém descrição do relay
 */
export function getRelayDescricao(tipo: string): string {
  const relayId = getRelayIdPorTipo(tipo)
  return relayId ? `Relay ${relayId}` : "Sem relay"
}

