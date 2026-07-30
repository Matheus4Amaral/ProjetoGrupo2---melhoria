const apiError = (message, code) => ({ message, code });

const namedExamples = (entries) =>
  Object.fromEntries(
    entries.map(([name, summary, value]) => [
      name,
      {
        summary,
        value,
      },
    ]),
  );

const validationExamples = (path, method) => {
  if (path === '/api/auth/register') {
    return namedExamples([
      [
        'invalidCep',
        'CEP inválido',
        apiError('CEP inválido. Informe um CEP com 8 dígitos.', 'INVALID_CEP'),
      ],
      [
        'invalidEmail',
        'E-mail inválido',
        apiError('Formato de e-mail inválido.', 'INVALID_EMAIL'),
      ],
      [
        'invalidPassword',
        'Senha inválida',
        apiError(
          'A senha é obrigatória e deve ter no mínimo 6 caracteres.',
          'INVALID_PASSWORD',
        ),
      ],
    ]);
  }

  if (path === '/api/auth/login') {
    return namedExamples([
      [
        'emailRequired',
        'E-mail obrigatório',
        apiError('O e-mail é obrigatório.', 'INVALID_EMAIL'),
      ],
      [
        'passwordRequired',
        'Senha obrigatória',
        apiError('A senha é obrigatória.', 'INVALID_PASSWORD'),
      ],
    ]);
  }

  if (path === '/api/auth/forgot-password') {
    return namedExamples([
      [
        'emailRequired',
        'E-mail obrigatório',
        apiError('O e-mail é obrigatório.', 'INVALID_EMAIL'),
      ],
    ]);
  }

  if (path === '/api/perfil/change-password') {
    return namedExamples([
      [
        'passwordRequired',
        'Senhas obrigatórias',
        apiError(
          'Senha atual e nova senha são obrigatórias.',
          'INVALID_PASSWORD',
        ),
      ],
      [
        'samePassword',
        'Nova senha repetida',
        apiError(
          'A nova senha não pode ser igual à senha atual.',
          'INVALID_PASSWORD',
        ),
      ],
    ]);
  }

  if (path === '/api/dashboard/replacement') {
    return namedExamples([
      [
        'replacementDataRequired',
        'Dados de reposição obrigatórios',
        apiError('Informe os dados da reposição.', 'VALIDATION_ERROR'),
      ],
    ]);
  }

  if (path === '/api/products/search/nome') {
    return namedExamples([
      [
        'productNameRequired',
        'Nome obrigatório',
        apiError('Nome do produto é obrigatório.', 'VALIDATION_ERROR'),
      ],
    ]);
  }

  if (path.startsWith('/api/products')) {
    return namedExamples([
      [
        'invalidProduct',
        'Dados do produto inválidos',
        apiError('Os dados do produto são inválidos.', 'VALIDATION_ERROR'),
      ],
    ]);
  }

  if (path === '/api/stock/status/{status}') {
    return namedExamples([
      [
        'invalidStockStatus',
        'Status inválido',
        apiError(
          'Status inválido. Use: critico, alerta ou regular.',
          'VALIDATION_ERROR',
        ),
      ],
    ]);
  }

  if (path.includes('/api/stock/') && path.includes('/produtos')) {
    return namedExamples([
      [
        'invalidStockQuantity',
        'Quantidade inválida',
        apiError('As quantidades não podem ser negativas.', 'INVALID_QUANTITY'),
      ],
    ]);
  }

  if (path.startsWith('/api/stock')) {
    return namedExamples([
      [
        'invalidStock',
        'Dados do estoque inválidos',
        apiError('Os dados do estoque são inválidos.', 'VALIDATION_ERROR'),
      ],
    ]);
  }

  if (path.includes('/api/sales/') && path.includes('/produto')) {
    return namedExamples([
      [
        'invalidSaleQuantity',
        'Quantidade inválida',
        apiError('Quantidade deve ser maior que zero.', 'INVALID_QUANTITY'),
      ],
    ]);
  }

  if (path.startsWith('/api/sales')) {
    return namedExamples([
      [
        'invalidSale',
        'Dados da venda inválidos',
        apiError('Os dados da venda são inválidos.', 'VALIDATION_ERROR'),
      ],
    ]);
  }

  if (path.startsWith('/api/supplier')) {
    return namedExamples([
      [
        'invalidSupplier',
        'Dados do fornecedor inválidos',
        apiError('Os dados do fornecedor são inválidos.', 'VALIDATION_ERROR'),
      ],
    ]);
  }

  if (path === '/api/perfil/update-user' && method === 'put') {
    return namedExamples([
      [
        'invalidProfile',
        'Dados do perfil inválidos',
        apiError('Os dados do perfil são inválidos.', 'VALIDATION_ERROR'),
      ],
    ]);
  }

  return namedExamples([
    [
      'validationError',
      'Dados inválidos',
      apiError('Os dados informados são inválidos.', 'VALIDATION_ERROR'),
    ],
  ]);
};

const unauthorizedExamples = (path) => {
  if (path === '/api/auth/login') {
    return namedExamples([
      [
        'invalidCredentials',
        'Credenciais inválidas',
        apiError('E-mail ou senha inválidos.', 'INVALID_CREDENTIALS'),
      ],
    ]);
  }

  const entries = [
    [
      'authRequired',
      'Token não fornecido',
      apiError('Token não fornecido ou mal formatado.', 'AUTH_REQUIRED'),
    ],
    [
      'invalidToken',
      'Token inválido',
      apiError('Token inválido ou expirado.', 'INVALID_TOKEN'),
    ],
  ];

  if (path === '/api/perfil/change-password') {
    entries.push([
      'invalidCurrentPassword',
      'Senha atual incorreta',
      apiError('Senha atual incorreta.', 'INVALID_CREDENTIALS'),
    ]);
  }

  return namedExamples(entries);
};

