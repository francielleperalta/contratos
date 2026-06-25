# Site de contratos editável

Projeto estático pronto para subir no GitHub Pages ou Firebase Hosting.

## O que já vem pronto
- Base inicial extraída da planilha <File>Contratações SGI - 2026.xlsx</File>
- 207 registros consolidados em `contratos.json`
- Lista com busca, filtros e KPIs
- Edição, inclusão e exclusão de contratos
- Persistência local no navegador (`localStorage`)
- Exportação e importação de JSON para salvar as alterações

## Estrutura
- `index.html` — tela principal
- `styles.css` — estilo
- `app.js` — lógica
- `contratos.json` — dados iniciais

## Como publicar no GitHub Pages
1. Crie um repositório.
2. Envie os 4 arquivos.
3. Em **Settings > Pages**, escolha a branch `main` e pasta `/root`.
4. Abra a URL do GitHub Pages.

## Como editar contratos
- Clique em **Editar** em qualquer linha.
- Altere os campos e salve.
- Para manter as edições, use **Exportar JSON**.
- Para restaurar em outro computador, use **Importar JSON**.

## Observação
A base original possui abas com colunas e formatos diferentes (incluindo datas em número do Excel e datas em texto como “vencimento 04/07/2026”), por isso o projeto já normaliza e centraliza os principais campos. Alguns contratos continuam sem data final quando a planilha não informa vigência clara.
