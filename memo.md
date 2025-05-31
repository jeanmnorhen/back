
# Relatório do Projeto: Preço Real

## 1. Objetivos do Projeto

- **Nome do Projeto:** Preço Real (Originalmente "Image Insight Explorer", internacionalmente "Real Price")
- **Objetivo Principal:** Permitir que usuários encontrem produtos e serviços sendo anunciados por estabelecimentos comerciais próximos à sua localização em tempo real, com foco inicial em ofertas de varejo e alimentação.
- Facilitar a descoberta de ofertas locais através de um feed de produtos geolocalizado.
- Permitir que usuários filtrem produtos por categoria.
- Apresentar lojas que vendem um produto específico, ordenadas por proximidade.
- Permitir que lojistas (outro tipo de cliente do aplicativo) cadastrem seus estabelecimentos e anunciem seus produtos/ofertas na plataforma.
    - Anúncios de produtos terão um tempo de validade definido (ex: 24 horas).
    - Os dados dos anúncios expirados serão registrados para compor um histórico de preços.
- Utilizar a localização GPS do usuário (com consentimento) para otimizar a busca por ofertas e lojas.
- Oferecer uma interface de usuário intuitiva e responsiva.
- **Funcionalidade Secundária (Apoio):** Permitir que os usuários façam upload de imagens para análise (identificar objetos, traduções). Essa funcionalidade pode ser usada para ajudar o usuário a identificar um item sobre o qual deseja buscar ofertas no feed principal.
- Integrar com Firebase Realtime Database para:
    - Manter um catálogo de produtos canônicos (para referência, se aplicável).
    - Registrar lojas/estabelecimentos, incluindo sua localização geográfica e perfis.
    - Registrar anúncios/ofertas de produtos feitos por lojistas, incluindo preço, validade e localização.
    - Rastrear o histórico de preços dos produtos, alimentado pelos anúncios expirados.
    - Manter perfis de usuário (consumidores) com preferências e dados como localização.
- Implementar internacionalização (i18n) da interface do usuário (Português "Preço Real", Inglês "Real Price").
- Fornecer uma página de monitoramento para visualizar dados agregados (ex: valor médio de um produto por região/país, tendências de preço).
- **Visão Futura:** Implementar um sistema de Retrieval Augmented Generation (RAG) geospacial para clusterizar/agrupar lojas, anúncios e produtos por proximidade, otimizando o tráfego de dados e garantindo informações atualizadas das lojas mais próximas ao usuário.

## 2. Casos de Uso

- **UC1 (Principal): Descoberta de Ofertas Próximas (Feed Geolocalizado):**
    - O usuário (consumidor) abre o aplicativo Preço Real.
    - O aplicativo solicita e utiliza a localização GPS do usuário (com consentimento).
    - O sistema exibe um feed de produtos/ofertas que estão sendo anunciados por lojas próximas ao usuário.
    - Os anúncios são apresentados com informações como nome do produto, preço, nome da loja e distância.
    - O usuário pode rolar o feed para ver mais ofertas.
- **UC2 (Principal): Filtragem e Busca de Produto Específico por Proximidade:**
    - (Continuando do UC1 ou como uma ação separada) O usuário deseja um produto específico (ex: "hot dog").
    - O usuário utiliza um filtro de categoria (ex: toca no ícone "hot dog") ou uma barra de busca.
    - O sistema exibe uma lista de todas as lojas próximas que anunciaram "hot dogs" (ou o produto buscado), ordenadas pela proximidade em relação ao usuário.
    - Cada item da lista mostra o nome da loja, o produto, o preço anunciado e a distância.
- **UC3 (Lojista): Cadastro e Gerenciamento de Perfil de Loja:**
    - Um proprietário de loja se cadastra no Preço Real como "lojista" (requer autenticação).
    - O lojista preenche o perfil da sua loja, incluindo nome, endereço, tipo de estabelecimento e, crucialmente, define sua localização geográfica (que pode ser validada ou inserida manualmente).
- **UC4 (Lojista): Publicação de Anúncios/Ofertas:**
    - O lojista autenticado acessa a interface para criar um novo anúncio.
    - Ele informa o nome do produto, preço, categoria, opcionalmente uma descrição e imagem.
    - O sistema define automaticamente a validade do anúncio (ex: 24 horas a partir da publicação).
    - O anúncio publicado aparece no feed de usuários próximos que se encaixam na categoria do produto.
