# Drogaria Bem Melhor — arquivos para hospedagem

Projeto desenvolvido pela GH INOVAX. Loja, administração, checkout, contas e entregas com dados persistentes.

## O que há neste pacote

- `public/`: loja já compilada, CSS, JavaScript, logo, imagens e ícone.
- `server.mjs`: servidor independente, API e autenticação por e-mail e senha.
- `schema.sql`: estrutura do banco SQLite.
- `catalog.json`: catálogo ilustrativo para a primeira instalação.
- `reset-password.mjs`: recuperação de acesso pelo responsável pela hospedagem.
- `test.mjs`: verificação funcional automatizada com banco temporário.
- `codigo-fonte/`: componentes React, estilos e configuração para editar no VS Code e gerar uma nova versão da loja.

## Tipo de hospedagem necessário

**Node.js 24 ou superior**, com armazenamento persistente e permissão de escrita para banco e uploads. O servidor utiliza o módulo `node:sqlite` do próprio Node.js e não depende de serviço de banco externo.

Não funciona como simples envio de HTML por FTP. Hospedagem que oferece apenas PHP/cPanel sem Node.js precisa de adaptação. A versão deve ser instalada na raiz do domínio (ex.: `https://sua-drogaria.com.br`), não em uma subpasta.

Em hospedagem com disco descartável, associe `DATA_DIR` a um volume persistente. Use uma instância do servidor por banco SQLite; esta edição não foi projetada para várias réplicas simultâneas compartilhando arquivos.

## Instalação

1. Envie os arquivos deste pacote para a pasta da aplicação Node.js.
2. Selecione Node.js 24 ou superior.
3. Configure as variáveis na área de ambiente da hospedagem:

| Variável | Conteúdo |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | Porta fornecida pela hospedagem; padrão `3000` |
| `PUBLIC_ORIGIN` | Origem exata com HTTPS, sem barra final: `https://seu-dominio.com.br` |
| `DATA_DIR` | Pasta ou volume persistente para banco e uploads |
| `ADMIN_EMAIL` | E-mail do proprietário, definido por você |
| `ADMIN_PASSWORD` | Senha forte, exclusiva, entre 12 e 128 caracteres, definida por você |

4. Configure HTTPS e o proxy do domínio para a porta da aplicação.
5. Inicie com `npm start` ou `node server.mjs`.
6. Abra o domínio. Para administrar, acesse `/admin` e entre com o e-mail e a senha definidos.

O proprietário é criado no primeiro início do servidor. **Nenhuma senha padrão foi colocada no código.** Depois da criação do proprietário, mudar `ADMIN_PASSWORD` no ambiente não altera a senha existente; utilize o procedimento de recuperação abaixo.

O diretório servido ao navegador é somente `public/`. Banco de dados, senhas, código do servidor e uploads originais não devem ser expostos como arquivos públicos. Não configure o servidor web para servir a pasta inteira da aplicação.

### Testar no computador

Copie `.env.example` para `.env`, preencha o administrador, mantenha `NODE_ENV=development` e `PUBLIC_ORIGIN=http://localhost:3000`. Abra um terminal na pasta e execute `node server.mjs`. Visite `http://localhost:3000`.

Para rodar os testes: `npm test`. Eles criam um banco separado e temporário, sem alterar o banco da drogaria.

## Páginas incluídas

- `/` — página inicial com banners rotativos.
- `/catalogo` — categorias, busca e ordenação.
- `/ofertas` — ofertas.
- `/emagrecimento-saudavel` — seleção de produtos de emagrecimento e bem-estar.
- `/produto/ID` — detalhes de produto.
- `/carrinho` — sacola e quantidades.
- `/checkout` — retirada ou entrega e confirmação do pedido.
- `/entrar` — entrada e cadastro de clientes.
- `/conta` — histórico e acompanhamento de pedidos.
- `/pedido/ID` — confirmação e detalhes.
- `/atendimento`, `/sobre`, `/privacidade` — informações da drogaria.
- `/admin` — painel administrativo.
- `/admin/produtos` — cadastro com upload de fotos do computador.
- `/admin/usuarios` — usuários secundários, funções, bloqueio e exclusão de acesso.
- `/admin/entregadores` — equipe de entregas.
- `/admin/pedidos` — separação, status e atribuição de entregador.
- `/admin/estoque` — quantidades, lotes e validade.
- `/admin/relatorios` — recebimentos manuais e exportação CSV.
- `/admin/configuracoes` — contato, endereço, frete, pedido mínimo e banners.
- `/entregador` — entregas atribuídas e confirmação por código do cliente.

## Administração e funcionamento

O proprietário gerencia acessos. Gerente, atendente, estoquista, farmacêutico e entregador têm permissões específicas verificadas no servidor. O usuário secundário usa e-mail e senha individuais. Exclusão de acesso da equipe preserva pedidos e registros operacionais; a conta pode continuar existindo como conta de cliente, sem permissões da equipe.

