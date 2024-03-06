"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Appointment, CompleteAppointment } from "@/lib/db/schema/appointments";
import Modal from "@/components/shared/Modal";
import { type Slot, type SlotId } from "@/lib/db/schema/slots";
import { useOptimisticAppointments } from "@/app/(app)/appointments/useOptimisticAppointments";
import { Button } from "@/components/ui/button";
import AppointmentForm from "./AppointmentForm";
import { PlusIcon } from "lucide-react";
import { formatSlotDate, formatSlotTime } from "@/lib/api/slots";
import DateFilter from "@/components/shared/DateFilter";

type TOpenModal = (appointment?: Appointment) => void;

export default function AppointmentList({
  appointments,
  slots,
  slotId,
  date
}: {
  appointments: CompleteAppointment[];
  slots: Slot[];
  slotId?: SlotId
  date: Date;
}) {
  const { optimisticAppointments, addOptimisticAppointment } = useOptimisticAppointments(
    appointments,
    slots 
  );
  const [open, setOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const openModal = (appointment?: Appointment) => {
    setOpen(true);
    appointment ? setActiveAppointment(appointment) : setActiveAppointment(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeAppointment ? "Edit Appointment" : "Create Appointment"}
      >
        <AppointmentForm
          appointment={activeAppointment}
          addOptimistic={addOptimisticAppointment}
          openModal={openModal}
          closeModal={closeModal}
          slots={slots}
        slotId={slotId}
        />
      </Modal>
      <div className="absolute right-0 top-0 flex gap-2">
        <DateFilter page="/appointments" initialDate={date} />
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticAppointments.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticAppointments.map((appointment) => (
            <Appointment
              appointment={appointment}
              key={appointment.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Appointment = ({
  appointment,
  openModal,
}: {
  appointment: CompleteAppointment;
  openModal: TOpenModal;
}) => {
  const optimistic = appointment.id === "optimistic";
  const deleting = appointment.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("appointments")
    ? pathname
    : pathname + "/appointments/";


  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>
          {
            appointment.name + " - " + appointment.email + " | " + formatSlotDate(appointment.slot) + " - " +  formatSlotTime(appointment.slot)
          }
        </div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={ basePath + "/" + appointment.id }>
          Edit
        </Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No appointments
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new appointment.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Appointments </Button>
      </div>
    </div>
  );
};
