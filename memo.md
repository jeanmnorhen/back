
# Relatório do Projeto: Image Insight Explorer

## 1. Objetivos do Projeto

- Permitir que os usuários façam upload de imagens para análise.
- Identificar automaticamente objetos presentes nas imagens enviadas usando IA (Genkit).
- Traduzir os nomes dos objetos identificados para múltiplos idiomas.
- Fornecer uma lista de produtos relacionados aos objetos identificados.
- Extrair e exibir propriedades chave dos produtos relacionados.
- Permitir a busca por lojas que vendem um produto específico (usando IA e ferramentas, agora conectada ao Firebase).
- Permitir que o sistema utilize a localização GPS do usuário (com consentimento) para otimizar a busca por lojas. (Frontend implementado para obter localização; Backend e ferramenta agora aceitam coordenadas, busca por proximidade no Firebase é futura).
- **Novo:** Registrar a localização GPS do usuário em seu perfil (requer autenticação e consentimento).
- **Novo:** Definir o idioma da interface do aplicativo com base na localização GPS do usuário (requer sistema de i18n e mapeamento).
- Permitir o cadastro de URLs de produtos em lojas específicas.
- Integrar com Firebase Realtime Database para:
    - Manter um catálogo de produtos com informações multilíngues.
    - Registrar lojas, incluindo sua localização geográfica.
    - Rastrear o histórico de preços dos produtos em diferentes lojas.
    - **Novo:** Manter perfis de usuário com preferências e dados como localização.
- Oferecer uma interface de usuário intuitiva e responsiva para facilitar a interação.
- **Novo:** Focar inicialmente no mercado brasileiro, mas com a intenção futura de expandir o sistema para buscar e registrar os valores de produtos brasileiros em lojas de outros países.
- **Novo:** Fornecer uma página de monitoramento para visualizar dados agregados do banco de dados, como o valor médio de um produto por país.
- **Visão Futura:** Implementar um sistema de Retrieval Augmented Generation (RAG) geospacial para clusterizar/agrupar lojas e produtos por proximidade, otimizando o tráfego de dados e garantindo informações atualizadas das lojas mais próximas ao usuário.

## 2. Casos de Uso

- **UC1: Análise de Imagem Simples:**
    - O usuário seleciona uma imagem do seu dispositivo.
    - O usuário faz o upload da imagem.
    - O sistema exibe os objetos identificados na imagem e suas traduções.
- **UC2: Descoberta de Produtos Relacionados (IA):**
    - Após a identificação de objetos (UC1), o sistema (via IA) busca e exibe produtos comercialmente disponíveis que são relevantes para os objetos identificados (usando nomes em inglês).
- **UC3: Extração de Propriediedades de Produtos (IA):**
    - Para os produtos encontrados (UC2), o sistema (via IA) extrai e apresenta características importantes (ex: cor, material, marca).
- **UC4: Feedback Visual do Processamento:**
    - O usuário visualiza o progresso da análise da imagem em etapas (identificação, busca de produtos, extração de propriedades).
    - O usuário recebe notificações (toasts) sobre o status de cada etapa e erros, se houver.
- **UC5: Consulta de Produtos no Banco de Dados:**
    - O usuário (ou o sistema) pode pesquisar produtos existentes no Firebase Realtime Database.
    - O sistema exibe informações do produto, incluindo dados multilíngues e histórico de preços por loja.
- **UC6: Gerenciamento de Dados de Produtos e Perfis (Futuro, com Autenticação):**
    - Usuários autenticados (administradores) poderão adicionar/editar produtos, lojas e registrar preços.
    - **Novo:** Usuários autenticados poderão ter sua localização GPS salva em seus perfis e, potencialmente, definir preferências de idioma.
- **UC7: Busca de Lojas para um Produto (IA com Ferramenta e DB):**
    - O usuário (ou sistema, após identificar um produto) pode solicitar a busca de lojas que vendem um produto específico.
    - O sistema (via IA e uma ferramenta `findStoresTool` agora conectada ao Firebase) retorna uma lista de lojas que vendem o produto. (UI integrada para chamar o fluxo `findProductStoresFlow`)
    - Opcionalmente, se o usuário fornecer sua localização, o sistema (fluxo e ferramenta) agora recebe essas coordenadas. A ferramenta `findStoresTool` (conectada ao Firebase) usa a localização para registrar no console; a busca atual da ferramenta não é afetada por essas coordenadas para filtrar ou ordenar por proximidade, sendo esta uma melhoria futura (potencialmente utilizando RAG geospacial).
