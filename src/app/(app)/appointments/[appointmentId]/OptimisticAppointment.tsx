"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/appointments/useOptimisticAppointments";
import { type Appointment } from "@/lib/db/schema/appointments";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import { type Slot, type SlotId } from "@/lib/db/schema/slots";

export default function OptimisticAppointment({ 
  appointment,
  slots,
  slotId 
}: { 
  appointment: Appointment; 
  
  slots: Slot[];
  slotId?: SlotId
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Appointment) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticAppointment, setOptimisticAppointment] = useOptimistic(appointment);
  const updateAppointment: TAddOptimistic = (input) =>
    setOptimisticAppointment({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <AppointmentForm
          appointment={optimisticAppointment}
          slots={slots}
        slotId={slotId}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateAppointment}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{optimisticAppointment.slotId}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticAppointment.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticAppointment, null, 2)}
      </pre>
    </div>
  );
}
