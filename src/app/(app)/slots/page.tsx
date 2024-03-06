import { Suspense } from "react";

import Loading from "@/app/loading";
import SlotList from "@/components/slots/SlotList";
import { getSlots, getSlotsByDate } from "@/lib/api/slots/queries";


export const revalidate = 0;

export default async function SlotsPage({
  searchParams
}: {
  searchParams: Record<string, string>;
}) {
  const date = new Date(searchParams.date ?? new Date())
  date.setHours(0, 0, 0)

  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Slots</h1>
        </div>
        <Slots date={date} />
      </div>
    </main>
  );
}

interface SlotProps {
  date: Date
}

const Slots = async ({ date }: SlotProps) => {

  const { slots } = await getSlotsByDate(date);

  return (
    <Suspense fallback={<Loading />}>
      <SlotList slots={slots} date={date} />
    </Suspense>
  );
};