- **UC5 (Sistema): Gerenciamento de Anúncios e Histórico de Preços:**
    - Anúncios publicados têm um tempo de vida limitado (ex: 24 horas).
    - Após a expiração, o anúncio desaparece do feed ativo dos usuários.
    - Os dados do anúncio expirado (produto, preço, loja, data) são registrados no sistema de histórico de preços associado ao produto (se for um produto catalogado) e/ou à loja.
- **UC6 (Apoio): Análise de Imagem para Identificação de Produto:**
    - O usuário (consumidor) tem um item físico mas não sabe o nome exato para buscar ofertas.
    - O usuário seleciona uma imagem do item do seu dispositivo e faz o upload.
    - O sistema identifica objetos na imagem (ex: "lata de refrigerante").
    - O usuário pode então usar o nome do objeto identificado para buscar ofertas no Preço Real (ver UC2).
    - O sistema pode, opcionalmente, exibir traduções dos nomes dos objetos.
- **UC7 (Apoio à busca via imagem): Descoberta de Produtos Relacionados (IA):**
    - Após a identificação de objetos (UC6), se o usuário desejar, o sistema (via IA) pode sugerir produtos comercialmente disponíveis que são relevantes (usando nomes em inglês/idioma base).
- **UC8 (Apoio à informação via imagem): Extração de Propriedades de Produtos (IA):**
    - Para produtos identificados (UC6) ou encontrados (UC7), o sistema (via IA) pode extrair e apresentar características importantes (ex: cor, material, marca), se aplicável e útil para o contexto de "Preço Real".
- **UC9 (Para análise de imagem): Feedback Visual do Processamento:**
    - O usuário visualiza o progresso da análise da imagem em etapas.
    - O usuário recebe notificações (toasts) sobre o status e erros.
- **UC10: Consulta de Produtos no Banco de Dados (Catálogo - via análise de imagem):**
    - O usuário (ou o sistema através da análise de imagem) pode pesquisar produtos existentes no catálogo de produtos canônicos do Preço Real.
    - O sistema exibe informações do produto, incluindo dados multilíngues e, potencialmente, um resumo do histórico de preços. Esta busca é atualmente feita pelo `findStoresTool` com base em um `canonicalName`.
- **UC11: Gerenciamento de Dados de Produtos e Perfis de Consumidor (com Autenticação):**
    - Usuários consumidores autenticados poderão salvar preferências, locais frequentes, etc.
    - Administradores do Preço Real (se houver) poderão gerenciar o catálogo de produtos canônicos, categorias, etc.
- **UC12: Definição de Idioma da Interface:**
    - O sistema pode tentar detectar o idioma preferido do usuário.
    - O usuário terá a opção de selecionar manually o idioma da interface (Português/Inglês) (CONCLUÍDO).
    - A interface suporta i18n (CONCLUÍDO para textos básicos e metadados).
- **UC13: Monitoramento de Dados Agregados:**
    - O usuário (administrador ou analista do Preço Real) acessa uma página de monitoramento.
    - O usuário seleciona um produto ou categoria.
    - O sistema exibe o valor médio desse produto/categoria em diferentes regiões/países onde há anúncios registrados, com base nos dados de anúncios expirados e perfis de lojas.

## 3. Estado Atual

O aplicativo "Preço Real" está em um estágio funcional, com as seguintes tecnologias:
- **Frontend:** Next.js (App Router), React, TypeScript.
- **UI Components:** ShadCN UI.
- **Estilização:** Tailwind CSS.
- **Funcionalidades AI (Genkit, Gemini):**
    - `identifyObjects`: Identifica objetos em imagens e traduz nomes.
    - `searchRelatedProducts`: Busca produtos relacionados.
    - `extractProductProperties`: Extrai propriedades de produtos.
    - `findProductStoresFlow` (com `findStoresTool`): Busca lojas (atualmente consulta o Firebase para um modelo de produto/loja mais estático, baseado em `productAvailability` e `products`).
- **Testes:** Configuração de Jest.
- **Banco de Dados:** Firebase Realtime Database (estrutura inicial para produtos e lojas; necessita ser expandida para anúncios e perfis de lojistas).
- **Deployment:** Configurado para Vercel (funciona bem em produção com as variáveis de ambiente corretas).
- **Geolocalização:** Frontend obtém localização do usuário.
- **Página de Monitoramento:** Exibe valor médio de produtos por país (baseado na estrutura de dados atual).
- **Internacionalização (i18n):** Suporte para Português ("Preço Real") e Inglês ("Real Price") com `next-intl`, incluindo metadados e seletor de idioma.
- **Layout da Página Principal:** Reformulado para ser um "Feed de Ofertas" com busca, filtros de categoria (mockados) e exibição de ofertas (mockadas). A funcionalidade de análise de imagem foi mantida como uma ferramenta de apoio na mesma página, dentro de um acordeão.

