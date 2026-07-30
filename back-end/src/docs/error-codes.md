# Códigos de erro da API

Todas as respostas de erro mantêm `message` no nível superior e incluem um
`code` estável em `UPPER_SNAKE_CASE`. Detalhes técnicos ficam apenas nos logs.

| Código | Uso |
| --- | --- |
| `AUTH_REQUIRED` | Token Bearer ausente ou mal formatado |
| `INVALID_TOKEN` | Token inválido, expirado ou ainda não válido |
| `INVALID_CREDENTIALS` | Credenciais de login inválidas |
| `FORBIDDEN` | Usuário autenticado sem permissão |
| `INVALID_CEP` | CEP que não possui oito dígitos após normalização |
| `INVALID_EMAIL` | E-mail ausente ou em formato inválido |
| `INVALID_PASSWORD` | Senha ausente ou inválida |
| `INVALID_QUANTITY` | Quantidade ausente, negativa ou inválida |
| `VALIDATION_ERROR` | Outra falha de validação da requisição |
| `INVALID_REQUEST` | Falha de requisição que não possui código mais específico |
| `INVALID_JSON` | Corpo JSON malformado |
| `USER_ALREADY_EXISTS` | Usuário duplicado |
| `SUPPLIER_ALREADY_EXISTS` | Fornecedor duplicado |
| `PRODUCT_ALREADY_EXISTS` | Produto duplicado na relação solicitada |
| `RESOURCE_ALREADY_EXISTS` | Outro conflito de recurso duplicado |
| `USER_NOT_FOUND` | Usuário não encontrado |
| `SUPPLIER_NOT_FOUND` | Fornecedor não encontrado |
| `PRODUCT_NOT_FOUND` | Produto não encontrado |
| `STOCK_NOT_FOUND` | Estoque não encontrado |
| `SALE_NOT_FOUND` | Venda não encontrada |
| `RESOURCE_NOT_FOUND` | Outro recurso não encontrado |
| `ROUTE_NOT_FOUND` | Método e caminho não registrados |
| `INTERNAL_ERROR` | Falha inesperada, sem detalhe técnico público |
