import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getWorkingHourById } from "@/lib/api/workingHours/queries";
import OptimisticWorkingHour from "./OptimisticWorkingHour";


import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function WorkingHourPage({
  params,
}: {
  params: { workingHourId: string };
}) {

  return (
    <main className="overflow-auto">
      <WorkingHour id={params.workingHourId} />
    </main>
  );
}

const WorkingHour = async ({ id }: { id: string }) => {
  
  const { workingHour } = await getWorkingHourById(id);
  

  if (!workingHour) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="working-hours" />
        <OptimisticWorkingHour workingHour={workingHour}  />
      </div>
    </Suspense>
  );
};
