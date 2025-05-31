

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
- **Funcionalidade Secundária (Apoio):** Permitir que os usuários façam upload de imagens ou **tirem fotos com a câmera do dispositivo** para análise (identificar objetos, traduções). Essa funcionalidade pode ser usada para ajudar o usuário a identificar um item sobre o qual deseja buscar ofertas no feed principal.
- Integrar com Firebase Realtime Database para:
    - Manter um catálogo de produtos canônicos (para referência, se aplicável).
    - Registrar lojas/estabelecimentos, incluindo sua localização geográfica e perfis.
    - Registrar anúncios/ofertas de produtos feitos por lojistas, incluindo preço, validade e localização.
    - Rastrear o histórico de preços dos produtos, alimentado pelos anúncios expirados.
    - Manter perfis de usuário (consumidores) com preferências e dados como localização.
- Implementar internacionalização (i18n) da interface do usuário (Português "Preço Real", Inglês "Real Price").
- Fornecer uma página de monitoramento para visualizar dados agregados (ex: valor médio de um produto por região/país, tendências de preço).
- **Visão Futura:**
    - Implementar um sistema de Retrieval Augmented Generation (RAG) geospacial para clusterizar/agrupar lojas, anúncios e produtos por proximidade, otimizando o tráfego de dados e garantindo informações atualizadas das lojas mais próximas ao usuário.
    - Desenvolver "Superagentes" de IA para funcionalidades avançadas (ver seção 8).

## 2. Casos de Uso

- **UC1 (Principal): Descoberta de Ofertas Próximas (Feed Geolocalizado):**
    - O usuário (consumidor) abre o aplicativo Preço Real.
    - O aplicativo solicita e utiliza a localização GPS do usuário (com consentimento).
    - O sistema exibe um feed de produtos/ofertas que estão sendo anunciados por lojas próximas ao usuário. (DADOS REAIS DO FIREBASE SENDO BUSCADOS, SEM GEOLOCALIZAÇÃO AVANÇADA AINDA)
    - Os anúncios são apresentados com informações como nome do produto, preço, nome da loja e distância (calculada se localizações disponíveis).
    - O usuário pode rolar o feed para ver mais ofertas.
- **UC2 (Principal): Filtragem e Busca de Produto Específico por Proximidade:**
    - (Continuando do UC1 ou como uma ação separada) O usuário deseja um produto específico (ex: "hot dog").
    - O usuário utiliza um filtro de categoria (ex: toca no ícone "hot dog") ou uma barra de busca. (FILTROS E BUSCA FUNCIONAM COM DADOS REAIS, CLIENT-SIDE)
    - O sistema exibe uma lista de todas as lojas próximas que anunciaram "hot dogs" (ou o produto buscado), ordenadas pela proximidade em relação ao usuário (ORDENAÇÃO POR PROXIMIDADE PENDENTE, REQUER GEOLOCALIZAÇÃO AVANÇADA).
    - Cada item da lista mostra o nome da loja, o produto, o preço anunciado e a distância.
- **UC3 (Lojista): Cadastro e Gerenciamento de Perfil de Loja:**
    - Um proprietário de loja se cadastra no Preço Real como "lojista" (requer autenticação - AUTENTICAÇÃO IMPLEMENTADA).
    - O lojista preenche o perfil da sua loja, incluindo nome, endereço, tipo de estabelecimento e, crucialmente, define sua localização geográfica. (CRIAÇÃO/VISUALIZAÇÃO DE PERFIL DE LOJA IMPLEMENTADA).
- **UC4 (Lojista): Publicação de Anúncios/Ofertas:**
    - O lojista autenticado acessa a interface para criar um novo anúncio. (PENDENTE)
    - Ele informa o nome do produto, preço, categoria, opcionalmente uma descrição e imagem.
    - O sistema define automaticamente a validade do anúncio (ex: 24 horas a partir da publicação).
    - O anúncio publicado aparece no feed de usuários próximos que se encaixam na categoria do produto.
- **UC5 (Sistema): Gerenciamento de Anúncios e Histórico de Preços:**
    - Anúncios publicados têm um tempo de vida limitado (ex: 24 horas). (VERIFICAÇÃO DE EXPIRAÇÃO NO CLIENTE IMPLEMENTADA AO BUSCAR ANÚNCIOS).
    - Após a expiração, o anúncio desaparece do feed ativo dos usuários. (LÓGICA DE ATUALIZAÇÃO DE STATUS NO BD PENDENTE).
    - Os dados do anúncio expirado (produto, preço, loja, data) são registrados no sistema de histórico de preços associado ao produto (se for um produto catalogado) e/ou à loja. (PENDENTE)