- **UC8: Cadastro de Informações de Lojas e Produtos:**
    - Usuários administradores (ou o sistema via IA no futuro, para sugestões) poderão cadastrar novas lojas, incluindo sua localização (coordenadas GPS), e os produtos que vendem com seus respectivos URLs de site de venda e preços.
- **UC9 (Novo): Definição de Idioma da Interface:**
    - O sistema pode tentar detectar o idioma preferido do usuário com base na sua localização GPS (após consentimento) ou configurações do navegador.
    - O usuário terá a opção de selecionar manually o idioma da interface.
- **UC10 (Novo): Monitoramento de Dados Agregados:**
    - O usuário (administrador) acessa uma página de monitoramento.
    - O usuário seleciona um produto de uma lista.
    - O sistema exibe o valor médio desse produto em cada país onde ele tem registros de preço, com base nos dados de `productAvailability` e `stores`.

## 3. Estado Atual

O aplicativo "Image Insight Explorer" está em um estágio funcional, implementado com as seguintes tecnologias:
- **Frontend:** Next.js (App Router), React, TypeScript.
- **UI Components:** ShadCN UI.
- **Estilização:** Tailwind CSS.
- **Funcionalidades AI:** Genkit, utilizando o modelo Gemini do Google AI.
    - `identifyObjects`: Identifica objetos na imagem e traduz seus nomes para Espanhol, Francês, Alemão, Chinês (Simplificado), Japonês, Português (Brasil) e Português (Portugal).
    - `searchRelatedProducts`: Busca produtos relacionados aos objetos (usando nomes em inglês).
    - `extractProductProperties`: Extrai propriedades dos produtos encontrados.
    - `findProductStoresFlow` (com `findStoresTool`): Busca lojas que vendem um produto específico. A ferramenta `findStoresTool` agora **consulta o Firebase Realtime Database** para encontrar lojas. Ela aceita coordenadas de localização do usuário (se fornecidas) e as registra no console; a busca atual da ferramenta não utiliza estas coordenadas para filtrar ou ordenar por proximidade, sendo esta uma melhoria futura. (Integrado na UI, incluindo passagem de localização).
- **Testes:** Configuração de Jest para testes unitários, com testes para `identifyObjects` e `findProductStoresFlow` (incluindo cenários com localização).
- **Banco de Dados:** Configuração inicial do Firebase Realtime Database (inicialização e definição da estrutura de dados para produtos, lojas e disponibilidade).
- **Deployment:** Configurado para Vercel.
- **Geolocalização:** Frontend implementado para solicitar e obter a localização GPS do usuário. Essa localização agora é passada para o fluxo `findProductStoresFlow`. O card para solicitar a localização é ocultado após a obtenção bem-sucedida.
- **Novo:** **Página de Monitoramento:** Uma nova página (`/monitoring`) foi adicionada para exibir o valor médio de produtos por país. Ela busca produtos, permite a seleção de um produto e, em seguida, agrega e exibe os dados de preço médio por país com base nas informações de `productAvailability` e `stores` no Firebase.

Principais funcionalidades implementadas:
- Upload de imagens (com validação de tipo e tamanho).
- Pré-visualização da imagem selecionada.
- Processamento de imagem em três etapas assíncronas com IA (identificação, busca de produtos, extração de propriedades).
- Exibição dos resultados da IA em seções distintas, incluindo traduções de objetos para Espanhol, Francês, Alemão, Chinês (Simplificado), Japonês, Português (Brasil) e Português (Portugal).
- Interface para acionar a busca de lojas para produtos relacionados e exibir os resultados (usando o fluxo `findProductStoresFlow`, que agora busca no Firebase e pode receber a localização do usuário).
- Interface para solicitar e exibir a localização GPS do usuário (via navegador), com o card sendo ocultado após sucesso.
- Barra de progresso e mensagens de status durante a análise.
- Sistema de notificações (toast).
- Design responsivo e tema customizado.
- Configuração para deployment na Vercel (`vercel.json`).
- Configuração do Firebase (inicialização e variáveis de ambiente).
- **Novo:** Página de monitoramento em `/monitoring` para análise de preços médios de produtos por país.

## 4. Arquitetura do Banco de Dados (Firebase Realtime Database)

A seguir, a estrutura planejada para o Firebase Realtime Database:

