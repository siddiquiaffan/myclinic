
import { type Slot, type CompleteSlot } from "@/lib/db/schema/slots";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Slot>) => void;

export const useOptimisticSlots = (
  slots: CompleteSlot[],
  
) => {
  const [optimisticSlots, addOptimisticSlot] = useOptimistic(
    slots,
    (
      currentState: CompleteSlot[],
      action: OptimisticAction<Slot>,
    ): CompleteSlot[] => {
      const { data } = action;

      

      const optimisticSlot = {
        ...data,
        
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticSlot]
            : [...currentState, optimisticSlot];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticSlot } : item,
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

  return { addOptimisticSlot, optimisticSlots };
};
