"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type WorkingHour, CompleteWorkingHour } from "@/lib/db/schema/workingHours";
import Modal from "@/components/shared/Modal";

import { useOptimisticWorkingHours } from "@/app/(app)/working-hours/useOptimisticWorkingHours";
import { Button } from "@/components/ui/button";
import WorkingHourForm from "./WorkingHourForm";
import { PlusIcon } from "lucide-react";
import { weekDays, weekDaysList } from "@/lib/api/workingHours";

type TOpenModal = (workingHour?: WorkingHour) => void;

export default function WorkingHourList({
  workingHours,
   
}: {
  workingHours: CompleteWorkingHour[];
   
}) {
  const { optimisticWorkingHours, addOptimisticWorkingHour } = useOptimisticWorkingHours(
    workingHours,
     
  );
  const [open, setOpen] = useState(false);
  const [activeWorkingHour, setActiveWorkingHour] = useState<WorkingHour | null>(null);
  const openModal = (workingHour?: WorkingHour) => {
    setOpen(true);
    workingHour ? setActiveWorkingHour(workingHour) : setActiveWorkingHour(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeWorkingHour ? "Edit WorkingHour" : "Create Working Hour"}
      >
        <WorkingHourForm
          workingHour={activeWorkingHour}
          addOptimistic={addOptimisticWorkingHour}
          openModal={openModal}
          closeModal={closeModal}
          
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticWorkingHours.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticWorkingHours.map((workingHour) => (
            <WorkingHour
              workingHour={workingHour}
              key={workingHour.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const WorkingHour = ({
  workingHour,
  openModal,
}: {
  workingHour: CompleteWorkingHour;
  openModal: TOpenModal;
}) => {
  const optimistic = workingHour.id === "optimistic";
  const deleting = workingHour.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("working-hours")
    ? pathname
    : pathname + "/working-hours/";


  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{weekDaysList[workingHour.dayOfWeek]}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={ basePath + "/" + workingHour.id }>
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
        No working hours
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new working hour.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Working Hours </Button>
      </div>
    </div>
  );
};