- **UC6: Análise de Imagem (Upload ou Câmera) para Busca de Ofertas:**
    - Um usuário (consumidor), como o de Formosa, Goiás, está com fome e quer um "hot dog".
    - Ele abre o app Preço Real, que atualiza o feed de ofertas locais.
    - O usuário pode opcionalmente tocar no ícone da câmera, **tirar uma foto de um hot dog** (ou selecionar uma imagem do seu dispositivo). (FUNCIONALIDADE DE CÂMERA E UPLOAD IMPLEMENTADA NA ABA "IDENTIFICAR")
    - O sistema identifica "hot dog" na imagem. (FLUXO DE IDENTIFICAÇÃO EXISTENTE)
    - O sistema então busca e exibe uma lista de todas as lojas que vendem "hot dogs", ordenadas por proximidade (esta busca de lojas ainda precisa ser adaptada para usar o feed de anúncios `/advertisements` em vez do antigo `productAvailability`). (BUSCA DE LOJAS USA `findProductStoresFlow` QUE CONSULTA `productAvailability`).
- **UC7 (Apoio à busca via imagem): Descoberta de Produtos Relacionados (IA):**
    - Após a identificação de objetos (UC6), se o usuário desejar, o sistema (via IA) pode sugerir produtos comercialmente disponíveis que são relevantes (usando nomes em inglês/idioma base). (IMPLEMENTADO NA ABA "IDENTIFICAR")
- **UC8 (Apoio à informação via imagem): Extração de Propriedades de Produtos (IA):**
    - Para produtos identificados (UC6) ou encontrados (UC7), o sistema (via IA) pode extrair e apresentar características importantes (ex: cor, material, marca), se aplicável e útil para o contexto de "Preço Real". (IMPLEMENTADO NA ABA "IDENTIFICAR")
- **UC9 (Para análise de imagem): Feedback Visual do Processamento:**
    - O usuário visualiza o progresso da análise da imagem em etapas. (IMPLEMENTADO NA ABA "IDENTIFICAR")
    - O usuário recebe notificações (toasts) sobre o status e erros. (IMPLEMENTADO)
- **UC10: Consulta de Produtos no Banco de Dados (Catálogo - via análise de imagem):**
    - O usuário (ou o sistema através da análise de imagem) pode pesquisar produtos existentes no catálogo de produtos canônicos do Preço Real.
    - O sistema exibe informações do produto, incluindo dados multilíngues e, potencialmente, um resumo do histórico de preços. Esta busca é atualmente feita pelo `findStoresTool` com base em um `canonicalName`. (IMPLEMENTADO VIA `findProductStoresFlow`)
- **UC11: Gerenciamento de Dados de Produtos e Perfis de Consumidor (com Autenticação):**
    - Usuários consumidores autenticados poderão salvar preferências, locais frequentes, etc. (PERFIS DE USUÁRIO PENDENTE, AUTENTICAÇÃO IMPLEMENTADA)
    - Administradores do Preço Real (se houver) poderão gerenciar o catálogo de produtos canônicos, categorias, etc. (PENDENTE)
- **UC12: Definição de Idioma da Interface:**
    - O sistema pode tentar detectar o idioma preferido do usuário.
    - O usuário terá a opção de selecionar manually o idioma da interface (Português/Inglês). (CONCLUÍDO)
    - A interface suporta i18n. (CONCLUÍDO)
- **UC13: Monitoramento de Dados Agregados:**
    - O usuário (administrador ou analista do Preço Real) acessa uma página de monitoramento. (PÁGINA EXISTENTE)
    - O usuário seleciona um produto ou categoria.
    - O sistema exibe o valor médio desse produto/categoria em diferentes regiões/países onde há anúncios registrados, com base nos dados de anúncios expirados e perfis de lojas. (PÁGINA DE MONITORAMENTO USA `productAvailability`, PRECISA ADAPTAR PARA `/advertisements` E HISTÓRICO)
