import type { Architecture } from '@eighty4/install-template'

export const ARCHITECTURE_UPDATE_EVENT_TYPE = 'architecture'

export type ArchitectureUpdateEvent = CustomEvent<ArchitectureUpdate>

export interface ArchitectureUpdate {
    arch: Architecture
    filename: string
}

export function createArchitectureUpdate(
    arch: Architecture,
    filename: string,
): CustomEvent<ArchitectureUpdate> {
    return new CustomEvent<ArchitectureUpdate>(ARCHITECTURE_UPDATE_EVENT_TYPE, {
        detail: { arch, filename },
    })
}