### `/products/{productId}`
Armazena informações detalhadas sobre cada produto.
- `canonicalName` (string): Nome principal/referência do produto (ex: "Coca-Cola 2 Liter Bottle"). Usado para buscas internas.
- `brand` (string, opcional): Marca do produto (ex: "Coca-Cola").
- `attributes` (objeto, opcional): Atributos chave-valor estruturados.
    - `size`: "2L"
    - `container`: "bottle"
    - `category`: "soft drink"
    - `...(outros atributos relevantes)`
- `identifiers` (objeto, opcional): Identificadores únicos do produto.
    - `ean`: "1234567890123"
    - `upc`: "012345678905"
    - `...(outros como SKU por loja, se globalmente relevante)`
- `images` (array de strings, opcional): URLs para imagens do produto.
- `localizedData` (objeto): Dados traduzidos do produto. A chave é o código de idioma (ex: "en", "es", "pt-BR").
    - `"{languageCode}"`:
        - `name` (string): Nome do produto no idioma especificado.
        - `description` (string, opcional): Descrição do produto no idioma.
        - `...(outras propriedades localizáveis)`
- `propertiesAiExtracted` (array de strings, opcional): Lista de propriedades extraídas pela IA (ex: ["carbonated", "sweetened"]).
- `createdAt` (timestamp): Data de criação do registro.
- `updatedAt` (timestamp): Data da última atualização.

**Exemplo `/products/coke2l`:**
```json
{
  "canonicalName": "Coca-Cola 2 Liter Bottle",
  "brand": "Coca-Cola",
  "attributes": {
    "size": "2L",
    "container": "PET Bottle",
    "category": "Beverages"
  },
  "identifiers": {
    "upc": "049000028904"
  },
  "images": ["https://placehold.co/300x300.png?text=Coke+2L"],
  "localizedData": {
    "en": {
      "name": "Coca-Cola 2 Liter Bottle",
      "description": "The classic refreshing taste of Coca-Cola in a 2 liter bottle."
    },
    "es": {
      "name": "Coca-Cola Botella de 2 Litros",
      "description": "El sabor clásico y refrescante de Coca-Cola en una botella de 2 litros."
    },
    "pt-BR": {
      "name": "Coca-Cola Garrafa 2 Litros",
      "description": "O sabor clássico e refrescante da Coca-Cola em uma garrafa de 2 litros."
    }
  },
  "propertiesAiExtracted": ["carbonated", "original taste"],
  "createdAt": 1678886400000,
  "updatedAt": 1678886400000
}
```

### `/stores/{storeId}`
Armazena informações sobre as lojas onde os produtos são vendidos.
- `name` (string): Nome da loja (ex: "Supermercado Central").
- `location` (objeto, opcional): Detalhes da localização.
    - `address`: "Rua Principal, 123"
    - `city`: "Cidade Exemplo"
    - `countryCode`: "BR" // Importante para o foco inicial e expansão
    - `postalCode`: "12345-678"
    - `coordinates` (objeto, opcional): Coordenadas GPS.
        - `lat` (number): Latitude.
        - `lng` (number): Longitude.
- `defaultCurrency` (string): Código da moeda padrão da loja (ex: "BRL", "USD").
- `createdAt` (timestamp): Data de criação do registro.
- `updatedAt` (timestamp): Data da última atualização.

**Exemplo `/stores/storeABC`:**
```json
{
  "name": "Supermercado Preço Bom",
  "location": {
    "address": "Av. Brasil, 1000",
    "city": "Rio de Janeiro",
    "countryCode": "BR",
    "postalCode": "20000-000",
    "coordinates": {
        "lat": -22.9068,
        "lng": -43.1729
    }
  },
  "defaultCurrency": "BRL",
  "createdAt": 1678886400000,
  "updatedAt": 1678886400000
}
```

### `/productAvailability/{productId}/{storeId}`
Rastreia o preço, disponibilidade e histórico de preços de um produto específico em uma loja específica.
- `currentPrice` (number): Preço atual do produto na loja.
- `currency` (string): Código da moeda do preço (ex: "BRL"). Pode ser o mesmo da loja ou específico.
- `inStock` (boolean, opcional): Se o produto está em estoque.
- `productUrl` (string, opcional): URL do produto no site de venda da loja online.
- `lastSeen` (timestamp): Última vez que esta informação foi verificada/atualizada.
- `priceHistory` (objeto): Histórico de preços. A chave é um timestamp.
    - `"{timestamp}"`: (number) O preço naquele momento.
- `updatedAt` (timestamp): Data da última atualização deste registro de disponibilidade/preço.

