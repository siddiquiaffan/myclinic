import { Suspense } from "react";

import Loading from "@/app/loading";
import WorkingHourList from "@/components/workingHours/WorkingHourList";
import { getWorkingHours } from "@/lib/api/workingHours/queries";


export const revalidate = 0;

export default async function WorkingHoursPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Working Hours</h1>
        </div>
        <WorkingHours />
      </div>
    </main>
  );
}

const WorkingHours = async () => {
  
  const { workingHours } = await getWorkingHours();
  
  return (
    <Suspense fallback={<Loading />}>
      <WorkingHourList workingHours={workingHours}  />
    </Suspense>
  );
};
