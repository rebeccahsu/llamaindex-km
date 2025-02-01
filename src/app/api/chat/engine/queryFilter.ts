import { MetadataFilter, MetadataFilters } from "llamaindex";

export function generateFilters(documentIds: string[]): MetadataFilters {
  // only retrieve information from provided documentIds
  const documentsFilter: MetadataFilter = {
    key: "doc_id",
    value: documentIds,
    operator: "in",
  };

  // if documentIds are provided, retrieve information only from those documents
  return {
    filters: [documentsFilter]
  };


  // /////////////////////////////////////////////////////////////

  // filter all documents have the private metadata key set to true
  const publicDocumentsFilter: MetadataFilter = {
    key: "private",
    value: "true",
    operator: "!=",
  };

  // if no documentIds are provided, only retrieve information from public documents
  if (!documentIds.length) return { filters: [publicDocumentsFilter] };

  const privateDocumentsFilter: MetadataFilter = {
    key: "doc_id",
    value: documentIds,
    operator: "in",
  };

  // if documentIds are provided, retrieve information only from those documents
  return {
    filters: [privateDocumentsFilter]
  };

  // if documentIds are provided, retrieve information from public and private documents
  return {
    filters: [publicDocumentsFilter, privateDocumentsFilter],
    condition: "or",
  };
}