- **UC14 (Administrador): Interação com Superagente de Análise via Chat:**
    - O administrador acessa uma página de chat dedicada (ex: `/admin/super-agent-chat`).
    - O administrador interage com o "Superagente de Análise e Relatórios" para obter insights sobre o projeto, uso do banco de dados, atividade de usuários, possíveis falhas ou pontos de atenção. (INTERFACE DE CHAT INTERATIVA COM RESPOSTAS PLACEHOLDER DO FLUXO GENKIT CONCLUÍDA).
- **UC15 (Variação de UC6): Uso da Câmera para Identificação e Busca Rápida:**
    - Um usuário abre o Preço Real.
    - O aplicativo exibe o feed de ofertas locais.
    - O usuário toca no ícone da câmera (na aba "Identificar").
    - O aplicativo solicita permissão para usar a câmera.
    - O usuário tira uma foto de um item (ex: um hot dog).
    - A imagem capturada é usada para identificar o objeto ("hot dog").
    - O sistema busca e exibe uma lista de lojas que anunciam "hot dogs", ordenadas por proximidade. (CONCLUÍDO o uso da câmera; a busca de ofertas ainda usa o modelo antigo de `findProductStoresFlow`).

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
    - `superAgentAnalyticsChatFlow`: Fluxo para o chat com o superagente de análise (retorna respostas placeholder).
- **Testes:** Configuração de Jest.
- **Banco de Dados:** Firebase Realtime Database (estrutura inicial para produtos e lojas; estrutura para anúncios (`/advertisements`) sendo utilizada para o feed).
- **Deployment:** Configurado para Vercel (funciona bem em produção com as variáveis de ambiente corretas).
- **Geolocalização:** Frontend obtém localização do usuário.
- **Página de Monitoramento:** Exibe valor médio de produtos por país (baseado na estrutura de dados `productAvailability`).
- **Internacionalização (i18n):** Suporte para Português ("Preço Real") e Inglês ("Real Price") com `next-intl`, incluindo metadados e seletor de idioma.
- **Layout da Página Principal:** Reformulado para usar abas (Ofertas, Identificar, Mapa - desabilitado, Conta), inspirado no layout do WhatsApp. O feed de ofertas na aba "Ofertas" agora busca dados reais do nó `/advertisements` do Firebase, filtrando por status "active" e calculando tempo de expiração. Busca textual e filtros de categoria (client-side) funcionam sobre os dados carregados.
- **Funcionalidade de Captura de Foto via Câmera:** Adicionada e integrada na aba "Identificar" (UC15).
- **Página de Chat com Superagente:** Criada em `/admin/super-agent-chat` e agora permite interação básica (envio de mensagens e recebimento de respostas placeholder do fluxo Genkit).
- **Autenticação:** Implementado sistema de autenticação com Firebase (Email/Senha). Usuários podem se cadastrar, fazer login e logout.
- **Perfis de Lojistas:** Usuários autenticados podem criar e visualizar/editar um perfil básico de loja (nome, descrição, categoria, localização, moeda) que é salvo no Firebase em `/stores/{userId}`.

Principais funcionalidades implementadas:
- Layout principal com navegação por abas (Ofertas, Identificar, Mapa (desabilitado), Conta).
- Feed de ofertas na aba "Ofertas" buscando dados reais de `/advertisements` do Firebase (filtrando por `status: "active"`).
- Cálculo de tempo de expiração para ofertas.
- Cálculo de distância para ofertas (se localização do usuário e da loja disponíveis).
- Busca textual e filtros de categoria (client-side) na aba "Ofertas" sobre os dados carregados.
- Aba "Identificar" com upload de imagens e **captura de foto via câmera** para análise básica pela IA (identificação, produtos relacionados, propriedades).
- Exibição de resultados da IA (relacionados à análise de imagem).
- Interface para buscar lojas para produtos identificados por imagem (usa `findProductStoresFlow`).
- Obtenção de localização GPS do usuário.
- Notificações e feedback de progresso.
- Design responsivo e tema customizado.
- Configuração Firebase e Vercel.
- Página de monitoramento básica (precisa ser adaptada para `/advertisements`).
- Suporte i18n (PT/EN) para textos e metadados, incluindo seletor de idioma.
- Página de chat com Superagente de Análise com interação básica (mensagens e respostas placeholder).
- Autenticação de usuários (cadastro, login, logout com Firebase).
- Criação e visualização de Perfis de Loja para usuários autenticados.

