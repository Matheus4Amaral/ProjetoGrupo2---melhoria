import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerJsdoc from 'swagger-jsdoc';
import { applyContextualErrorExamples } from './swaggerErrorExamples.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const docsGlob = path
  .resolve(currentDirectory, '../docs/*.yaml')
  .replaceAll('\\', '/');

const generatedSwaggerSpec = swaggerJsdoc({
  failOnErrors: true,
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API StockControl',
      version: '1.0',
      description:
        'Documentação dos endpoints da api StockControl',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor local',
      },
    ],
    tags: [
      { name: 'Autenticação' },
      { name: 'Perfil' },
      { name: 'Dashboard' },
      { name: 'Produtos' },
      { name: 'Estoques' },
      { name: 'Vendas' },
      { name: 'Fornecedores' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiError: {
          type: 'object',
          required: ['message', 'code'],
          additionalProperties: false,
          properties: {
            message: {
              type: 'string',
            },
            code: {
              type: 'string',
              pattern: '^[A-Z][A-Z0-9_]*$',
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Dados inválidos',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
            },
          },
        },
        Unauthorized: {
          description: 'Autenticação ausente ou inválida',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
            },
          },
        },
        Forbidden: {
          description: 'Acesso não permitido',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
            },
          },
        },
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
            },
          },
        },
        Conflict: {
          description: 'Conflito recurso duplicado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
            },
          },
        },
        InternalError: {
          description: 'Falha inesperada',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              example: {
                message: 'Não foi possível concluir a operação.',
                code: 'INTERNAL_ERROR',
              },
            },
          },
        },
      },
    },
  },
  apis: [docsGlob],
});

export const swaggerSpec = applyContextualErrorExamples(generatedSwaggerSpec);
