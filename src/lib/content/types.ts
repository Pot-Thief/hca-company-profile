import type { z } from 'zod';
import type {
  aboutSchema,
  channelTypeSchema,
  contactSchema,
  heroSchema,
  portfolioSchema,
  purposeSchema,
  servicesSchema,
  siteSchema,
  teamSchema,
} from './schema';

export type Site = z.output<typeof siteSchema>;
export type Hero = z.output<typeof heroSchema>;
export type About = z.output<typeof aboutSchema>;
export type Purpose = z.output<typeof purposeSchema>;
export type Services = z.output<typeof servicesSchema>;
export type Portfolio = z.output<typeof portfolioSchema>;
export type Team = z.output<typeof teamSchema>;
export type Contact = z.output<typeof contactSchema>;
export type ContactChannel = Contact['channels'][number];
export type UiLabels = Site['ui'];
export type ChannelType = z.output<typeof channelTypeSchema>;
export type ImageRef = { src: string; alt: string };