**Desafios com a Mudança de Escopo (e próximos passos):**
A transição para "Preço Real" com foco em anúncios de lojistas e feed geolocalizado requer:
- Implementação da interface para lojistas gerenciarem (CRUD completo) seus anúncios.
- Desenvolvimento do sistema de feed geolocalizado com Geohashes ou RAG para buscas por proximidade eficientes, substituindo a busca atual que carrega todos os anúncios ativos.
- Adaptação/criação dos fluxos de IA e ferramentas para o novo modelo de anúncios e busca no feed (ex: `findProductStoresFlow` precisa ser atualizado).
- Desenvolvimento dos Superagentes de IA (ver seção 8).
- Lógica para o sistema mover anúncios expirados para o histórico de preços.

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

### `/stores/{storeId}` (Perfis de Lojistas/Estabelecimentos) - **IMPLEMENTADO CRUD BÁSICO**
O `storeId` pode ser o `userId` do proprietário.
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
    - `geohash` (string, opcional): Para consultas de proximidade no Firebase. (PENDENTE DE IMPLEMENTAÇÃO)
- `logoUrl` (string, opcional).
- `phone` (string, opcional).
- `openingHours` (objeto, opcional).
- `defaultCurrency` (string): "BRL".
- `createdAt`, `updatedAt`.
*(Nota: Atualmente usado pelo `findStoresTool` e pela página de Monitoramento para obter `name` e `countryCode`. Também usado para salvar/carregar perfis de loja.)*

### `/advertisements/{advertisementId}` (Anúncios/Ofertas dos Lojistas) - **UTILIZADO PARA O FEED ATUAL**
Nó principal para o feed.
- `storeId` (string): ID da loja que publicou (referência a `/stores/{storeId}`).
- `productName` (string): Nome do produto/oferta anunciado (pode ser texto livre do lojista).
- `productId` (string, opcional): Se o anúncio se refere a um produto do catálogo canônico `/products/{productId}`.
- `description` (string, opcional).
- `price` (number): Preço da oferta.
- `currency` (string): Moeda (ex: "BRL").
- `category` (string): Categoria do produto/oferta (para filtros, ex: "Lanches", "Pizzas").
- `imageUrl` (string, opcional): Imagem do produto/oferta.
- `dataAiHint` (string, opcional): Dica para busca de imagem placeholder.
- `postedAt` (timestamp): Quando o anúncio foi publicado.
- `expiresAt` (timestamp): Quando o anúncio expira (ex: postedAt + 24 horas). Indexar por `expiresAt` para limpeza.
- `location` (objeto): Coordenadas da loja (pode ser duplicado aqui para facilitar consultas geoespaciais ou referenciar `/stores/{storeId}/location`).
    - `lat` (number)
    - `lng` (number)
    - `geohash` (string, opcional) (PENDENTE DE IMPLEMENTAÇÃO)
- `status` (string): "active", "expired", "deleted". Indexar por `status` e `geohash`. (BUSCANDO POR "active")

**Indexação para `/advertisements`:**
Para otimizar o feed geolocalizado:
- Firebase não suporta consultas geoespaciais complexas nativamente em Realtime DB de forma eficiente para grandes datasets.
- **Opção 1 (Simplificada com Geohashes):** Armazenar `geohash` para a localização do anúncio (derivado das coordenadas da loja). Consultar por faixas de geohash próximas à localização do usuário. Requer lógica no cliente/servidor para calcular geohashes e faixas de consulta. (PENDENTE)
- **Opção 2 (RAG Geospacial - Visão Futura):** Como discutido, usar um sistema externo com banco de dados vetorial para buscas de proximidade mais avançadas.
- **Opção 3 (Cloud Functions + Indexação Manual):** Usar Cloud Functions para manter índices secundários, por exemplo, por região/cidade e categoria, mas ainda limitado para proximidade fina.

Consultas típicas para o feed: "buscar anúncios ativos dentro de uma área geográfica (via geohash/faixa) e opcionalmente por categoria, ordenados por `postedAt` descendente ou por proximidade (se a consulta geospacial permitir)". (ATUALMENTE BUSCA TODOS OS ATIVOS, FILTRA CLIENT-SIDE, SEM ORDENAÇÃO GEOSPACIAL).

