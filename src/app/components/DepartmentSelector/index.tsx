'use client';

import { Select } from "antd";
import { useAppStore, useUserStore } from "src/stores";
import { CollectionData } from "@zilliz/milvus2-sdk-node";
import { Collections, DepartmentOptions } from "src/constants";
import { updateDepartment } from "@/app/actions/user";

export default function DepartmentSelector({ collections: propCollections }: { collections?: CollectionData[] }) {
  const {collectionName, setCollectionName, department, setDepartment} = useAppStore();
  // const options = propCollections.map((collection) => ({
  //   label: Collections[collection.name]?.label || collection.name,
  //   value: collection.name,
  // }));
  const { profile, setProfile } = useUserStore();

  const onChangeDepartment = async (department: string) => {
    if (!profile) return;

    console.log('department', profile.id, department);
    try {
      const newProfile = await updateDepartment(profile.id, department);
      console.log(newProfile);
      setProfile(newProfile);
      setDepartment(department);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* <div className="flex items-center mb-2.5">
        <div className="shrink-0 mr-2.5">
          Collection:
        </div>
        <Select
          options={options}
          // options={DepartmentOptions}
          value={collectionName}
          onChange={(option) => {
            setCollectionName(option);
          }}
          style={{ minWidth: 150 }}
        />
      </div> */}
      <div className="flex items-center mb-2.5 mt-2">
        <div className="shrink-0 mr-2.5">
          Department:
        </div>
        <Select
          options={DepartmentOptions}
          value={department}
          onChange={(option) => {
            onChangeDepartment(option);
          }}
          style={{ minWidth: 150 }}
        />
      </div>
    </div>
  )
}