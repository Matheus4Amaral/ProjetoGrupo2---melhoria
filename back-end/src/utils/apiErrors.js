export const ERROR_CODES = Object.freeze({
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_CEP: 'INVALID_CEP',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_JSON: 'INVALID_JSON',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_QUANTITY: 'INVALID_QUANTITY',
  INVALID_REQUEST: 'INVALID_REQUEST',
  INVALID_TOKEN: 'INVALID_TOKEN',
  PRODUCT_ALREADY_EXISTS: 'PRODUCT_ALREADY_EXISTS',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  SALE_NOT_FOUND: 'SALE_NOT_FOUND',
  STOCK_NOT_FOUND: 'STOCK_NOT_FOUND',
  SUPPLIER_ALREADY_EXISTS: 'SUPPLIER_ALREADY_EXISTS',
  SUPPLIER_NOT_FOUND: 'SUPPLIER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
});

const CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const inferErrorCode = (status, message = '') => {
  const normalizedMessage = normalizeText(message);

  if (normalizedMessage.includes('cep')) return ERROR_CODES.INVALID_CEP;

  if (status === 401) {
    if (
      normalizedMessage.includes('senha incorreta') ||
      normalizedMessage.includes('usuario nao encontrado')
    ) {
      return ERROR_CODES.INVALID_CREDENTIALS;
    }

    if (
      normalizedMessage.includes('token invalido') ||
      normalizedMessage.includes('token mal formatado') ||
      normalizedMessage.includes('token expirado')
    ) {
      return ERROR_CODES.INVALID_TOKEN;
    }

    return ERROR_CODES.AUTH_REQUIRED;
  }

  if (status === 403) return ERROR_CODES.FORBIDDEN;

  if (status === 404) {
    if (normalizedMessage.includes('produto')) return ERROR_CODES.PRODUCT_NOT_FOUND;
    if (normalizedMessage.includes('estoque')) return ERROR_CODES.STOCK_NOT_FOUND;
    if (normalizedMessage.includes('fornecedor')) return ERROR_CODES.SUPPLIER_NOT_FOUND;
    if (normalizedMessage.includes('venda')) return ERROR_CODES.SALE_NOT_FOUND;
    if (normalizedMessage.includes('usuario')) return ERROR_CODES.USER_NOT_FOUND;
    return ERROR_CODES.RESOURCE_NOT_FOUND;
  }

  if (status === 409) {
    if (normalizedMessage.includes('usuario')) return ERROR_CODES.USER_ALREADY_EXISTS;
    if (normalizedMessage.includes('fornecedor')) return ERROR_CODES.SUPPLIER_ALREADY_EXISTS;
    if (normalizedMessage.includes('produto')) return ERROR_CODES.PRODUCT_ALREADY_EXISTS;
    return ERROR_CODES.RESOURCE_ALREADY_EXISTS;
  }

  if (status >= 500) return ERROR_CODES.INTERNAL_ERROR;

  if (normalizedMessage.includes('email')) return ERROR_CODES.INVALID_EMAIL;
  if (normalizedMessage.includes('senha')) return ERROR_CODES.INVALID_PASSWORD;
  if (normalizedMessage.includes('quantidade')) return ERROR_CODES.INVALID_QUANTITY;
  if (status === 400) return ERROR_CODES.VALIDATION_ERROR;

  return ERROR_CODES.INVALID_REQUEST;
};

const defaultMessageForStatus = (status) => {
  if (status === 400) return 'Dados inválidos.';
  if (status === 401) return 'Autenticação necessária.';
  if (status === 403) return 'Você não tem permissão para acessar este recurso.';
  if (status === 404) return 'Recurso não encontrado.';
  if (status === 409) return 'A operação conflita com o estado atual do recurso.';
  return 'Não foi possível concluir a operação.';
};

export const normalizeErrorPayload = (status, payload) => {
  const source =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? payload
      : { message: typeof payload === 'string' ? payload : undefined };

  const message =
    typeof source.message === 'string' && source.message.trim()
      ? source.message
      : defaultMessageForStatus(status);

  const code =
    typeof source.code === 'string' && CODE_PATTERN.test(source.code)
      ? source.code
      : inferErrorCode(status, message);

  const normalizedPayload = { ...source, message, code };
  delete normalizedPayload.error;
  delete normalizedPayload.stack;

  return normalizedPayload;
};

export const normalizeErrorResponses = (_req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    if (res.statusCode < 400) {
      return originalJson(payload);
    }

    if (
      res.statusCode >= 500 &&
      payload &&
      typeof payload === 'object' &&
      payload.error
    ) {
      console.error(`[API ${res.statusCode}] ${payload.message || 'Erro interno'}`, payload.error);
    }

    return originalJson(normalizeErrorPayload(res.statusCode, payload));
  };

  next();
};

export const sendApiError = (res, status, message, code, details = {}) =>
  res.status(status).json({ message, code, ...details });

export const isAuthenticationError = (error) =>
  error?.statusCode === 401 ||
  error?.name === 'JsonWebTokenError' ||
  error?.name === 'TokenExpiredError' ||
  error?.name === 'NotBeforeError';

export const handleControllerError = (res, error, fallbackMessage) => {
  if (error?.statusCode === 401 && error?.name === 'Error') {
    return sendApiError(
      res,
      401,
      error.message || 'Token não fornecido ou mal formatado.',
      ERROR_CODES.AUTH_REQUIRED,
    );
  }

  if (isAuthenticationError(error)) {
    return sendApiError(
      res,
      401,
      'Token inválido ou expirado.',
      ERROR_CODES.INVALID_TOKEN,
    );
  }

  if (Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode < 500) {
    return sendApiError(
      res,
      error.statusCode,
      error.message || defaultMessageForStatus(error.statusCode),
      inferErrorCode(error.statusCode, error.message),
    );
  }

  console.error(fallbackMessage, error);
  return sendApiError(res, 500, fallbackMessage, ERROR_CODES.INTERNAL_ERROR);
};

export const notFoundHandler = (_req, res) =>
  sendApiError(
    res,
    404,
    'Rota não encontrada.',
    ERROR_CODES.ROUTE_NOT_FOUND,
  );

export const finalErrorHandler = (error, _req, res, _next) => {
  if (error?.type === 'entity.parse.failed') {
    return sendApiError(
      res,
      400,
      'JSON inválido no corpo da requisição.',
      ERROR_CODES.INVALID_JSON,
    );
  }

  console.error('Erro não tratado na API:', error);
  return sendApiError(
    res,
    500,
    'Não foi possível concluir a operação.',
    ERROR_CODES.INTERNAL_ERROR,
  );
};
