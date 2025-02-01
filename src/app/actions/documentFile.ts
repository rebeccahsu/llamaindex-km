'use server'

import { DocumentFileModel } from 'db/models';
import PermissionFlags from 'src/models/PermissionFlags';

export async function getAccessibleDocIds(departments: string[]) {
  try {
    const data = await DocumentFileModel.find(
      PermissionFlags.createQuery(departments)
    );
    console.log('departments', departments, PermissionFlags.createQuery(departments))
    console.log('accessible files:', data);

    const docIds = data.map((doc) => doc.docIds).flat();
    console.log('docIds:', docIds);
    return docIds

  } catch (error) {
    console.error('getAccessibleDocIds error:', error);
    throw error
  }
}
