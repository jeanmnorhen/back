# Relatório do Projeto: Image Insight Explorer

## 1. Objetivos do Projeto

- Permitir que os usuários façam upload de imagens para análise.
- Identificar automaticamente objetos presentes nas imagens enviadas usando IA (Genkit).
- Traduzir os nomes dos objetos identificados para múltiplos idiomas.
- Fornecer uma lista de produtos relacionados aos objetos identificados.
- Extrair e exibir propriedades chave dos produtos relacionados.
- Permitir a busca por lojas que vendem um produto específico (usando IA e ferramentas).
- **Novo:** Permitir que o sistema utilize a localização GPS do usuário (com consentimento) para otimizar a busca por lojas.
- **Novo:** Permitir o cadastro de URLs de produtos em lojas específicas.
- Integrar com Firebase Realtime Database para:
    - Manter um catálogo de produtos com informações multilíngues.
    - Registrar lojas, incluindo sua localização geográfica.
    - Rastrear o histórico de preços dos produtos em diferentes lojas.
- Oferecer uma interface de usuário intuitiva e responsiva para facilitar a interação.

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
- **UC6: Gerenciamento de Dados de Produtos (Futuro, com Autenticação):**
    - Usuários autenticados (administradores) poderão adicionar/editar produtos, lojas e registrar preços.
- **UC7: Busca de Lojas para um Produto (IA com Ferramenta e DB):**
    - O usuário (ou sistema, após identificar um produto) pode solicitar a busca de lojas que vendem um produto específico.
    - O sistema (via IA e uma ferramenta `findStoresTool` conectada ao Firebase) retorna uma lista de lojas que vendem o produto. (UI parcialmente integrada para chamar o fluxo `findProductStoresFlow`)
    - **Novo:** Opcionalmente, se o usuário fornecer sua localização, o sistema pode priorizar lojas próximas.
- **UC8 (Novo): Cadastro de Informações de Lojas e Produtos:**
    - Usuários administradores (ou o sistema via IA no futuro, para sugestões) poderão cadastrar novas lojas, incluindo sua localização (coordenadas GPS), e os produtos que vendem com seus respectivos URLs de site de venda e preços.

## 3. Estado Atual

O aplicativo "Image Insight Explorer" está em um estágio funcional, implementado com as seguintes tecnologias:
- **Frontend:** Next.js (App Router), React, TypeScript.
- **UI Components:** ShadCN UI.
- **Estilização:** Tailwind CSS.
- **Funcionalidades AI:** Genkit, utilizando o modelo Gemini do Google AI.
    - `identifyObjects`: Identifica objetos na imagem e traduz seus nomes para Espanhol, Francês, Alemão, Chinês (Simplificado), Japonês, Português (Brasil) e Português (Portugal).
    - `searchRelatedProducts`: Busca produtos relacionados aos objetos (usando nomes em inglês).
    - `extractProductProperties`: Extrai propriedades dos produtos encontrados.
    - `findProductStoresFlow` (com `findStoresTool`): Busca lojas que vendem um produto específico (atualmente com dados simulados pela ferramenta, com planejamento para conectar ao Firebase). **Parcialmente integrado na UI.**
- **Testes:** Configuração de Jest para testes unitários, com testes iniciais para `identifyObjects` e `findProductStoresFlow`.
- **Banco de Dados:** Configuração inicial do Firebase Realtime Database (inicialização e definição da estrutura de dados).
- **Deployment:** Configurado para Vercel.

Principais funcionalidades implementadas:
- Upload de imagens (com validação de tipo e tamanho).
- Pré-visualização da imagem selecionada.
- Processamento de imagem em três etapas assíncronas com IA (identificação, busca de produtos, extração de propriedades).
- Exibição dos resultados da IA em seções distintas, incluindo traduções de objetos para Espanhol, Francês, Alemão, Chinês (Simplificado), Japonês, Português (Brasil) e Português (Portugal).
- **Novo:** Interface para acionar a busca de lojas para produtos relacionados e exibir os resultados (usando o fluxo `findProductStoresFlow` com dados simulados).
- Barra de progresso e mensagens de status durante a análise.
- Sistema de notificações (toast).
- Design responsivo e tema customizado.
- Configuração para deployment na Vercel (`vercel.json`).
- Configuração do Firebase (inicialização e variáveis de ambiente).

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
    - `countryCode`: "BR"
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

Esta estrutura visa balancear a normalização (evitando duplicação excessiva de dados) com a facilidade de consulta comum no Realtime Database (dados aninhados onde faz sentido para leitura).

## 5. Pontos de Atenção

