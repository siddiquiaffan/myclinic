
import { type WorkingHour, type CompleteWorkingHour } from "@/lib/db/schema/workingHours";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<WorkingHour>) => void;

export const useOptimisticWorkingHours = (
  workingHours: CompleteWorkingHour[],
  
) => {
  const [optimisticWorkingHours, addOptimisticWorkingHour] = useOptimistic(
    workingHours,
    (
      currentState: CompleteWorkingHour[],
      action: OptimisticAction<WorkingHour>,
    ): CompleteWorkingHour[] => {
      const { data } = action;

      

      const optimisticWorkingHour = {
        ...data,
        
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticWorkingHour]
            : [...currentState, optimisticWorkingHour];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticWorkingHour } : item,
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

  return { addOptimisticWorkingHour, optimisticWorkingHours };
};
