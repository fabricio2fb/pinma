# AlertLoc

## O que é

O AlertLoc é um sistema de geofencing inteligente que substitui lembretes baseados em horário por lembretes baseados em localização. Ele notifica o usuário automaticamente quando chega a um local específico, como uma farmácia, supermercado ou trabalho.

## Como Funciona

1. **Marque o território**: O usuário busca um endereço no mapa e define um raio de alcance (geofence)
2. **Esqueça**: O aplicativo roda em segundo plano monitorando a posição via GPS
3. **Ação Perfeita**: Quando o usuário cruza a fronteira definida, a notificação é disparada

## Fluxograma

```
Usuário → Busca Endereço → Define Raio → Cria Lembrete
                                      ↓
                                 后台 monitoring
                                      ↓
                                  GPS Detection
                                      ↓
                    ┌─────────────────────────────────┐
                    │  Usuário cruza fronteira?        │
                    └─────────────────────────────────┘
                          ↓ sim           ↓ não
                      Notificação    Continua monitorando
                          ↓
                    Usuário ação
                          ↓
                    Lembrete concluído
```

## Funcionalidades Principais

- Radar de alta precisão (GPS)
- Ecossistema social (grupos compartilhados)
- Cobertura ViaCEP e global
- Gestão inteligente de lembretes
- Notificações nativas via Service Worker