const notFoundExamples = (path) => {
  if (path === '/api/dashboard/replacement') {
    return namedExamples([
      [
        'stockProductRelationNotFound',
        'Relação não encontrada',
        apiError(
          'Relação produto/estoque não encontrada para este usuário.',
          'STOCK_NOT_FOUND',
        ),
      ],
    ]);
  }

  if (path.startsWith('/api/products')) {
    return namedExamples([
      [
        'productNotFound',
        'Produto não encontrado',
        apiError('Produto não encontrado.', 'PRODUCT_NOT_FOUND'),
      ],
    ]);
  }

  if (path.startsWith('/api/supplier')) {
    return namedExamples([
      [
        'supplierNotFound',
        'Fornecedor não encontrado',
        apiError('Fornecedor não encontrado.', 'SUPPLIER_NOT_FOUND'),
      ],
    ]);
  }

  if (path.startsWith('/api/sales')) {
    const productRoute = path.includes('/produto');
    return namedExamples([
      productRoute
        ? [
            'saleProductNotFound',
            'Produto não encontrado na venda',
            apiError(
              'Produto não encontrado nesta venda.',
              'PRODUCT_NOT_FOUND',
            ),
          ]
        : [
            'saleNotFound',
            'Venda não encontrada',
            apiError('Venda não encontrada.', 'SALE_NOT_FOUND'),
          ],
    ]);
  }

  if (path.startsWith('/api/stock')) {
    const productRoute = path.includes('/produtos');
    return namedExamples([
      productRoute
        ? [
            'stockProductNotFound',
            'Produto não encontrado no estoque',
            apiError(
              'Produto não encontrado neste estoque.',
              'PRODUCT_NOT_FOUND',
            ),
          ]
        : [
            'stockNotFound',
            'Estoque não encontrado',
            apiError('Estoque não encontrado.', 'STOCK_NOT_FOUND'),
          ],
    ]);
  }

  if (path.startsWith('/api/perfil') || path.includes('/api/auth/user')) {
    return namedExamples([
      [
        'userNotFound',
        'Usuário não encontrado',
        apiError('Usuário não encontrado.', 'USER_NOT_FOUND'),
      ],
    ]);
  }

  return namedExamples([
    [
      'resourceNotFound',
      'Recurso não encontrado',
      apiError('Recurso não encontrado.', 'RESOURCE_NOT_FOUND'),
    ],
  ]);
};

const conflictExamples = (path) => {
  if (path === '/api/auth/register') {
    return namedExamples([
      [
        'userAlreadyExists',
        'Usuário duplicado',
        apiError(
          'Já existe um usuário cadastrado com este e-mail.',
          'USER_ALREADY_EXISTS',
        ),
      ],
    ]);
  }

  if (path.startsWith('/api/supplier')) {
    return namedExamples([
      [
        'supplierAlreadyExists',
        'Fornecedor duplicado',
        apiError('Fornecedor já existe.', 'SUPPLIER_ALREADY_EXISTS'),
      ],
    ]);
  }

  if (path.includes('/produto')) {
    return namedExamples([
      [
        'productAlreadyExists',
        'Produto duplicado',
        apiError(
          'Produto já existe nesta relação.',
          'PRODUCT_ALREADY_EXISTS',
        ),
      ],
    ]);
  }

  return namedExamples([
    [
      'resourceAlreadyExists',
      'Recurso duplicado',
      apiError('O recurso já existe.', 'RESOURCE_ALREADY_EXISTS'),
    ],
  ]);
};

const examplesForResponse = (path, method, status) => {
  if (status === '400') return validationExamples(path, method);
  if (status === '401') return unauthorizedExamples(path);
  if (status === '403') {
    return namedExamples([
      [
        'forbidden',
        'Acesso não permitido',
        apiError(
          'Você não tem permissão para acessar este recurso.',
          'FORBIDDEN',
        ),
      ],
    ]);
  }
  if (status === '404') return notFoundExamples(path);
  if (status === '409') return conflictExamples(path);

  return namedExamples([
    [
      'internalError',
      'Falha inesperada',
      apiError('Não foi possível concluir a operação.', 'INTERNAL_ERROR'),
    ],
  ]);
};

const resolveResponse = (specification, response) => {
  if (!response?.$ref) return structuredClone(response);

  const responseName = response.$ref.split('/').at(-1);
  return structuredClone(specification.components.responses[responseName]);
};

export const applyContextualErrorExamples = (specification) => {
  const httpMethods = new Set(['get', 'post', 'put', 'patch', 'delete']);

  for (const [path, pathItem] of Object.entries(specification.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!httpMethods.has(method) || !operation.responses) continue;

      for (const [status, response] of Object.entries(operation.responses)) {
        if (!/^[45]\d\d$/.test(status)) continue;

        const resolvedResponse = resolveResponse(specification, response);
        resolvedResponse.content = {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            examples: examplesForResponse(path, method, status),
          },
        };
        operation.responses[status] = resolvedResponse;
      }
    }
  }

  return specification;
};
