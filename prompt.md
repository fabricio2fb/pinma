A lógica de busca Overpass já existe e já busca shop, amenity, tourism, leisure e office. Não precisa refazer tudo.

Ajuste apenas para melhorar a cobertura:

1. Além de node, buscar também way e relation para:
- shop
- amenity
- tourism
- leisure
- office
- craft
- healthcare
- public_transport
- highway=bus_stop
- railway=station
- railway=halt

2. Trocar `out body;` por `out center tags;` para conseguir coordenadas de ways e relations.

3. Na normalização:
- se element.type === "node", usar element.lat e element.lon
- se for way ou relation, usar element.center.lat e element.center.lon
- ignorar itens sem coordenadas

4. Manter raio atual.
5. Manter popup atual.
6. Manter botão "Criar Lembrete".
7. Melhorar `getCategoryInfo(tags)` para reconhecer mais categorias:
- healthcare
- craft
- public_transport
- highway=bus_stop
- railway=station/halt
- mais tipos de shop e amenity

8. Remover duplicados pelo ID composto:
`${element.type}-${element.id}`

9. Se vierem muitos resultados, ordenar por distância do usuário e exibir os mais próximos primeiro.

Resultado esperado:
A busca continua usando Overpass, mas passa a encontrar mais estabelecimentos porque agora também considera áreas/prédios cadastrados como way/relation e novas tags além de shop/amenity/tourism/leisure/office.