### `/productAvailability/{productId}/{storeId}` (Disponibilidade - Estrutura Antiga)
- `currentPrice` (number)
- `currency` (string)
- `inStock` (boolean, opcional)
- `productUrl` (string, opcional)
- `lastSeen` (timestamp, opcional)
*(Nota: Atualmente usado pelo `findStoresTool` e pela página de Monitoramento. Precisa ser avaliado se será substituído ou complementado pela estrutura `/advertisements`.)*

### `/priceHistory/{productId}` ou `/productPriceTrends/{productId}` (PENDENTE)
Alimentado por anúncios expirados do nó `/advertisements`.
- `"{timestamp}"`:
    - `price` (number)
    - `currency` (string)
    - `storeId` (string) // Para saber de qual loja era o preço
    - `countryCode` (string) // Derivado da loja, para a página de monitoramento

### `/userProfiles/{userId}` (Consumidores) (PENDENTE)
Mantém estrutura similar à anterior (preferências, localização).

## 5. Pontos de Atenção

- **Escopo da Mudança:** O novo foco em "Preço Real" é uma mudança substancial que exigirá desenvolvimento significativo de novas funcionalidades (autenticação de lojistas, interface de anúncios, feed geolocalizado com dados reais).
- **Consultas Geoespaciais:** Implementar buscas por proximidade eficientes no Firebase Realtime Database é desafiador. Geohashes são uma aproximação. RAG é uma solução mais robusta, mas complexa. (FEED ATUAL NÃO USA GEOHASHES AINDA).
- **Validade dos Anúncios:** Um sistema para gerenciar o ciclo de vida dos anúncios (ativação, expiração, remoção do feed, movimentação para histórico) será necessário (provavelmente via Cloud Functions ou agendamento). (VERIFICAÇÃO DE EXPIRAÇÃO CLIENT-SIDE IMPLEMENTADA, LÓGICA DE ATUALIZAÇÃO DE STATUS NO BD PENDENTE).
- **Dois Tipos de Usuário:** Gerenciar perfis e interfaces distintas para consumidores e lojistas. (PERFIS DE LOJISTAS EM ANDAMENTO).
- **Moderação de Conteúdo:** Considerar como o conteúdo dos anúncios será monitorado.
- **Precisão da IA (para função de apoio):** Continua relevante se a análise de imagem for mantida.
- **Limites da API e Custo:** O uso de IA e Firebase tem custos. O volume de anúncios e consultas geoespaciais pode impactar os custos do Firebase.
- **Segurança do Firebase:** Regras de segurança precisarão ser cuidadosamente definidas para os novos nós de dados (lojistas só podem editar seus anúncios/perfis, consumidores só leem anúncios ativos, etc.).
- **Privacidade do Usuário:** Uso transparente da localização.
- **Internacionalização e Moedas:** Já iniciado, mas precisa ser mantido. O feed de ofertas precisará lidar com a moeda da loja local.

## 6. Próximos Passos (Revisado para "Preço Real")

- **Prioridade Imediata (Fundação para Lojistas e Anúncios):**
    - **Autenticação de Usuários:** (CONCLUÍDO - Email/Senha).
    - **Perfis de Lojistas (CRUD):** (CRIAÇÃO/VISUALIZAÇÃO CONCLUÍDA. Edição básica também. Exclusão pendente).
        - Desenvolver UI e lógica para lojistas se cadastrarem, criarem e gerenciarem seus perfis de loja (nome, localização/coordenadas, categoria, etc.).
        - Definir regras de segurança do Firebase para perfis de loja.
    - **Sistema de Anúncios/Ofertas (CRUD para Lojistas):** (PENDENTE)
        - Desenvolver UI e lógica para lojistas criarem, visualizarem, editarem (se aplicável antes de expirar) e excluírem seus anúncios (produto, preço, categoria, validade).
        - Definir regras de segurança para anúncios.
- **Prioridade Média (Feed para Consumidores com Dados Reais):**
    - **Implementação do Feed Geolocalizado (com Dados Reais):**
        - Utilizar geolocalização do consumidor. (CONCLUÍDO)
        - Implementar busca de anúncios ativos no Firebase (do nó `/advertisements`). (CONCLUÍDO - BUSCA TODOS OS ATIVOS, SEM FILTRO GEO AVANÇADO).
        - Usar Geohashes para filtrar por proximidade (requer que lojas/anúncios tenham geohash). (PENDENTE)
        - Substituir os dados mockados do feed por dados reais do Firebase. (CONCLUÍDO)
        - Exibir feed ordenado por data de postagem ou, se possível com geohash, por proximidade estimada. (ORDENAÇÃO POR DATA DE EXPIRAÇÃO IMPLEMENTADA, PROXIMIDADE PENDENTE).
    - **Filtros para o Feed (com Dados Reais):** Implementar filtros por categoria de produto no feed, consultando o nó `/advertisements`. (CONCLUÍDO - FILTROS CLIENT-SIDE).
