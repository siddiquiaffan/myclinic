import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/appointments/useOptimisticAppointments";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


import { type Appointment, insertAppointmentParams } from "@/lib/db/schema/appointments";
import {
  createAppointmentAction,
  deleteAppointmentAction,
  updateAppointmentAction,
} from "@/lib/actions/appointments";
import { type Slot, type SlotId } from "@/lib/db/schema/slots";
import { formatSlotTime } from "@/lib/api/slots";

const AppointmentForm = ({
  slots,
  slotId,
  appointment,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  appointment?: Appointment | null;
  slots: Slot[];
  slotId?: SlotId
  openModal?: (appointment?: Appointment) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Appointment>(insertAppointmentParams);
  const editing = !!appointment?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("appointments");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Appointment },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
      toast.error(`Failed to ${action}`, {
        description: data?.error ?? "Error",
      });
    } else {
      router.refresh();
      postSuccess && postSuccess();
      toast.success(`Appointment ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const appointmentParsed = await insertAppointmentParams.safeParseAsync({ slotId, ...payload });
    if (!appointmentParsed.success) {
      setErrors(appointmentParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = appointmentParsed.data;
    const pendingAppointment: Appointment = {
      updatedAt: appointment?.updatedAt ?? new Date(),
      createdAt: appointment?.createdAt ?? new Date(),
      id: appointment?.id ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingAppointment,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateAppointmentAction({ ...values, id: appointment.id })
          : await createAppointmentAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingAppointment 
        };
        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined,
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
      {/* Schema fields start */}
      
      {slotId ? null : <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.slotId ? "text-destructive" : "",
          )}
        >
          Slot
        </Label>
        <Select defaultValue={appointment?.slotId} name="slotId">
          <SelectTrigger
            className={cn(errors?.slotId ? "ring ring-destructive" : "")}
          >
            <SelectValue placeholder="Select a slot" />
          </SelectTrigger>
          <SelectContent>
          {slots?.map((slot) => (
            <SelectItem key={slot.id} value={slot.id.toString()}>
              {
                formatSlotTime(slot) + " | " + new Date(slot.startTime).toLocaleString('en-US', { weekday: 'long' })
              }
            </SelectItem>
           ))}
          </SelectContent>
        </Select>
        {errors?.slotId ? (
          <p className="text-xs text-destructive mt-2">{errors.slotId[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div> }
        <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.name ? "text-destructive" : "",
          )}
        >
          Name
        </Label>
        <Input
          type="text"
          name="name"
          className={cn(errors?.name ? "ring ring-destructive" : "")}
          defaultValue={appointment?.name ?? ""}
        />
        {errors?.name ? (
          <p className="text-xs text-destructive mt-2">{errors.name[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
        <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.email ? "text-destructive" : "",
          )}
        >
          Email
        </Label>
        <Input
          type="text"
          name="email"
          className={cn(errors?.email ? "ring ring-destructive" : "")}
          defaultValue={appointment?.email ?? ""}
        />
        {errors?.email ? (
          <p className="text-xs text-destructive mt-2">{errors.email[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: "delete", data: appointment });
              const error = await deleteAppointmentAction(appointment.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: appointment,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default AppointmentForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};
