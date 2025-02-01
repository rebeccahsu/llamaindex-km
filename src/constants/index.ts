export * from './prompt';

export const TOKEN_KEY = 'auth';
export const SECRET_KEY = 'secretXXX'

export const Routes = {
  Chat: '/chat',
  Documents: '/documents',
  Users: '/users',
  Login: '/login',
};

export const CollectionsInMilvus = { // name of the collection in Milvus
  HR: 'hr',
  Legal: 'legal',
};

export const Collections = {
  [CollectionsInMilvus.HR]: {
    collectionName: CollectionsInMilvus.HR,
    label: '人資',
    description: 'Human Resources Documents',
  },
  [CollectionsInMilvus.Legal]: {
    collectionName: CollectionsInMilvus.Legal,
    label: '法務',
    description: 'Legal Documents',
  }
};

export const FileSources = {
  GoogleDrive: 'googleDrive',
  LocalFile: 'localFile',
}

export const DepartmentNames = {
  HR: 'hr',
  RD: 'rd',
  Legal: 'legal',
  A: 'a',
  B: 'b',
  C: 'c',
  D: 'd',
  E: 'e',
  F: 'f',
  G: 'g',
  H: 'h'
};

export const DepartmentLabel = {
  [DepartmentNames.HR]: '人資',
  [DepartmentNames.RD]: '研發',
  [DepartmentNames.Legal]: '法務',
  [DepartmentNames.A]: 'A',
  [DepartmentNames.B]: 'B',
  [DepartmentNames.C]: 'C',
  [DepartmentNames.D]: 'D',
  [DepartmentNames.E]: 'E',
  [DepartmentNames.F]: 'F',
  [DepartmentNames.G]: 'G',
  [DepartmentNames.H]: 'H'
};

export const DepartmentOptions = [
  {
    label: DepartmentLabel[DepartmentNames.HR],
    value: DepartmentNames.HR
  },
  {
    label: DepartmentLabel[DepartmentNames.RD],
    value: DepartmentNames.RD
  },
  {
    label: DepartmentLabel[DepartmentNames.Legal],
    value: DepartmentNames.Legal
  },
  {
    label: DepartmentLabel[DepartmentNames.A],
    value: DepartmentNames.A
  },
  {
    label: DepartmentLabel[DepartmentNames.B],
    value: DepartmentNames.B
  },
  {
    label: DepartmentLabel[DepartmentNames.C],
    value: DepartmentNames.C
  },
  {
    label: DepartmentLabel[DepartmentNames.D],
    value: DepartmentNames.D
  },
  {
    label: DepartmentLabel[DepartmentNames.E],
    value: DepartmentNames.E
  },
  {
    label: DepartmentLabel[DepartmentNames.F],
    value: DepartmentNames.F
  },
  {
    label: DepartmentLabel[DepartmentNames.G],
    value: DepartmentNames.G
  },
  {
    label: DepartmentLabel[DepartmentNames.H],
    value: DepartmentNames.H
  }
];