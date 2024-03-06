"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/working-hours/useOptimisticWorkingHours";
import { type WorkingHour } from "@/lib/db/schema/workingHours";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import WorkingHourForm from "@/components/workingHours/WorkingHourForm";
import { weekDaysList } from "@/lib/api/workingHours";


export default function OptimisticWorkingHour({ 
  workingHour,
   
}: { 
  workingHour: WorkingHour; 
  
  
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: WorkingHour) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticWorkingHour, setOptimisticWorkingHour] = useOptimistic(workingHour);
  const updateWorkingHour: TAddOptimistic = (input) =>
    setOptimisticWorkingHour({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <WorkingHourForm
          workingHour={optimisticWorkingHour}
          
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateWorkingHour}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">
          {weekDaysList[optimisticWorkingHour.dayOfWeek]}
        </h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticWorkingHour.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticWorkingHour, null, 2)}
      </pre>
    </div>
  );
}