- **Prioridade Contínua/Melhorias:**
    - **Internacionalização (i18n) e Localização (L10n):** (CONTÍNUO)
    - **Implementação da Funcionalidade de Câmera (UC6/UC15):** (CONCLUÍDO)
    - **Chat com Superagente de Análise (UC14):** (INTERFACE INTERATIVA COM RESPOSTAS PLACEHOLDER CONCLUÍDA).
    - **Histórico de Preços:** Implementar lógica (ex: Cloud Function) para mover dados de anúncios expirados para o histórico de preços. (PENDENTE)
    - **Página de Monitoramento:** Adaptar para usar dados do novo sistema de anúncios/histórico. (PENDENTE)
    - **Refinamento da Busca de Produtos (Análise de Imagem):** A função de análise de imagens (`identifyObjects`, `searchRelatedProducts`, `extractProductProperties`) pode ser mantida. O fluxo `findProductStoresFlow` (que usa `productAvailability`) precisará ser reavaliado ou adaptado/substituído pela lógica de busca no feed de anúncios `/advertisements` se o objetivo for encontrar ofertas atuais em vez de apenas lojas que *geralmente* têm o produto.
    - **Implementação de RAG Geospacial (Visão de Longo Prazo):** Para otimizar buscas por proximidade.
    - **Desenvolvimento dos Superagentes de IA (Visão de Longo Prazo - Seção 8).**
    - **Melhorias na UI/UX para Consumidores e Lojistas.**
    - **Testes.**

## 7. Histórico de Configurações de Layout da UI (Tema Atual para "Preço Real")

- O nome do aplicativo nos cabeçalhos, rodapés e títulos de página será "Preço Real" (em português) e "Real Price" (em inglês).
- A página principal (`src/app/[locale]/page.tsx`) foi **redesenhada para utilizar um layout de abas (Ofertas, Identificar, Mapa, Conta)**, inspirado no WhatsApp.
    - **Aba "Ofertas":**
        - Obtenção de localização do usuário.
        - Barra de busca de ofertas (input de texto) no Header da aba.
        - Seção de filtros por categoria (botões).
        - Seção de feed de ofertas (lista de cards), agora buscando dados reais do Firebase (`/advertisements`).
    - **Aba "Identificar":**
        - A funcionalidade de análise de imagem (upload de arquivo e **captura pela câmera**) está aqui. O acordeão anterior foi removido.
    - **Aba "Mapa":** Visualmente desabilitada por enquanto.
    - **Aba "Conta":** Espaço para perfil do usuário e acesso ao perfil da loja.
- A página de monitoramento (`src/app/[locale]/monitoring/page.tsx`) será adaptada.
- Novas rotas/páginas foram criadas para login, cadastro e perfil da loja.
- Uma nova página de administração (`src/app/[locale]/admin/super-agent-chat/page.tsx`) foi criada e possui interatividade básica para o chat com o superagente de análise.

**Cores Principais do Tema Atual (Modo Claro e Escuro):**
(Mantidas conforme definido anteriormente, podem ser ajustadas se necessário para a nova marca "Preço Real")

## 8. Superagentes de IA (Visão Futura)

Para garantir o bom funcionamento e a evolução contínua do sistema "Preço Real", propõe-se o desenvolvimento de "superagentes" de IA com responsabilidades específicas:

### 8.1. Superagente de Análise e Relatórios
- **Objetivo:** Monitorar a saúde do projeto, a integridade do banco de dados, o comportamento dos usuários e identificar proativamente possíveis falhas, gargalos ou pontos de atenção.
- **Funcionalidades:**
    - Gerar relatórios periódicos ou sob demanda sobre:
        - Uso de recursos do Firebase (leituras/escritas, armazenamento).
        - Padrões de busca de produtos e categorias.
        - Atividade de lojistas (novos anúncios, lojas cadastradas).
        - Erros de sistema (se logs de erro forem centralizados e acessíveis).
    - Analisar a estrutura do banco de dados em busca de inconsistências ou otimizações.
    - Identificar anúncios que podem ser fraudulentos ou de baixa qualidade (requer heurísticas e possivelmente feedback de usuários).
    - Sinalizar produtos com pouca ou nenhuma oferta.
