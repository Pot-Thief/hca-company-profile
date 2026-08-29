import type { ChannelType } from './types';

export function channelHref(type: ChannelType, value: string, href?: string): string | undefined {
  if (href) return href;
  switch (type) {
    case 'email':
      return `mailto:${value}`;
    case 'phone':
      return `tel:${value.replace(/[^\d+]/g, '')}`;
    case 'whatsapp':
      return `https://wa.me/${value.replace(/\D/g, '')}`;
    case 'social':
      return value;
    case 'address':
    case 'hours':
      return undefined;
  }
}
