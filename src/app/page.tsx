import { About } from '@/components/sections/About';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { Navbar } from '@/components/sections/Navbar';
import { Portfolio } from '@/components/sections/Portfolio';
import { Purpose } from '@/components/sections/Purpose';
import { Services } from '@/components/sections/Services';
import { Team } from '@/components/sections/Team';
import { Reveal } from '@/components/interactive/Reveal';
import { loadSection } from '@/lib/content/loader';
import { sectionSchemas } from '@/lib/content/schema';

export default async function Page() {
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

  const social = contact.channels.filter((channel) => channel.type === 'social');

  return (
    <>
      <Navbar logo={site.logo} nav={site.nav} cta={site.cta} ui={site.ui} />
      <main>
        {/* Hero is deliberately outside Reveal. It is above the fold, so hiding
            it behind an observer would delay the first thing the reader sees. */}
        <Hero {...hero} />
        <Reveal>
          <About {...about} />
        </Reveal>
        <Reveal>
          <Purpose {...purpose} />
        </Reveal>
        <Reveal>
          <Services {...services} />
        </Reveal>
        <Reveal>
          <Portfolio {...portfolio} ui={site.ui} />
        </Reveal>
        <Reveal>
          <Team {...team} ui={site.ui} />
        </Reveal>
        <Reveal>
          <Contact {...contact} ui={site.ui} />
        </Reveal>
      </main>
      <Footer
        logo={site.logo}
        nav={site.footer.nav}
        copyright={site.footer.copyright}
        social={social}
      />
    </>
  );
}