- **Precisão da IA:** A qualidade dos resultados (objetos, traduções, produtos, propriedades, lojas) depende da precisão dos modelos Genkit e Gemini. Casos de ambiguidade ou imagens de baixa qualidade podem levar a resultados subótimos.
- **Dados Simulados para Ferramentas:** A ferramenta `findStoresTool` atualmente usa dados simulados. Para funcionalidade real, precisará ser conectada a um banco de dados de lojas ou API externa.
- **Limites da API:** O uso das APIs de IA (Google AI) pode estar sujeito a cotas e limitações.
- **Tamanho da Imagem:** Atualmente, há um limite de 5MB para upload, o que é uma boa prática, mas deve ser comunicado claramente.
- **Performance:** O processamento de IA pode levar alguns segundos.
- **Gerenciamento de Erros:** Continuar refinando para cobrir mais casos de borda.
- **Custo:** O uso de modelos de IA generativa e Firebase Realtime Database pode incorrer em custos. **É crucial que este projeto não gere custos significativos ou inesperados.**
- **Configuração de Ambiente na Vercel:** As variáveis de ambiente (`GEMINI_API_KEY`, `NEXT_PUBLIC_FIREBASE_*`) precisam ser configuradas no painel da Vercel. (Confirmado pelo usuário que estão configuradas).
- **Segurança do Firebase:** As regras de segurança do Firebase Realtime Database precisarão ser configuradas.
- **Autenticação de Usuários:** Essencial para funcionalidades de escrita no banco de dados (cadastro de lojas, produtos, preços).
- **Novo:** **Privacidade do Usuário:** A solicitação e o uso da localização GPS do usuário devem ser feitos com consentimento claro e transparente, informando como os dados serão utilizados.
- **Novo:** **Precisão da Geolocalização:** A precisão da localização GPS obtida do navegador pode variar dependendo do dispositivo e do ambiente. A localização de lojas dependerá da precisão dos dados inseridos.

## 6. Próximos Passos

- **Desenvolvimento do Catálogo de Produtos (Firebase):**
    - Implementar as funções CRUD para `/products`, `/stores`, e `/productAvailability` (incluindo `productUrl` e `coordinates` para lojas).
    - Desenvolver UI para visualização e gerenciamento desses dados (requer autenticação para escrita).
    - **Novo:** Implementar interface para cadastro/edição de coordenadas de lojas.
    - Integrar a busca de produtos na UI para consultar o Firebase.
- **Integração dos Fluxos de IA com o Banco de Dados:**
    - Modificar `searchRelatedProducts` para tentar encontrar correspondências no catálogo de produtos do Firebase.
    - Permitir que `extractProductProperties` salve as propriedades extraídas para os produtos no Firebase.
    - Conectar a ferramenta `findStoresTool` ao catálogo de `/stores` e `/productAvailability` do Firebase em vez de usar dados simulados. **Novo:** Incluir a capacidade de usar a localização GPS do usuário (se fornecida e consentida) para filtrar ou priorizar os resultados da busca por lojas.
    - Adicionar funcionalidade para sugerir a criação de novos produtos/lojas no banco se não existirem.
- **Melhorias na UI/UX:**
    - **(Em Andamento)** Integrar o fluxo `findProductStoresFlow` na UI. Por exemplo, ao exibir um produto, adicionar um botão "Encontrar Lojas" que chama este fluxo e exibe os resultados.
    - **Novo:** Implementar funcionalidade no frontend para solicitar e obter a localização GPS do usuário (com consentimento claro) para ser usada na busca por lojas.
    - **Novo:** Permitir que o usuário clique em um produto para ver mais detalhes (combinando dados da IA e do Firebase, incluindo URLs de venda e histórico de preços).
    - **Novo:** Desenvolver interfaces (protegidas por autenticação) para gerenciamento de lojas e disponibilidade de produtos (CRUD), incluindo URLs de produtos em lojas específicas e preços.
    - Adicionar opções de filtragem ou ordenação nos resultados.
    - Internacionalização completa da interface do usuário (além dos dados já traduzidos para Espanhol, Francês, Alemão, Chinês Simplificado, Japonês, Português (Brasil) e Português (Portugal)).
- **Autenticação e Autorização:**
    - Implementar autenticação de usuários Firebase para permitir o gerenciamento de dados (lojas, produtos, preços).
- **Refinamento das Regras de Segurança do Firebase.**
- **Infraestrutura e Operações:**
    - Logging mais robusto.
- **Testes:**
    - Aumentar a cobertura de testes unitários para os fluxos de IA, incluindo o novo fluxo `findProductStoresFlow` e a ferramenta `findStoresTool`.
    - Adicionar testes para os serviços Firebase quando implementados.
    - **Novo:** Testar a lógica de geolocalização e busca de lojas próximas.

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

O layout geral da página principal (`src/app/page.tsx`) é centralizado, com um cabeçalho, uma área principal para upload e exibição de resultados, e um rodapé. Componentes ShadCN como Card, Accordion, Button, Progress, Badge, Input, Label, e Toast são utilizados para construir a interface. A fonte principal é Geist Sans. O rodapé agora informa que as traduções são fornecidas para: Espanhol, Francês, Alemão, Chinês (Simplificado), Japonês, Português (Brasil), Português (Portugal).

## 8. Processo de Atualização e Manutenção

- **Nota Importante:** Sempre que for identificado um ponto final "." (marcando a conclusão de uma tarefa ou alteração significativa no projeto), o arquivo `memo.md` deve ser analisado e atualizado para refletir a realidade atual do projeto. Isso garante que o documento permaneça uma fonte de verdade relevante e atualizada.
- **Novo:** Dois pontos finais seguidos ".." significam que o sistema deve continuar o último passo (se estiver em andamento) ou iniciar o próximo passo na lista de tarefas.