Principais funcionalidades implementadas:
- Feed de ofertas na página principal (com dados mockados).
- Busca e filtros de categoria na página principal (filtram os dados mockados).
- Upload de imagens e análise básica pela IA (identificação, produtos relacionados, propriedades).
- Exibição de resultados da IA (relacionados à análise de imagem).
- Interface para buscar lojas para produtos identificados por imagem (usa `findProductStoresFlow`).
- Obtenção de localização GPS do usuário.
- Notificações e feedback de progresso.
- Design responsivo e tema customizado.
- Configuração Firebase e Vercel.
- Página de monitoramento básica.
- Suporte i18n (PT/EN) para textos e metadados, incluindo seletor de idioma.

**Desafios com a Mudança de Escopo (e próximos passos):**
A transição para "Preço Real" com foco em anúncios de lojistas e feed geolocalizado requer:
- Implementação de autenticação para lojistas.
- Criação de uma interface para lojistas gerenciarem perfis e anúncios.
- Desenvolvimento do sistema de feed geolocalizado (consultas espaciais no Firebase ou sistema RAG), substituindo os dados mockados.
- Nova modelagem de dados para anúncios/ofertas com prazo de validade no Firebase.
- Adaptação/criação dos fluxos de IA e ferramentas para o novo modelo de anúncios e busca no feed.

## 4. Arquitetura do Banco de Dados (Firebase Realtime Database) - Proposta para "Preço Real"

A estrutura precisará ser adaptada e expandida.

### `/products/{productId}` (Catálogo Canônico - Opcional/Referência)
Pode ser mantido para produtos comuns que lojistas podem referenciar, ou focar apenas em anúncios.
- `canonicalName` (string): Nome principal/referência do produto.
- `brand` (string, opcional): Marca.
- `category` (string): Categoria principal do produto (ex: "lanche", "bebida", "eletrônico").
- `attributes` (objeto, opcional): Características.
- `images` (array de strings, opcional): URLs de imagens de referência.
- `localizedData` (objeto): Nomes e descrições traduzidas.
- `createdAt`, `updatedAt`.
*(Nota: Atualmente, o `findStoresTool` busca `canonicalName` aqui para encontrar um `productId` e depois usa `productAvailability`.)*

### `/stores/{storeId}` (Perfis de Lojistas/Estabelecimentos)
- `ownerUserId` (string): ID do usuário Firebase autenticado que é o proprietário.
- `name` (string): Nome do estabelecimento.
- `description` (string, opcional): Descrição da loja.
- `category` (string): Tipo de estabelecimento (ex: "restaurante", "supermercado", "loja de eletrônicos").
- `location` (objeto):
    - `address`: "Rua Principal, 123"
    - `city`: "Cidade Exemplo"
    - `countryCode`: "BR"
    - `postalCode`: "12345-678"
    - `coordinates` (objeto): Coordenadas GPS.
        - `lat` (number)
        - `lng` (number)
    - `geohash` (string, opcional): Para consultas de proximidade no Firebase.
- `logoUrl` (string, opcional).
- `phone` (string, opcional).
- `openingHours` (objeto, opcional).
- `defaultCurrency` (string): "BRL".
- `createdAt`, `updatedAt`.
*(Nota: Atualmente usado pelo `findStoresTool` e pela página de Monitoramento para obter `name` e `countryCode`.)*

### `/advertisements/{advertisementId}` (Anúncios/Ofertas dos Lojistas) - **NOVO NÓ PRINCIPAL PARA O FEED**
Nó principal para o feed.
- `storeId` (string): ID da loja que publicou (referência a `/stores/{storeId}`).
- `productName` (string): Nome do produto/oferta anunciado (pode ser texto livre do lojista).
- `productId` (string, opcional): Se o anúncio se refere a um produto do catálogo canônico `/products/{productId}`.
- `description` (string, opcional).
- `price` (number): Preço da oferta.
- `currency` (string): Moeda (ex: "BRL").
- `category` (string): Categoria do produto/oferta (para filtros, ex: "Lanches", "Pizzas").
- `imageUrl` (string, opcional): Imagem do produto/oferta.
- `postedAt` (timestamp): Quando o anúncio foi publicado.
- `expiresAt` (timestamp): Quando o anúncio expira (ex: postedAt + 24 horas). Indexar por `expiresAt` para limpeza.
- `location` (objeto): Coordenadas da loja (pode ser duplicado aqui para facilitar consultas geoespaciais ou referenciar `/stores/{storeId}/location`).
    - `lat` (number)
    - `lng` (number)
    - `geohash` (string)
