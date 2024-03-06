"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Slot, CompleteSlot } from "@/lib/db/schema/slots";
import Modal from "@/components/shared/Modal";

import { useOptimisticSlots } from "@/app/(app)/slots/useOptimisticSlots";
import { Button } from "@/components/ui/button";
import SlotForm from "./SlotForm";
import { PlusIcon } from "lucide-react";
import { formatSlotDate, formatSlotTime } from "@/lib/api/slots";
import React from "react";
import DateFilter from "@/components/shared/DateFilter";

type TOpenModal = (slot?: Slot) => void;

export default function SlotList({
  slots,
  date
}: {
  slots: CompleteSlot[];
  date: Date;
}) {
  const { optimisticSlots, addOptimisticSlot } = useOptimisticSlots(
    slots,
  );
  const [open, setOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);
  const openModal = (slot?: Slot) => {
    setOpen(true);
    slot ? setActiveSlot(slot) : setActiveSlot(null);
  };
  const closeModal = () => setOpen(false);


  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeSlot ? "Edit Slot" : "Create Slot"}
      >
        <SlotForm
          slot={activeSlot}
          addOptimistic={addOptimisticSlot}
          openModal={openModal}
          closeModal={closeModal}

        />
      </Modal>
      <div className="absolute right-0 top-0 flex gap-2">
        <DateFilter page="/slots" initialDate={date} />
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticSlots.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticSlots.map((slot) => (
            <Slot
              slot={slot}
              key={slot.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Slot = ({
  slot,
  openModal,
}: {
  slot: CompleteSlot;
  openModal: TOpenModal;
}) => {
  const optimistic = slot.id === "optimistic";
  const deleting = slot.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("slots")
    ? pathname
    : pathname + "/slots/";

  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div className={cn(
          new Date(slot.date) < new Date() ? "opacity-70" : "",
        )}>{formatSlotTime(slot)} | {formatSlotDate(slot)}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={basePath + "/" + slot.id}>
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
        No slots
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new slot.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Slots </Button>
      </div>
    </div>
  );
};
