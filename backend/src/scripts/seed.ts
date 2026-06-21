import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/db';
import Post from '../models/Post';

const SAMPLE_POSTS = [
  {
    title: 'Bem-vindo ao boilerplate',
    slug: 'bem-vindo-ao-boilerplate',
    excerpt: 'Primeiro conteudo de exemplo, criado pelo script de seed.',
    content: 'Este e um conteudo de exemplo. Edite ou remova pelo painel administrativo.',
    published: true,
  },
  {
    title: 'Como personalizar este projeto',
    slug: 'como-personalizar-este-projeto',
    excerpt: 'Dicas rapidas para adaptar o boilerplate ao seu caso de uso.',
    content: 'Troque a marca, ajuste as paginas e configure as variaveis de ambiente.',
    published: true,
  },
  {
    title: 'Rascunho ainda nao publicado',
    slug: 'rascunho-ainda-nao-publicado',
    excerpt: 'Exemplo de conteudo com published=false.',
    content: 'Este conteudo nao aparece na listagem publica.',
    published: false,
  },
];

async function run(): Promise<void> {
  await connectDatabase();

  for (const post of SAMPLE_POSTS) {
    await Post.findOneAndUpdate({ slug: post.slug }, post, { upsert: true });
  }

  console.log(`Seed concluido: ${SAMPLE_POSTS.length} posts de exemplo.`);
  await disconnectDatabase();
}

run().catch((error) => {
  console.error('Erro ao executar o seed:', error);
  process.exit(1);
});