- `status` (string): "active", "expired", "deleted". Indexar por `status` e `geohash`.

**Indexação para `/advertisements`:**
Para otimizar o feed geolocalizado:
- Firebase não suporta consultas geoespaciais complexas nativamente em Realtime DB de forma eficiente para grandes datasets.
- **Opção 1 (Simplificada com Geohashes):** Armazenar `geohash` para a localização do anúncio (derivado das coordenadas da loja). Consultar por faixas de geohash próximas à localização do usuário. Requer lógica no cliente/servidor para calcular geohashes e faixas de consulta.
- **Opção 2 (RAG Geospacial - Visão Futura):** Como discutido, usar um sistema externo com banco de dados vetorial para buscas de proximidade mais avançadas.
- **Opção 3 (Cloud Functions + Indexação Manual):** Usar Cloud Functions para manter índices secundários, por exemplo, por região/cidade e categoria, mas ainda limitado para proximidade fina.

Consultas típicas para o feed: "buscar anúncios ativos dentro de uma área geográfica (via geohash/faixa) e opcionalmente por categoria, ordenados por `postedAt` descendente ou por proximidade (se a consulta geospacial permitir)".

### `/productAvailability/{productId}/{storeId}` (Disponibilidade - Estrutura Atual)
- `currentPrice` (number)
- `currency` (string)
- `inStock` (boolean, opcional)
- `productUrl` (string, opcional)
- `lastSeen` (timestamp, opcional)
*(Nota: Atualmente usado pelo `findStoresTool` e pela página de Monitoramento. Precisará ser avaliado se será substituído ou complementado pela estrutura `/advertisements`.)*

### `/priceHistory/{productId}` ou `/productPriceTrends/{productId}`
Alimentado por anúncios expirados do nó `/advertisements`.
- `"{timestamp}"`:
    - `price` (number)
    - `currency` (string)
    - `storeId` (string) // Para saber de qual loja era o preço
    - `countryCode` (string) // Derivado da loja, para a página de monitoramento

### `/userProfiles/{userId}` (Consumidores)
Mantém estrutura similar à anterior (preferências, localização).

## 5. Pontos de Atenção

- **Escopo da Mudança:** O novo foco em "Preço Real" é uma mudança substancial que exigirá desenvolvimento significativo de novas funcionalidades (autenticação de lojistas, interface de anúncios, feed geolocalizado com dados reais).
- **Consultas Geoespaciais:** Implementar buscas por proximidade eficientes no Firebase Realtime Database é desafiador. Geohashes são uma aproximação. RAG é uma solução mais robusta, mas complexa.
- **Validade dos Anúncios:** Um sistema para gerenciar o ciclo de vida dos anúncios (ativação, expiração, remoção do feed, movimentação para histórico) será necessário (provavelmente via Cloud Functions ou agendamento).
- **Dois Tipos de Usuário:** Gerenciar perfis e interfaces distintas para consumidores e lojistas.
- **Moderação de Conteúdo:** Considerar como o conteúdo dos anúncios será monitorado.
- **Precisão da IA (para função de apoio):** Continua relevante se a análise de imagem for mantida.
- **Limites da API e Custo:** O uso de IA e Firebase tem custos. O volume de anúncios e consultas geoespaciais pode impactar os custos do Firebase.
- **Segurança do Firebase:** Regras de segurança precisarão ser cuidadosamente definidas para os novos nós de dados (lojistas só podem editar seus anúncios/perfis, consumidores só leem anúncios ativos, etc.).
- **Privacidade do Usuário:** Uso transparente da localização.
- **Internacionalização e Moedas:** Já iniciado, mas precisa ser mantido. O feed de ofertas precisará lidar com a moeda da loja local.

## 6. Próximos Passos (Revisado para "Preço Real")

- **Prioridade Imediata (Fundação para Lojistas e Anúncios):**
    - **Autenticação de Usuários:** Implementar Firebase Authentication para consumidores e, crucialmente, para lojistas.
    - **Perfis de Lojistas (CRUD):**
        - Desenvolver UI e lógica para lojistas se cadastrarem, criarem e gerenciarem seus perfis de loja (nome, localização/coordenadas, categoria, etc.).
        - Definir regras de segurança do Firebase para perfis de loja.
    - **Sistema de Anúncios/Ofertas (CRUD para Lojistas):**
        - Desenvolver UI e lógica para lojistas criarem, visualizarem, editarem (se aplicável antes de expirar) e excluírem seus anúncios (produto, preço, categoria, validade).
        - Definir regras de segurança para anúncios.