**Exemplo `/productAvailability/coke2l/storeABC`:**
```json
{
  "currentPrice": 7.99,
  "currency": "BRL",
  "inStock": true,
  "productUrl": "http://supermercadoprecobom.com.br/produtos/coca-cola-2l",
  "lastSeen": 1679886400000,
  "priceHistory": {
    "1678886400000": 7.50,
    "1679059200000": 7.75,
    "1679886400000": 7.99
  },
  "updatedAt": 1679886400000
}
```

### `/userProfiles/{userId}` (Novo)
Armazena informações e preferências do usuário.
- `displayName` (string, opcional): Nome de exibição do usuário.
- `email` (string, opcional): Email do usuário (se autenticado com email).
- `photoURL` (string, opcional): URL da foto de perfil do usuário.
- `preferredLanguage` (string, opcional): Código de idioma preferido pelo usuário (ex: "en", "pt-BR").
- `lastKnownLocation` (objeto, opcional): Última localização GPS conhecida do usuário.
    - `latitude` (number)
    - `longitude` (number)
    - `timestamp` (timestamp)
- `createdAt` (timestamp): Data de criação do perfil.
- `updatedAt` (timestamp): Data da última atualização.

**Exemplo `/userProfiles/someUserId123`:**
```json
{
  "displayName": "Alex Usuário",
  "email": "alex@example.com",
  "preferredLanguage": "pt-BR",
  "lastKnownLocation": {
    "latitude": -23.5505,
    "longitude": -46.6333,
    "timestamp": 1680000000000
  },
  "createdAt": 1678886400000,
  "updatedAt": 1680000000000
}
```

Esta estrutura visa balancear a normalização (evitando duplicação excessiva de dados) com a facilidade de consulta comum no Realtime Database (dados aninhados onde faz sentido para leitura).

## 5. Pontos de Atenção

- **Precisão da IA:** A qualidade dos resultados (objetos, traduções, produtos, propriedades, lojas) depende da precisão dos modelos Genkit e Gemini. Casos de ambiguidade ou imagens de baixa qualidade podem levar a resultados subótimos.
- **Conexão com Firebase na Ferramenta:** A ferramenta `findStoresTool` agora consulta o Firebase. A busca por `productName` é feita comparando com `canonicalName` nos produtos. A lógica real de busca por proximidade com base no GPS do usuário ainda precisa ser implementada (atualmente, a ferramenta aceita coordenadas de localização do usuário para possível uso futuro e as registra, mas a busca não é filtrada/ordenada por proximidade).
- **Limites da API:** O uso das APIs de IA (Google AI) pode estar sujeito a cotas e limitações.
- **Tamanho da Imagem:** Atualmente, há um limite de 5MB para upload, o que é uma boa prática, mas deve ser comunicado claramente.
- **Performance:** O processamento de IA pode levar alguns segundos. A obtenção da localização GPS depende da resposta do usuário e do hardware/software. Consultas ao Firebase também adicionam latência. A nova página de monitoramento realiza múltiplas leituras para agregar dados, o que pode ser lento com grandes volumes de dados.
- **Gerenciamento de Erros:** Continuar refinando para cobrir mais casos de borda, especialmente com as interações com o Firebase.
- **Custo:** O uso de modelos de IA generativa e Firebase Realtime Database pode incorrer em custos. **É crucial que este projeto não gere custos significativos ou inesperados.**
- **Configuração de Ambiente na Vercel:** As variáveis de ambiente (`GEMINI_API_KEY`, `NEXT_PUBLIC_FIREBASE_*`) precisam ser configuradas no painel da Vercel. (Confirmado pelo usuário que estão configuradas).
- **Segurança do Firebase:** As regras de segurança do Firebase Realtime Database precisarão ser configuradas.
- **Autenticação de Usuários:** Essencial para funcionalidades de escrita no banco de dados (cadastro de lojas, produtos, preços, perfis de usuário) e potencialmente para acesso à página de monitoramento.
- **Privacidade do Usuário:** A solicitação e o uso da localização GPS do usuário devem ser feitos com consentimento claro e transparente, informando como os dados serão utilizados e armazenados.
- **Precisão da Geolocalização:** A precisão da localização GPS obtida do navegador pode variar dependendo do dispositivo e do ambiente. A localização de lojas dependerá da precisão dos dados inseridos.
- **Novo:** **Internacionalização da UI (i18n):** A tradução da interface do aplicativo para diferentes idiomas é uma tarefa complexa que vai além da tradução de dados de objetos já existentes.
- **Novo:** **Monitoramento e Moedas:** A página de monitoramento atualmente exibe o preço médio e a moeda conforme encontrada. Não realiza conversão de moeda, o que pode ser necessário para uma comparação precisa se várias moedas estiverem presentes para o mesmo produto em diferentes países.
- **Novo:** **Complexidade da Implementação de RAG Geospacial:** A introdução de um sistema RAG para proximidade geográfica adiciona complexidade significativa à arquitetura, envolvendo bancos de dados vetoriais, pipelines de embedding e sincronização de dados.

