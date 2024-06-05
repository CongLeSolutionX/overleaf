import { FC, createContext, useContext, useMemo } from 'react'
import useScopeValue from '../hooks/use-scope-value'
import getMeta from '@/utils/meta'
import { UserId } from '../../../../types/user'
import { PublicAccessLevel } from '../../../../types/public-access-level'
import type * as ReviewPanel from '@/features/source-editor/context/review-panel/types/review-panel-state'

const ProjectContext = createContext<
  | {
      _id: string
      name: string
      rootDocId?: string
      members: { _id: UserId; email: string; privileges: string }[]
      invites: { _id: UserId }[]
      features: {
        collaborators?: number
        compileGroup?: 'alpha' | 'standard' | 'priority'
        trackChanges?: boolean
        trackChangesVisible?: boolean
        references?: boolean
        mendeley?: boolean
        zotero?: boolean
        versioning?: boolean
        gitBridge?: boolean
        referencesSearch?: boolean
        github?: boolean
      }
      publicAccessLevel?: PublicAccessLevel
      owner: {
        _id: UserId
        email: string
      }
      tags: {
        _id: string
        name: string
        color?: string
      }[]
      trackChangesState: ReviewPanel.Value<'trackChangesState'>
    }
  | undefined
>(undefined)

export function useProjectContext() {
  const context = useContext(ProjectContext)

  if (!context) {
    throw new Error(
      'useProjectContext is only available inside ProjectProvider'
    )
  }

  return context
}

// when the provider is created the project is still not added to the Angular
// scope. A few props are populated to prevent errors in existing React
// components
const projectFallback = {
  _id: window.project_id,
  name: '',
  features: {},
}

export const ProjectProvider: FC = ({ children }) => {
  const [project] = useScopeValue('project')

  const {
    _id,
    name,
    rootDoc_id: rootDocId,
    members,
    invites,
    features,
    publicAccesLevel: publicAccessLevel,
    owner,
    trackChangesState,
  } = project || projectFallback

  const tags = useMemo(
    () =>
      getMeta('ol-projectTags', [])
        // `tag.name` data may be null for some old users
        .map((tag: any) => ({ ...tag, name: tag.name ?? '' })),
    []
  )

  const value = useMemo(() => {
    return {
      _id,
      name,
      rootDocId,
      members,
      invites,
      features,
      publicAccessLevel,
      owner,
      tags,
      trackChangesState,
    }
  }, [
    _id,
    name,
    rootDocId,
    members,
    invites,
    features,
    publicAccessLevel,
    owner,
    tags,
    trackChangesState,
  ])

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  )
}
