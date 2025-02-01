'use client';

import { Collections } from "src/constants";
import { useAppStore } from "src/stores";

export default function CurrentCollection() {
  const { collectionName } = useAppStore();

  return (
    <div className="absolute right-2.5 top-2.5">
      Current Collection: {Collections[collectionName]?.label || collectionName}
    </div>
  );
}