## 6. Próximos Passos

- **Autenticação e Gerenciamento de Perfis de Usuário:**
    - Implementar autenticação de usuários (ex: Firebase Authentication).
    - Desenvolver funcionalidades CRUD para `/userProfiles`, permitindo que usuários (após consentimento) salvem sua localização GPS e preferências de idioma.
- **Desenvolvimento do Catálogo de Produtos (Firebase):**
    - Implementar as funções CRUD para `/products`, `/stores`, e `/productAvailability` (incluindo `productUrl` e `coordinates` para lojas).
    - Desenvolver UI para visualização e gerenciamento desses dados (requer autenticação para escrita).
    - Implementar interface para cadastro/edição de coordenadas de lojas.
    - Integrar a busca de produtos na UI para consultar o Firebase.
    - **Novo:** Expandir o catálogo e a lógica de busca para suportar o rastreamento de preços de produtos brasileiros em lojas internacionais, incluindo a gestão de diferentes moedas e `countryCode` para lojas.
- **Integração dos Fluxos de IA com o Banco de Dados:**
    - Modificar `searchRelatedProducts` para tentar encontrar correspondências no catálogo de produtos do Firebase.
    - Permitir que `extractProductProperties` salve as propriedades extraídas para os produtos no Firebase.
    - **A ferramenta `findStoresTool` agora consulta o Firebase.** Melhorar a lógica de busca de produtos (ex: usando mais campos além de `canonicalName`, ou indexação). Implementar a lógica de busca por proximidade real usando as coordenadas do usuário e das lojas no Firebase (considerar arquitetura RAG geospacial para esta evolução).
    - Adicionar funcionalidade para sugerir a criação de novos produtos/lojas no banco se não existirem.
- **Implementação de RAG Geospacial para Otimização de Lojas (Visão de Longo Prazo):**
    - **Objetivo:** Melhorar a relevância e performance na busca por lojas, agrupando-as por proximidade geográfica e, potencialmente, otimizando o tráfego de dados.
    - **Componentes Potenciais:**
        -   Utilização de um banco de dados vetorial (ex: Pinecone, Weaviate, Elasticsearch com KNN, ou extensões de PostGIS com vetores) para armazenar embeddings geográficos das lojas.
        -   Processo para gerar embeddings a partir das coordenadas GPS das lojas.
        -   Modificar a `findStoresTool` (ou criar uma nova ferramenta/fluxo) para consultar este sistema RAG, utilizando a localização do usuário para recuperar as lojas mais próximas que vendem o produto desejado.
        -   Estratégias de atualização para manter os dados de proximidade e disponibilidade de produtos sincronizados entre o sistema RAG e o Firebase Realtime Database.
    - **Benefícios:**
        -   Respostas mais rápidas e relevantes para o usuário ao buscar lojas.
        -   Potencial para otimizar o tráfego de dados, priorizando informações de lojas próximas.
        -   Melhor experiência do usuário ao apresentar informações sempre atualizadas das lojas mais convenientes geograficamente.
- **Melhorias na UI/UX:**
    - O card para obter a localização do usuário agora é ocultado após a localização ser obtida com sucesso.
    - Permitir que o usuário clique em um produto para ver mais detalhes (combinando dados da IA e do Firebase, incluindo URLs de venda e histórico de preços).
    - Desenvolver interfaces (protegidas por autenticação) para gerenciamento de lojas e disponibilidade de produtos (CRUD), incluindo URLs de produtos em lojas específicas e preços.
    - Adicionar opções de filtragem ou ordenação nos resultados.
    - **Novo:** Adicionar navegação para a página de Monitoramento (`/monitoring`).
- **Página de Monitoramento:**
    - **Novo:** Refinar a lógica de agregação de preços na página de monitoramento, especialmente em relação ao tratamento de múltiplas moedas para o mesmo produto em um país. Considerar a implementação de conversão de moeda para uma moeda base de visualização.
    - **Novo:** Otimizar a busca de dados se o volume de produtos/lojas/disponibilidade crescer significativamente (e.g., paginação, filtros, ou agregação server-side).