- **Interface:** Uma página de chat dedicada (ex: `/admin/super-agent-chat`) permitirá que um administrador converse com este agente, solicitando análises específicas ou relatórios. (Interface CONCLUÍDA com interatividade básica, respostas placeholder).
- **Tecnologia:** Genkit Flow com múltiplas ferramentas (`ai.defineTool`) para acessar e processar dados do Firebase e, potencialmente, outros logs ou métricas do sistema. (Fluxo Genkit placeholder CONCLUÍDO, capaz de receber input e dar resposta placeholder).

### 8.2. Superagente de Descoberta Proativa
- **Objetivo:** Expandir o catálogo de produtos e o conhecimento do sistema sobre o que os usuários estão procurando, mesmo que ainda não haja ofertas diretas.
- **Funcionalidades:**
    - Monitorar as buscas textuais dos usuários no feed de ofertas.
    - Monitorar os objetos identificados através da análise de imagem (via upload ou câmera).
    - Quando um objeto/produto é frequentemente buscado/identificado mas tem poucas ou nenhuma oferta correspondente no nó `/advertisements` ou no catálogo `/products`:
        - O agente pode tentar encontrar informações adicionais sobre este produto online (requer ferramentas de busca na web).
        - Pode sugerir a criação de uma entrada canônica para este produto no catálogo `/products`.
        - Pode sinalizar para administradores ou para o "Superagente de Análise" que há uma demanda não atendida.
- **Interface:** Este agente operaria primariamente em background ou de forma automatizada, acionado por eventos de busca/identificação. Seus resultados poderiam ser enviados para uma área de "sugestões" para administradores ou alimentar diretamente o "Superagente de Análise".
- **Tecnologia:** Genkit Flows acionados por eventos ou periodicamente, utilizando ferramentas para analisar dados de busca/identificação e, potencialmente, ferramentas de busca na web.

### 8.3. Considerações sobre o "Superagente Coordenador"
A ideia de um "superagente que gerencia o comportamento dos outros agentes" (mencionado no caso de uso do usuário de Formosa, Goiás) é um conceito de arquitetura interessante. Em termos práticos com Genkit, isso pode ser traduzido como:
- **Fluxos Compostos:** Um fluxo de nível superior que invoca outros fluxos (os "agentes" individuais) em uma sequência lógica ou condicional para realizar uma tarefa complexa.
- **Orquestração:** O fluxo principal (o "superagente coordenador") seria responsável por passar os dados corretos para cada sub-fluxo e agregar/processar os resultados.
- **Estado Compartilhado:** Se necessário, poderia haver um mecanismo (ex: um registro no Firebase ou um cache) para que diferentes agentes/fluxos compartilhem informações ou estado, embora isso adicione complexidade.

Esses superagentes representam uma evolução significativa e exigirão desenvolvimento iterativo e cuidadoso das ferramentas e prompts de IA.

## 9. Processo de Atualização e Manutenção

- Mantido: "Sempre que for identificado um ponto final "." ... o arquivo `memo.md` deve ser analisado e atualizado..."
- Mantido: "Dois pontos finais seguidos ".." significam que o sistema deve continuar..."
- Mantido: Criação de snapshots do `memo.md` na pasta `historico/` após conclusões de etapas. (Último snapshot: `13_memo_md_post_whatsapp_inspired_layout.md`)

## 10. Internacionalização (i18n) com `next-intl`

- A estrutura existente será mantida e expandida para os novos textos e seções do "Preço Real".
- Idiomas Suportados: Português (`pt` - padrão, nome "Preço Real"), Inglês (`en`, nome "Real Price").
- O `LanguageSwitcher` está implementado (CONCLUÍDO).
- Metadados traduzidos (CONCLUÍDO).
- Textos básicos da UI das páginas principal, de monitoramento e de chat do superagente estão traduzidos (CONTÍNUO).
- Próximos passos: Traduzir novos textos da UI para o feed, perfis de lojistas, etc., à medida que são adicionados.
