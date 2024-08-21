import { z } from 'zod'
import { optionalish, optionalishDefault } from '../helpers/optionalish'

export enum CachingStrategy {
  expectCache = 'expectCache',
  ignoreCache = 'ignoreCache',
  updateCache = 'updateCache',
  updateCacheIfNeeded = 'updateCacheIfNeeded',
}

export enum StaticDataComponent {
  medicationClasses = 'medicationClasses',
  medications = 'medications',
  organizations = 'organizations',
  questionnaires = 'questionnaires',
  videoSections = 'videoSections',
}

export const updateStaticDataInputSchema = z.object({
  only: optionalishDefault(
    z.array(z.nativeEnum(StaticDataComponent)),
    Object.values(StaticDataComponent),
  ),
  cachingStrategy: optionalishDefault(
    z.nativeEnum(CachingStrategy),
    CachingStrategy.updateCacheIfNeeded,
  ),
})
export type UpdateStaticDataInput = z.input<typeof updateStaticDataInputSchema>