Os produtos podem receber várias imagens JPG, PNG e WebP, até 5 MB cada. Os banners aceitam imagens e vídeos MP4 até 20 MB. Vídeos devem ser curtos, adequados para reprodução sem som e otimizados para celular. Arquivos de mídia são gravados na pasta de dados.

Pedidos são calculados no servidor, com estoque conferido na confirmação. A compra reduz o estoque; cancelamento devolve as unidades uma vez. O cliente só vê seus pedidos. O entregador só vê as entregas atribuídas e não recebe o código de confirmação na API; deve solicitar o código ao destinatário.

O pagamento é combinado no recebimento: Pix, cartão na entrega ou dinheiro. **Não há processamento de pagamentos online, geração automática de QR Pix, emissão fiscal, integração com ERP, SMS, envio automático de WhatsApp, cálculo de frete por quilômetros ou rastreamento GPS em tempo real.** O administrador registra manualmente o recebimento. O botão WhatsApp abre uma conversa que precisa ser enviada pelo usuário.

O frete desta versão é uma taxa fixa configurável. A entrega começa desabilitada; habilite depois de definir e conferir sua área de atendimento. O endereço de entrega é confirmado pela equipe. O mapa abre o endereço para consulta, sem garantir distância ou prazo.

Medicamentos ficam em atendimento direto com a drogaria e não são finalizados no checkout. A drogaria deve revisar catálogo, dados comerciais, informações do responsável técnico e documentos de atendimento e privacidade antes de abrir ao público. O texto de privacidade incluído é inicial e precisa dessa revisão.

## Antes de começar a receber pedidos reais

1. Acesse Configurações e confira WhatsApp, endereço, Instagram e horários.
2. Substitua o catálogo demonstrativo por produtos reais, imagens corretas e preços válidos.
3. Configure retirada, pedido mínimo e, se desejar, taxa de entrega.
4. Cadastre a equipe com senhas exclusivas.
5. Faça um pedido de teste e acompanhe o fluxo até o encerramento.
6. Revise as informações da drogaria e os textos de atendimento e privacidade.
7. Desmarque “Ambiente de demonstração” em Configurações quando a operação estiver pronta.

## Editar no VS Code

O site já vem compilado e pode ser hospedado sem instalar dependências de desenvolvimento.

Para editar a interface:

1. Abra `codigo-fonte/` no VS Code.
2. Execute `npm install`.
3. Edite `app/store.tsx`, `app/globals.css` e `lib/catalog.ts`.
4. Execute `npm run build`.
5. O resultado é gravado em `codigo-fonte/standalone/public/`.
6. Substitua a pasta `public/` da hospedagem por esse resultado, preservando `server.mjs`, o banco e a pasta de dados.

Para alterar regras do servidor, edite `server.mjs` e reinicie a aplicação. O catálogo inicial só é utilizado quando o banco é criado; mudanças em `catalog.json` não substituem produtos já salvos. Depois da instalação, administre o catálogo pelo painel.

## Backup e recuperação

Faça backup de toda a pasta `DATA_DIR`, incluindo banco, arquivos WAL/SHM quando presentes e uploads. Para uma cópia simples consistente, pare o servidor, copie a pasta inteira e reinicie. Teste a restauração em uma pasta separada. Não apague a pasta de dados ao publicar uma atualização.

Para redefinir uma senha, configure temporariamente a variável `NEW_PASSWORD` com uma senha forte no ambiente do terminal e execute:

```text
node reset-password.mjs email-do-usuario@exemplo.com
```

Remova `NEW_PASSWORD` depois. O script atualiza a senha e encerra as sessões antigas sem imprimir a senha. Não compartilhe `.env`, banco de dados ou credenciais com o público.

## Verificações realizadas

Compilação da interface e verificação TypeScript. Testes da API de cadastro, login, permissões, upload, confirmação de pedido, cálculo no servidor, disputa por estoque, cancelamento sem reposição duplicada, código de entrega, bloqueio de acesso e proteção de origem. Navegação da loja, inclusão na sacola e checkout conferidos no navegador.

Esta versão independente usa SQLite e arquivos em disco. A prévia criada no ChatGPT usa infraestrutura e autenticação próprias da plataforma; o pacote de hospedagem é independente dessa autenticação.

## Seção Emagrecimento saudável

O destaque aparece na página inicial e possui uma página própria com busca e ordenação. Para publicar, acesse Produtos, cadastre ou edite um item e marque **Exibir em Emagrecimento saudável**. Também é possível selecionar a categoria **Emagrecimento saudável**, que inclui o produto automaticamente na seção. As imagens continuam sendo enviadas pelo computador. Apenas produtos ativos aparecem para os clientes.

Em Configurações, o proprietário pode habilitar ou ocultar o destaque da página inicial. A página da seleção continua acessível no menu. Para retirar um produto desta seleção, desmarque a opção e, se necessário, mude sua categoria.

Medicamentos devem permanecer em atendimento direto com o farmacêutico, sem finalização pelo checkout. Revise a descrição e a classificação de cada produto antes da publicação. A seção inicia sem produtos de exemplo para não atribuir finalidade de emagrecimento a itens de outras categorias.
