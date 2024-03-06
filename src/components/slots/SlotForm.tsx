import { z } from "zod";

import { FormEventHandler, useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/slots/useOptimisticSlots";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

import { type Slot, insertSlotParams } from "@/lib/db/schema/slots";
import {
  createSlotAction,
  deleteSlotAction,
  updateSlotAction,
} from "@/lib/actions/slots";
import TimePicker from "@/components/shared/TimePicker";


const SlotForm = ({

  slot,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  slot?: Slot | null;

  openModal?: (slot?: Slot) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Slot>(insertSlotParams);
  const editing = !!slot?.id;
  const [date, setDate] = useState<Date | undefined>(
    slot?.date ?? new Date(),
  );
  const [startTime, setStartTime] = useState<Date | undefined>(
    slot?.startTime,
  );
  const [endTime, setEndTime] = useState<Date | undefined>(
    slot?.endTime,
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("slots");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Slot },
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
      toast.success(`Slot ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const slotParsed = await insertSlotParams.safeParseAsync({ ...payload }); 
    
    if (!slotParsed.success) {
      setErrors(slotParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = slotParsed.data;
    const pendingSlot: Slot = {
      updatedAt: slot?.updatedAt ?? new Date(),
      createdAt: slot?.createdAt ?? new Date(),
      id: slot?.id ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingSlot,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateSlotAction({ ...values, id: slot.id })
          : await createSlotAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingSlot
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

  useEffect(() => {
    console.log(endTime)
  }, [endTime])

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
      {/* Schema fields start */}
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.date ? "text-destructive" : "",
          )}
        >
          Date
        </Label>
        <br />
        <Popover>
          <Input
            name="date"
            onChange={() => { }}
            readOnly
            value={date?.toUTCString() ?? new Date().toUTCString()}
            className="hidden"
          />

          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] pl-3 text-left font-normal",
                !slot?.date && "text-muted-foreground",
              )}
            >
              {date ? (
                <span>{format(date, "PPP")}</span>
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              onSelect={(e) => {
                setDate(e)
                console.log(String(e))
              }}
              selected={date}
              disabled={(date) =>
                // allow 3 days in future
                date < new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000) ||
                date > new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors?.date ? (
          <p className="text-xs text-destructive mt-2">{errors.date[0]}</p>
        ) : (
          <div className="h-3" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.startTime ? "text-destructive" : "",
          )}
        >
          Start Time
        </Label>
        <br />
        <Input
          name="startTime"
          onChange={() => { }}
          readOnly
          value={startTime?.toUTCString()}
          className="hidden"
        />

        <TimePicker
          onChange={(e) => {
            setStartTime(e)
            console.log(e, 'sfds')
          }}
          value={startTime}
        />
        {errors?.startTime ? (
          <p className="text-xs text-destructive mt-2">{errors.startTime[0]}</p>
        ) : (
          <div className="h-3" />
        )}
      </div>

      <input 
        name="endTime"
        type="text" 
        className="hidden"
        // auto calculate endTime based on startTime, i.e 1 hour after startTime
        value={startTime && new Date(startTime?.getTime() + 60 * 60 * 1000).toUTCString()}
       />

       {
        startTime && <p className="text-gray-700">
          End Time: {new Date(startTime?.getTime() + 60 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
       }
      
      {/* <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.endTime ? "text-destructive" : "",
          )}
        >
          End Time
        </Label>
        <br />
        <Input
          name="endTime"
          onChange={() => { }}
          readOnly
          value={endTime?.toUTCString()}
          className="hidden"
        />

        <TimePicker
          onChange={(e) => setEndTime(e)}
          value={endTime}
        />
        {errors?.endTime ? (
          <p className="text-xs text-destructive mt-2">{errors.endTime[0]}</p>
        ) : (
          <div className="h-3" />
        )}
      </div> */}
      {/* Schema fields end */}

      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.isAvailable ? "text-destructive" : "",
          )}
          htmlFor="isAvailable"
        >
          Available
        </Label>
        <br />
        <Checkbox
          defaultChecked={slot?.isAvailable ?? true}
          name={'isAvailable'}
          className={cn(errors?.isAvailable ? "ring ring-destructive" : "")}
        />
        {errors?.isAvailable ? (
          <p className="text-xs text-destructive mt-2">{errors.isAvailable[0]}</p>
        ) : (
          <div className="h-3" />
        )}
      </div>


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
              addOptimistic && addOptimistic({ action: "delete", data: slot });
              const error = await deleteSlotAction(slot.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: slot,
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

export default SlotForm;


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
