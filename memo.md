# Relatório do Projeto: Image Insight Explorer

## 1. Objetivos do Projeto

- Permitir que os usuários façam upload de imagens para análise.
- Identificar automaticamente objetos presentes nas imagens enviadas usando IA (Genkit).
- Fornecer uma lista de produtos relacionados aos objetos identificados.
- Extrair e exibir propriedades chave dos produtos relacionados.
- Oferecer uma interface de usuário intuitiva e responsiva para facilitar a interação.

## 2. Casos de Uso

- **UC1: Análise de Imagem Simples:**
    - O usuário seleciona uma imagem do seu dispositivo.
    - O usuário faz o upload da imagem.
    - O sistema exibe os objetos identificados na imagem e suas traduções.
- **UC2: Descoberta de Produtos Relacionados:**
    - Após a identificação de objetos (UC1), o sistema busca e exibe produtos comercialmente disponíveis que são relevantes para os objetos identificados.
- **UC3: Extração de Propriedades de Produtos:**
    - Para os produtos encontrados (UC2), o sistema extrai e apresenta características importantes (ex: cor, material, marca).
- **UC4: Feedback Visual do Processamento:**
    - O usuário visualiza o progresso da análise da imagem em etapas (identificação, busca de produtos, extração de propriedades).
    - O usuário recebe notificações (toasts) sobre o status de cada etapa e erros, se houver.

## 3. Estado Atual

O aplicativo "Image Insight Explorer" está em um estágio funcional, implementado com as seguintes tecnologias:
- **Frontend:** Next.js (App Router), React, TypeScript.
- **UI Components:** ShadCN UI.
- **Estilização:** Tailwind CSS.
- **Funcionalidades AI:** Genkit, utilizando o modelo Gemini do Google AI.
- **Tradução:** Objetos identificados são traduzidos para Espanhol, Francês, Alemão, Chinês (Simplificado) e Japonês.
- **Testes:** Configuração inicial de Jest para testes unitários dos fluxos de AI.

Principais funcionalidades implementadas:
- Upload de imagens (com validação de tipo e tamanho).
- Pré-visualização da imagem selecionada.
- Processamento de imagem em três etapas assíncronas:
    1. `identifyObjects`: Identifica objetos na imagem e traduz seus nomes.
    2. `searchRelatedProducts`: Busca produtos relacionados aos objetos (usando nomes em inglês).
    3. `extractProductProperties`: Extrai propriedades dos produtos encontrados.
- Exibição dos resultados em seções distintas (Objetos Identificados e Traduções, Produtos Relacionados, Propriedades dos Produtos) usando componentes Accordion.
- Barra de progresso e mensagens de status durante a análise.
- Sistema de notificações (toast) para feedback ao usuário.
- Design responsivo e tema customizado (claro e escuro).
- Configuração para deployment na Vercel (`vercel.json`).

## 4. Pontos de Atenção

- **Precisão da IA:** A qualidade dos resultados (objetos, traduções, produtos, propriedades) depende da precisão dos modelos Genkit e Gemini. Casos de ambiguidade ou imagens de baixa qualidade podem levar a resultados subótimos.
- **Limites da API:** O uso das APIs de IA (Google AI) pode estar sujeito a cotas e limitações.
- **Tamanho da Imagem:** Atualmente, há um limite de 5MB para upload, o que é uma boa prática, mas deve ser comunicado claramente.
- **Performance:** O processamento de IA, especialmente com traduções, pode levar alguns segundos. A experiência do usuário durante o carregamento é crucial e foi parcialmente endereçada com a barra de progresso e etapas.
- **Gerenciamento de Erros:** Embora haja tratamento de erros, é importante continuar refinando para cobrir mais casos de borda. Erros genéricos em produção na Vercel frequentemente se devem a variáveis de ambiente ausentes (ex: `GEMINI_API_KEY`).
- **Custo:** O uso de modelos de IA generativa pode incorrer em custos, dependendo do volume de uso. **É crucial que este projeto não gere custos significativos ou inesperados.**
- **Não gerar custo:** Este projeto tem como premissa fundamental não gerar custos operacionais. Todas as escolhas de tecnologia e arquitetura devem levar essa restrição em consideração.
- **Configuração de Ambiente na Vercel:** As variáveis de ambiente (especialmente `GEMINI_API_KEY` para as funcionalidades de IA, e `NEXT_PUBLIC_FIREBASE_*` para Firebase) precisam ser configuradas no painel da Vercel para o deploy funcionar corretamente. A ausência do `GEMINI_API_KEY` é uma causa comum de erros de renderização de Server Components em produção.

## 5. Próximos Passos

- **Melhorias na UI/UX:**
    - Permitir que o usuário clique em um produto para ver mais detalhes (simulando uma página de produto ou link externo).
    - Adicionar opções de filtragem ou ordenação para os resultados.
    - Internacionalização da interface do usuário (além das traduções dos objetos).
- **Funcionalidades Adicionais de IA:**
    - Permitir que o usuário refine a busca de produtos com texto adicional.
    - Explorar a geração de descrições criativas para os cenários da imagem.
    - Implementar edição de imagem básica ou sugestões de melhoria baseadas em IA.
- **Infraestrutura e Operações:**
    - **Deployment na Vercel:** Configuração de variáveis de ambiente na Vercel é crucial.
    - Implementar logging mais robusto para monitoramento e depuração.
    - Considerar otimizações de custo para as chamadas de IA (reiterando a importância de não gerar custo).
    - Autenticação de usuários para salvar históricos de análise (se aplicável).
- **Testes:**
    - **Aumentar a cobertura de testes unitários e de integração (Jest configurado e primeiro teste de fluxo de IA adicionado).**
    - Realizar testes de usabilidade com usuários finais.

## 6. Histórico de Configurações de Layout da UI (Tema Atual)

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

O layout geral da página principal (`src/app/page.tsx`) é centralizado, com um cabeçalho, uma área principal para upload e exibição de resultados, e um rodapé. Componentes ShadCN como Card, Accordion, Button, Progress, Badge, Input, Label, e Toast são utilizados para construir a interface. A fonte principal é Geist Sans.

## 7. Processo de Atualização e Manutenção

- **Nota Importante:** Sempre que for identificado um ponto final "." (marcando a conclusão de uma tarefa ou alteração significativa no projeto), o arquivo `memo.md` deve ser analisado e atualizado para refletir a realidade atual do projeto. Isso garante que o documento permaneça uma fonte de verdade relevante e atualizada.