- **Prioridade Média (Feed para Consumidores com Dados Reais):**
    - **Implementação do Feed Geolocalizado (com Dados Reais):**
        - Utilizar geolocalização do consumidor.
        - Implementar busca de anúncios ativos no Firebase (do nó `/advertisements`) usando Geohashes para filtrar por proximidade (requer que lojas/anúncios tenham geohash).
        - Substituir os dados mockados do feed por dados reais do Firebase.
        - Exibir feed ordenado por data de postagem ou, se possível com geohash, por proximidade estimada.
    - **Filtros para o Feed (com Dados Reais):** Implementar filtros por categoria de produto no feed, consultando o nó `/advertisements`.
- **Prioridade Contínua/Melhorias:**
    - **Internacionalização (i18n) e Localização (L10n):**
        - Expandir traduções para todos os textos da UI (CONTÍNUO).
        - Traduzir títulos de metadados (CONCLUÍDO).
        - Adicionar seletor de idioma na UI (CONCLUÍDO).
    - **Histórico de Preços:** Implementar lógica (ex: Cloud Function) para mover dados de anúncios expirados para o histórico de preços.
    - **Página de Monitoramento:** Adaptar para usar dados do novo sistema de anúncios/histórico.
    - **Refinamento da Busca de Produtos (Análise de Imagem):** A função de análise de imagens (`identifyObjects`, `searchRelatedProducts`, `extractProductProperties`) pode ser mantida. O fluxo `findProductStoresFlow` (que usa `productAvailability`) precisará ser reavaliado ou adaptado/substituído pela lógica de busca no feed de anúncios `/advertisements` se o objetivo for encontrar ofertas atuais em vez de apenas lojas que *geralmente* têm o produto.
    - **Implementação de RAG Geospacial (Visão de Longo Prazo):** Para otimizar buscas por proximidade.
    - **Melhorias na UI/UX para Consumidores e Lojistas.**
    - **Testes.**

## 7. Histórico de Configurações de Layout da UI (Tema Atual para "Preço Real")

- O nome do aplicativo nos cabeçalhos, rodapés e títulos de página será "Preço Real" (em português) e "Real Price" (em inglês).
- A página principal (`src/app/[locale]/page.tsx`) foi **redesenhada para ser um feed de ofertas**. Ela inclui:
    - Obtenção de localização do usuário.
    - Seção de busca de ofertas (input de texto).
    - Seção de filtros por categoria (botões, atualmente filtrando dados mockados).
    - Seção de feed de ofertas (lista de cards, atualmente com dados mockados).
    - A funcionalidade de análise de imagem foi mantida como uma ferramenta de apoio, dentro de um componente `Accordion`.
- A página de monitoramento (`src/app/[locale]/monitoring/page.tsx`) será adaptada.
- Novas rotas/páginas serão necessárias para perfis de lojistas e gerenciamento de anúncios.

**Cores Principais do Tema Atual (Modo Claro e Escuro):**
(Mantidas conforme definido anteriormente, podem ser ajustadas se necessário para a nova marca "Preço Real")

## 8. Processo de Atualização e Manutenção

- Mantido: "Sempre que for identificado um ponto final "." ... o arquivo `memo.md` deve ser analisado e atualizado..."
- Mantido: "Dois pontos finais seguidos ".." significam que o sistema deve continuar..."
- Mantido: Criação de snapshots do `memo.md` na pasta `historico/` após conclusões de etapas. (Último snapshot: `05_memo_md_post_translate_to_preco_real.md`)

## 9. Internacionalização (i18n) com `next-intl`

- A estrutura existente será mantida e expandida para os novos textos e seções do "Preço Real".
- Idiomas Suportados: Português (`pt` - padrão, nome "Preço Real"), Inglês (`en`, nome "Real Price").
- O `LanguageSwitcher` está implementado (CONCLUÍDO).
- Metadados traduzidos (CONCLUÍDO).
- Textos básicos da UI das páginas principal e de monitoramento estão traduzidos (CONTÍNUO).
- Próximos passos: Traduzir novos textos da UI para o feed, perfis de lojistas, etc., à medida que são adicionados.
