import { notFound } from 'next/navigation';
import { About } from '@/components/sections/About';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { Navbar } from '@/components/sections/Navbar';
import { Portfolio } from '@/components/sections/Portfolio';
import { Purpose } from '@/components/sections/Purpose';
import { Team } from '@/components/sections/Team';
import { Services } from '@/components/sections/Services';
import { loadSection } from '@/lib/content/loader';
import { sectionSchemas } from '@/lib/content/schema';

// Temporary. The real page is assembled in Task 24 and this file is deleted
// then. It exists so the sections built so far can be looked at before five
// more are built on top of their patterns. It loads the shipped JSON through
// the real loader rather than fixtures, so what renders here is what the site
// will render.
export default async function PreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  const [site, hero, about, purpose, services, portfolio, team, contact] = await Promise.all([
    loadSection('site', sectionSchemas.site),
    loadSection('hero', sectionSchemas.hero),
    loadSection('about', sectionSchemas.about),
    loadSection('purpose', sectionSchemas.purpose),
    loadSection('services', sectionSchemas.services),
    loadSection('portfolio', sectionSchemas.portfolio),
    loadSection('team', sectionSchemas.team),
    loadSection('contact', sectionSchemas.contact),
  ]);

  return (
    <>
      <Navbar logo={site.logo} nav={site.nav} cta={site.cta} ui={site.ui} />
      <main>
        <Hero {...hero} />
        <About {...about} />
        <Purpose {...purpose} />
        <Services {...services} />
        <Portfolio {...portfolio} />
        <Team {...team} ui={site.ui} />
        <Contact {...contact} ui={site.ui} />
      </main>
      <Footer
        logo={site.logo}
        nav={site.footer.nav}
        copyright={site.footer.copyright}
        social={contact.channels.filter((channel) => channel.type === 'social')}
      />
    </>
  );
}
