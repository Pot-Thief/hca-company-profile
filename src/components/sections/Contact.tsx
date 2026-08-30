import { CopyButton } from '@/components/interactive/CopyButton';
import { SectionShell } from './SectionShell';
import { channelHref } from '@/lib/content/channel-href';
import type { Contact as ContactContent, UiLabels } from '@/lib/content/types';

const copyableTypes = new Set(['email', 'phone', 'whatsapp']);

// Ink, the second deliberate emphasis after Hero: the closing call to
// action, not a step in an alternating pattern.
export function Contact({ label, headline, channels, ui }: ContactContent & { ui: UiLabels }) {
  return (
    <SectionShell id="contact" label={label} headline={headline} surface="ink">
      {channels.length > 0 ? (
        <dl data-block="channels">
          {channels.map((channel, index) => {
            const href = channelHref(channel.type, channel.value, channel.href);
            return (
              <div
                key={index}
                className="flex flex-wrap items-center justify-between gap-[var(--space-block)] border-b border-rule py-[var(--space-block)] first:border-t"
              >
                <dt className="font-mono text-label uppercase tracking-label text-on-surface-muted">
                  {channel.label}
                </dt>
                <dd className="flex items-center gap-[var(--space-block)] text-body text-on-surface">
                  {href ? (
                    <a
                      href={href}
                      className="underline-offset-4 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-on-surface-muted"
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <span>{channel.value}</span>
                  )}
                  {copyableTypes.has(channel.type) ? (
                    <CopyButton
                      value={channel.value}
                      label={channel.label}
                      copyLabel={ui.copy}
                      copiedLabel={ui.copied}
                    />
                  ) : null}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <p className="text-body text-on-surface-muted">
          No contact channels yet. Add channels to contact.json.
        </p>
      )}
    </SectionShell>
  );
}
