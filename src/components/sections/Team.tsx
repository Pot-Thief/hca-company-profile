import { TeamMember } from '@/components/interactive/TeamMember';
import { SectionShell } from './SectionShell';
import type { Team as TeamContent, UiLabels } from '@/lib/content/types';

// Continues the alternation: About paper, Purpose ink, Services paper,
// Portfolio ink, so Team lands back on paper (the SectionShell default).
export function Team({ label, headline, members, ui }: TeamContent & { ui: UiLabels }) {
  return (
    <SectionShell id="team" label={label} headline={headline}>
      {members.length > 0 ? (
        <div
          data-block="members"
          className="grid grid-cols-1 gap-[var(--space-section)] md:grid-cols-2 md:gap-[var(--space-gutter)]"
        >
          {members.map((member, index) => (
            <TeamMember key={index} member={member} ui={ui} />
          ))}
        </div>
      ) : (
        <p className="text-body text-on-surface-muted">
          No team members yet. Add members to team.json.
        </p>
      )}
    </SectionShell>
  );
}
