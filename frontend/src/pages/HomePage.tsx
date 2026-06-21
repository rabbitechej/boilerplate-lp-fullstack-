import { useReveal } from '../hooks/useReveal';
import { routes } from '../routing';

export function HomePage() {
  const heroRef = useReveal<HTMLDivElement>();

  return (
    <div>
      <section ref={heroRef} className="reveal">
        <h1>Landing page de exemplo</h1>
        <p>Substitua este texto pela proposta de valor do seu projeto.</p>
        <a href={routes.contact}>Fale com a gente</a>
      </section>
    </div>
  );
}
