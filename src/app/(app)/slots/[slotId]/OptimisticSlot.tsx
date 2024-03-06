"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/slots/useOptimisticSlots";
import { type Slot } from "@/lib/db/schema/slots";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import SlotForm from "@/components/slots/SlotForm";
import { formatSlotDate, formatSlotTime } from "@/lib/api/slots";


export default function OptimisticSlot({ 
  slot,
   
}: { 
  slot: Slot; 
  
  
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Slot) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticSlot, setOptimisticSlot] = useOptimistic(slot);
  const updateSlot: TAddOptimistic = (input) =>
    setOptimisticSlot({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <SlotForm
          slot={optimisticSlot}
          
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateSlot}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">
          {
            formatSlotTime(optimisticSlot) + " | " + formatSlotDate(optimisticSlot)
          }
        </h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticSlot.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticSlot, null, 2)}
      </pre>
    </div>
  );
}
