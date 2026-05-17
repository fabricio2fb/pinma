# Fluxo de Dados no Mapa - AlertLoc

## Visão Geral

O mapa do AlertLoc exibe **duas fontes distintas** de marcadores:

1. **Marcadores de Lembretes (do usuário)** - Salvos no Supabase
2. **POIs (lugares próximos)** - Buscados da API Overpass (OpenStreetMap)

---

## 1. Marcadores de Lembretes (Banco de Dados)

### De onde vem?
- **Tabela**: `reminders` no Supabase
- **Dados**: latitude, longitude, título, descrição, categoria, prioridade

### Como chegam ao mapa?
1. Página `/map` faz `fetch` no Supabase: `supabase.from('reminders').select('*')`
2. Dados são transformados em `marcadores` com formato:
```typescript
{
  lat: number,
  lng: number,
  nome: string,
  categoria?: string,
  prioridade?: number,
  descricao?: string,
  id: string
}
```
3. Passados como prop `marcadores` para o componente `<Mapa />`

### Como são renderizados?
- Ícone customizado: logo `logob.png` ou `logop.png` (depende do tema)
- Efeito de glow (sombra) ao redor do logo
- Label abaixo do ícone com o nome do lembrete
- Popup ao clicar mostrando o título

---

## 2. POIs - Lugares Próximos (API Externa)

### De onde vem?
- **API**: Overpass API (dados do OpenStreetMap)
- **Endpoint**: `https://overpass-api.de/api/interpreter`

### Como funciona a busca?
1. Quando o GPS do usuário é encontrado, busca estabelecimentos num raio de **3500 metros**
2. Query Overpass busca por categorias configuradas em `OVERPASS_FILTERS`

### Categorias configuradas (OVERPASS_FILTERS):

**Prioridade 1 - Compras:**
- Supermercado, Mercado, Mercadinho, Mercearia, Padaria, Açougue, Hortifruti, Shopping

**Prioridade 2 - Saúde:**
- Farmácia, Hospital/UPA, Clínica, Consultório, Dentista, Veterinário, Pet Shop

**Prioridade 3 - Serviços Públicos:**
- Banco, Caixa Eletrônico, Correios, Polícia, Bombeiros, Prefeitura, Cartório, Advocacia

**Prioridade 4 - Alimentação:**
- Restaurante, Lanchonete, Café, Bar, Sorveteria

**Prioridade 5 - Educação/Religião:**
- Escola, Universidade, Creche, Academia, Igreja, Biblioteca

**Prioridade 6 - Transporte:**
- Posto de Gasolina, Estacionamento, Lava Jato, Aluguel de Carro

**Prioridade 7 - Comércio:**
- Barbearia, Salão de Beleza, Lavanderia, Material de Construção, Eletrônicos, Roupas, Calçados, Livraria, Papelaria, Móveis, Florista, Ótica, Oficina, Bicicletaria

### Filtros e Limites
- **Sem filtro**: até 80 pontos no mapa
- **Com filtro**: até 40 pontos no mapa
- Ordenados por distância do usuário
- Duplicados removidos

### Como são renderizados?
- Emoji + label colorido baseado na categoria
- Ícone circular com cor específica da categoria
- Popup mostrando:
  - Nome do estabelecimento
  - Categoria (badge colorido)
  - Distância em metros
  - Endereço (se disponível via tags OSM)
  - Botão "Criar Lembrete" que abre o Sheet

---

## 3. Busca de Endereços (Barra de Pesquisa)

### De onde vem?
- **API**: `/api/geocode` (rota Next.js)
- **Fontes externas**: BrasilAPI > ViaCEP > Nominatim

### Fluxo de busca:

```
Usuário digita → debounce 600ms → /api/geocode
                                      ↓
                            É CEP? → BrasilAPI → coordenadas
                                      ↓ não
                            Nominatim → resultados
                                      ↓
                        Ordena por distância do GPS
                                      ↓
                        Exibe dropdown com resultados
```

### Formato dos dados retornados:
```typescript
{
  display_name: string,    // "Rua das Flores, Centro, São Paulo, SP"
  display_full: string,     // Nome completo formatado
  lat: string,
  lon: string,
  source: 'brasilapi' | 'viacep+nominatim' | 'nominatim',
  distance_km?: number     // Distância do usuário
}
```

### Estrutura da rota `/api/geocode`:
- Cache em memória (7 dias)
- Prioriza resultados próximos ao GPS do usuário
- Fallback: São Gonçalo/RJ quando GPS não disponível

---

## 4. Tema do Mapa

### Fontes de tiles (CartoDB):
- **Light**: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
- **Dark**: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`

### Preferência:
- Salva no `profiles.map_style` do Supabase
- Fallback no `localStorage` → preference do sistema

---

## Resumo do Fluxo Completo

```
[Supabase] ──────→ [marcadores] ──→ [Pins de Lembretes]
                                       ↓
[Overpass API] ──→ [POIs] ──────────→ [Marcadores de Lugares]
                                       ↓
[Nominatim/CEP] ─→ [Busca] ──────────→ [Dropdown de resultados]
                                       ↓
[CartoDB] ───────→ [Tiles] ──────────→ [Mapa base]
```

### Componentes principais:
- `/src/components/map.tsx` - Componente principal do mapa
- `/src/app/map/page.tsx` - Página com barra de busca
- `/src/app/api/geocode/route.ts` - API de geocoding
- `/src/hooks/use-geolocation.ts` - Hook de GPS