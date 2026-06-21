import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { toPostDto, toPublicPostDto } from './index';
import type { IPost } from '../models/Post';

function fakePost(): IPost {
  return {
    _id: '507f1f77bcf86cd799439011',
    title: 'Titulo',
    slug: 'titulo',
    excerpt: 'Resumo',
    content: 'Conteudo',
    coverImageUrl: undefined,
    published: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
  } as unknown as IPost;
}

describe('toPostDto', () => {
  it('serializa todos os campos, incluindo published', () => {
    const dto = toPostDto(fakePost());
    assert.equal(dto.id, '507f1f77bcf86cd799439011');
    assert.equal(dto.published, true);
  });
});

describe('toPublicPostDto', () => {
  it('omite o campo published', () => {
    const dto = toPublicPostDto(fakePost());
    assert.equal('published' in dto, false);
    assert.equal(dto.title, 'Titulo');
  });
});
