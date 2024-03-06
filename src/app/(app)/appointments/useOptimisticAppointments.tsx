import { type Slot } from "@/lib/db/schema/slots";
import { type Appointment, type CompleteAppointment } from "@/lib/db/schema/appointments";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Appointment>) => void;

export const useOptimisticAppointments = (
  appointments: CompleteAppointment[],
  slots: Slot[]
) => {
  const [optimisticAppointments, addOptimisticAppointment] = useOptimistic(
    appointments,
    (
      currentState: CompleteAppointment[],
      action: OptimisticAction<Appointment>,
    ): CompleteAppointment[] => {
      const { data } = action;

      const optimisticSlot = slots.find(
        (slot) => slot.id === data.slotId,
      )!;

      const optimisticAppointment = {
        ...data,
        slot: optimisticSlot,
        id: "optimistic",
      }

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticAppointment]
            : [...currentState, optimisticAppointment as any];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticAppointment } : item,
          );
        case "delete":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, id: "delete" } : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticAppointment, optimisticAppointments };
};
