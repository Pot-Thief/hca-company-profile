import { notFound } from 'next/navigation';
import { About } from '@/components/sections/About';
import { Hero } from '@/components/sections/Hero';
import { Navbar } from '@/components/sections/Navbar';
import { Purpose } from '@/components/sections/Purpose';
import { loadSection } from '@/lib/content/loader';
import { sectionSchemas } from '@/lib/content/schema';

// Temporary. The real page is assembled in Task 24 and this file is deleted
// then. It exists so the sections built so far can be looked at before five
// more are built on top of their patterns. It loads the shipped JSON through
// the real loader rather than fixtures, so what renders here is what the site
// will render.
export default async function PreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  const [site, hero, about, purpose] = await Promise.all([
    loadSection('site', sectionSchemas.site),
    loadSection('hero', sectionSchemas.hero),
    loadSection('about', sectionSchemas.about),
    loadSection('purpose', sectionSchemas.purpose),
  ]);

  return (
    <>
      <Navbar logo={site.logo} nav={site.nav} cta={site.cta} ui={site.ui} />
      <main>
        <Hero {...hero} />
        <About {...about} />
        <Purpose {...purpose} />
      </main>
    </>
  );
}
