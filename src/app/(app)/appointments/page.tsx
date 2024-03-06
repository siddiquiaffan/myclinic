import { Suspense } from "react";

import Loading from "@/app/loading";
import AppointmentList from "@/components/appointments/AppointmentList";
import { getAppointmentsByDate } from "@/lib/api/appointments/queries";
import { getSlotsByDate } from "@/lib/api/slots/queries";

export const revalidate = 0;

export default async function AppointmentsPage({
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
          <h1 className="font-semibold text-2xl my-2">Appointments</h1>
        </div>
        <Appointments date={date} />
      </div>
    </main>
  );
}

interface AppointmentsProps {
  date: Date
}

const Appointments = async ({ date }: AppointmentsProps) => {

  const { appointments } = await getAppointmentsByDate(date);
  const { slots } = await getSlotsByDate(new Date(new Date().setHours(0, 0)), {
    isAvailable: true,
    till: new Date(new Date().setDate(new Date().getDate() + 2))
  });

  return (
    <Suspense fallback={<Loading />}>
      <AppointmentList appointments={appointments} slots={slots} date={date} />
    </Suspense>
  );
};