- **Internacionalização (i18n) e Localização (L10n):**
    - **Novo:** Implementar um sistema de internacionalização (i18n) para toda a interface do usuário (ex: usando `next-intl` ou `react-i18next`). Isso vai além das traduções de dados de objetos já existentes.
    - **Novo:** Após a i18n da UI, desenvolver lógica para detectar o idioma do usuário (via localização GPS, configurações do navegador, ou preferência do perfil) e ajustar a interface. Permitir seleção manual de idioma.
- **Refinamento das Regras de Segurança do Firebase.**
- **Infraestrutura e Operações:**
    - Logging mais robusto.
- **Testes:**
    - Aumentar a cobertura de testes unitários para os fluxos de IA, incluindo o fluxo `findProductStoresFlow` e a ferramenta `findStoresTool` (especialmente após a conexão com o Firebase).
    - Adicionar testes para os serviços Firebase quando implementados.
    - Testar a lógica de geolocalização e busca de lojas próximas quando a ferramenta for completamente conectada ao DB com lógica de proximidade.
    - **Novo:** Testar funcionalidades de perfil de usuário e i18n da UI.
    - **Novo:** Adicionar testes para a página de monitoramento e sua lógica de agregação de dados.

## 7. Histórico de Configurações de Layout da UI (Tema Atual)

A configuração de layout e tema da UI é gerenciada principalmente através do arquivo `src/app/globals.css` e utiliza variáveis CSS HSL para o tema ShadCN/Tailwind.

**Cores Principais do Tema Atual (Modo Claro):**

- **Background (`--background`):** `257 27% 95%` (#F2F0F7 - Lavanda Claro)
- **Foreground (`--foreground`):** `257 15% 25%` (Lavanda Escuro/Cinza)
- **Card (`--card`):** `0 0% 100%` (Branco)
- **Card Foreground (`--card-foreground`):** `257 15% 25%`
- **Primary (`--primary`):** `260 58% 74%` (#9B7EDE - Violeta Suave)
- **Primary Foreground (`--primary-foreground`):** `0 0% 100%` (Branco)
- **Secondary (`--secondary`):** `260 40% 88%` (Violeta Suave Mais Claro)
- **Accent (`--accent`):** `160 49% 67%` (#7ED6BA - Ciano Suave)
- **Accent Foreground (`--accent-foreground`):** `160 40% 15%` (Verde Escuro/Teal)
- **Border (`--border`):** `257 20% 85%` (Borda Lavanda Sutil)
- **Input (`--input`):** `257 20% 92%` (Fundo de Input Lavanda Claro)
- **Ring (`--ring`):** `260 58% 65%` (Primário levemente mais escuro para anel de foco)

**Cores Principais do Tema Atual (Modo Escuro):**

- **Background (`--background`):** `260 15% 10%` (Violeta Escuro/Carvão)
- **Foreground (`--foreground`):** `260 20% 90%` (Texto Lavanda Claro)
- **Card (`--card`):** `260 15% 15%`
- **Primary (`--primary`):** `260 58% 74%` (#9B7EDE - Violeta Suave)
- **Accent (`--accent`):** `160 49% 67%` (#7ED6BA - Ciano Suave)

O layout geral da página principal (`src/app/page.tsx`) é centralizado, com um cabeçalho, uma área principal para upload e exibição de resultados, e um rodapé. Componentes ShadCN como Card, Accordion, Button, Progress, Badge, Input, Label, e Toast são utilizados para construir a interface. A fonte principal é Geist Sans. O rodapé agora informa que as traduções são fornecidas para: Espanhol, Francês, Alemão, Chinês (Simplificado), Japonês, Português (Brasil), Português (Portugal). A interface também inclui uma seção para o usuário permitir o acesso à sua localização GPS (que é ocultada após sucesso), e essa informação é agora utilizada na busca de lojas. Uma nova página de monitoramento foi adicionada em `/monitoring`.

## 8. Processo de Atualização e Manutenção

- **Nota Importante:** Sempre que for identificado um ponto final "." (marcando a conclusão de uma tarefa ou alteração significativa no projeto), o arquivo `memo.md` deve ser analisado e atualizado para refletir a realidade atual do projeto. Isso garante que o documento permaneça uma fonte de verdade relevante e atualizada.
- Dois pontos finais seguidos ".." significam que o sistema deve continuar o último passo (se estiver em andamento) ou iniciar o próximo passo na lista de tarefas.

