import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_USERS } from '../shared/data/initialData';
import type { AppState } from '../shared/types';

const defaultDataDirectory = resolve(dirname(fileURLToPath(import.meta.url)), 'data');
const dataDirectory = resolve(process.env.DATA_DIR || defaultDataDirectory);
const stateFile = resolve(dataDirectory, 'store.json');

export function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return Array.isArray(state.users)
    && state.users.every((u: any) => u && typeof u.id === 'string' && typeof u.email === 'string' && ['admin', 'seller'].includes(u.role))
    && Array.isArray(state.products)
    && state.products.every((p: any) => p && typeof p.id === 'string' && Number.isFinite(p.stock) && p.stock >= 0 && Number.isFinite(p.salePrice) && p.salePrice >= 0)
    && Array.isArray(state.sales)
    && Array.isArray(state.stockMovements);
}

function createInitialState(): AppState {
  return JSON.parse(JSON.stringify({
    users: INITIAL_USERS,
    products: INITIAL_PRODUCTS,
    sales: INITIAL_SALES,
    stockMovements: [],
  })) as AppState;
}

export function writeState(state: AppState): void {
  if (!isAppState(state)) {
    throw new TypeError('El estado recibido no tiene el formato esperado.');
  }

  mkdirSync(dataDirectory, { recursive: true });
  const temporaryFile = `${stateFile}.${process.pid}.tmp`;
  writeFileSync(temporaryFile, JSON.stringify(state, null, 2), 'utf8');
  renameSync(temporaryFile, stateFile);
}

export function readState(): AppState {
  mkdirSync(dataDirectory, { recursive: true });

  if (!existsSync(stateFile)) {
    const initialState = createInitialState();
    writeState(initialState);
    return initialState;
  }

  const state: unknown = JSON.parse(readFileSync(stateFile, 'utf8'));
  if (!isAppState(state)) {
    throw new Error('El archivo de datos no contiene un estado válido.');
  }
  return state;
}
