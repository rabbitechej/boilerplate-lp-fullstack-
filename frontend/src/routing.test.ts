import { describe, expect, it } from 'vitest';
import { getRoute, isAppPath, normalizePathname } from './routing';

describe('normalizePathname', () => {
  it('remove barras finais', () => {
    expect(normalizePathname('/sobre/')).toBe('/sobre');
  });

  it('mantem a raiz como /', () => {
    expect(normalizePathname('/')).toBe('/');
  });
});

describe('getRoute', () => {
  it('identifica a home', () => {
    expect(getRoute('/')).toEqual({ kind: 'home', path: '/' });
  });

  it('identifica um post pelo slug', () => {
    expect(getRoute('/conteudos/meu-post')).toEqual({
      kind: 'post',
      path: '/conteudos/meu-post',
      slug: 'meu-post',
    });
  });

  it('identifica edicao de post no admin', () => {
    expect(getRoute('/admin/conteudos/abc123')).toEqual({
      kind: 'admin-posts',
      path: '/admin/conteudos/abc123',
      mode: 'edit',
      id: 'abc123',
    });
  });

  it('retorna not-found para caminhos desconhecidos', () => {
    expect(getRoute('/rota-inexistente')).toEqual({ kind: 'not-found', path: '/rota-inexistente' });
  });
});

describe('isAppPath', () => {
  it('retorna true para rotas conhecidas', () => {
    expect(isAppPath('/sobre')).toBe(true);
  });

  it('retorna false para rotas desconhecidas', () => {
    expect(isAppPath('/nada-aqui')).toBe(false);
  });
});
