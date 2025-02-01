import { CollectionData } from '@zilliz/milvus2-sdk-node'
import { create } from 'zustand'

interface AppStore {
  collectionName: string
  setCollectionName: (collectionName: string) => void

  collections: CollectionData[],
  setCollections: (collections: CollectionData[]) => void

  department: string,
  setDepartment: (department: string) => void
}

const store = create<AppStore>()(
  (set, get) => ({
    collectionName: 'docs',
    setCollectionName: (collectionName) => set({ collectionName }),

    collections: [],
    setCollections: (collections) => set({ collections }),

    department: 'hr',
    setDepartment: (department) => set({ department })
  })
)

export default store
