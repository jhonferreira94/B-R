export const KnownClaims = {
  // Usuários
  list_users: 'list_users',
  create_users: 'create_users',
  update_users: 'update_users',
  delete_users: 'delete_users',
  reset_user_password: 'reset_user_password',

  // Aplicadores
  list_applicators: 'list_applicators',
  create_applicators: 'create_applicators',
  update_applicators: 'update_applicators',
  delete_applicators: 'delete_applicators',

  // Bitolas
  list_gauges: 'list_gauges',
  create_gauges: 'create_gauges',
  update_gauges: 'update_gauges',
  delete_gauges: 'delete_gauges',

  // Terminais
  list_terminals: 'list_terminals',
  create_terminals: 'create_terminals',
  update_terminals: 'update_terminals',
  delete_terminals: 'delete_terminals',

  // Fichas de Regulagem
  list_sheets: 'list_sheets',
  create_sheets: 'create_sheets',
  update_sheets: 'update_sheets',
  delete_sheets: 'delete_sheets',

  // Coletas de Grampeação
  list_staplings: 'list_staplings',
  create_staplings: 'create_staplings',
  update_any_staplings: 'update_any_staplings',
  delete_any_staplings: 'delete_any_staplings',
} as const;

export type KnownClaim = (typeof KnownClaims)[keyof typeof KnownClaims];

export interface RouteConfig {
  group?: string;
  path: string;
  name: string;
  icon?: string;
  claims?: KnownClaim[];
}

export const privateRoutes = {
  users: {
    group: 'ADMINISTRAÇÃO',
    path: '/users',
    name: 'Usuários',
    claims: [KnownClaims.list_users],
  } satisfies RouteConfig,
  applicators: {
    group: 'CADASTROS',
    path: '/applicators',
    name: 'Aplicadores',
    claims: [KnownClaims.list_applicators],
  } satisfies RouteConfig,
  gauges: {
    group: 'CADASTROS',
    path: '/gauges',
    name: 'Bitolas',
    claims: [KnownClaims.list_gauges],
  } satisfies RouteConfig,
  terminals: {
    group: 'CADASTROS',
    path: '/terminals',
    name: 'Terminais',
    claims: [KnownClaims.list_terminals],
  } satisfies RouteConfig,
  sheets: {
    group: 'PRODUÇÃO',
    path: '/sheets',
    name: 'Fichas de Regulagem',
    claims: [KnownClaims.list_sheets],
  } satisfies RouteConfig,
  staplings: {
    group: 'PRODUÇÃO',
    path: '/staplings',
    name: 'Coletas de Grampeação',
    claims: [KnownClaims.list_staplings],
  } satisfies RouteConfig,
} as const;

export const publicRoutes = {
  login: { path: '/login', name: 'Entrar' } satisfies RouteConfig,
  signup: { path: '/signup', name: 'Cadastrar' } satisfies RouteConfig,
  forgotPassword: { path: '/forgot-password', name: 'Recuperar Senha' } satisfies RouteConfig,
  changePassword: { path: '/change-password', name: 'Alterar Senha' } satisfies RouteConfig,
} as const;
