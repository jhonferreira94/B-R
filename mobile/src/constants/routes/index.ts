export const KnownClaims = {
  list_clients: 'list_clients',
  create_clients: 'create_clients',
  update_clients: 'update_clients',
  delete_clients: 'delete_clients',
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
  clients: {
    group: 'Cadastros',
    path: '/clients',
    name: 'Clientes',
    claims: [KnownClaims.list_clients],
  } satisfies RouteConfig,
} as const;

export const publicRoutes = {
  login: { path: '/login', name: 'Entrar' } satisfies RouteConfig,
} as const;
