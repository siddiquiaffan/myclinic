import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getAppointmentById } from "@/lib/api/appointments/queries";
import { getSlots } from "@/lib/api/slots/queries";import OptimisticAppointment from "./OptimisticAppointment";


import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function AppointmentPage({
  params,
}: {
  params: { appointmentId: string };
}) {

  return (
    <main className="overflow-auto">
      <Appointment id={params.appointmentId} />
    </main>
  );
}

const Appointment = async ({ id }: { id: string }) => {
  
  const { appointment } = await getAppointmentById(id);
  const { slots } = await getSlots();

  if (!appointment) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="appointments" />
        <OptimisticAppointment appointment={appointment} slots={slots} />
      </div>
    </Suspense>
  );
};
