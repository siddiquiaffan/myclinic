import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getSlotById } from "@/lib/api/slots/queries";
import OptimisticSlot from "./OptimisticSlot";


import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function SlotPage({
  params,
}: {
  params: { slotId: string };
}) {

  return (
    <main className="overflow-auto">
      <Slot id={params.slotId} />
    </main>
  );
}

const Slot = async ({ id }: { id: string }) => {
  
  const { slot } = await getSlotById(id);
  

  if (!slot) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="slots" />
        <OptimisticSlot slot={slot}  />
      </div>
    </Suspense>
  );
};
