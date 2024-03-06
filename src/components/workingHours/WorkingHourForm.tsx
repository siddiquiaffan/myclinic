import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/working-hours/useOptimisticWorkingHours";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";
import TimePicker from "@/components/shared/TimePicker";


import { type WorkingHour, insertWorkingHourParams } from "@/lib/db/schema/workingHours";
import {
  createWorkingHourAction,
  deleteWorkingHourAction,
  updateWorkingHourAction,
} from "@/lib/actions/workingHours";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const WorkingHourForm = ({
  
  workingHour,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  workingHour?: WorkingHour | null;
  
  openModal?: (workingHour?: WorkingHour) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<WorkingHour>(insertWorkingHourParams);
  const editing = !!workingHour?.id;
    const [startTime, setStartTime] = useState<Date | undefined>(
    workingHour?.startTime,
  );
  const [endTime, setEndTime] = useState<Date | undefined>(
    workingHour?.endTime,
  );
  const [day, setDay] = useState<number | string>(0);

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("working-hours");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: WorkingHour },
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
      toast.success(`WorkingHour ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const workingHourParsed = await insertWorkingHourParams.safeParseAsync({  ...payload });
    if (!workingHourParsed.success) {
      setErrors(workingHourParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = workingHourParsed.data;
    const pendingWorkingHour: WorkingHour = {
      updatedAt: workingHour?.updatedAt ?? new Date(),
      createdAt: workingHour?.createdAt ?? new Date(),
      id: workingHour?.id ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingWorkingHour,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateWorkingHourAction({ ...values, id: workingHour.id })
          : await createWorkingHourAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingWorkingHour 
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
              <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.dayOfWeek ? "text-destructive" : "",
          )}
        >
          Day Of Week
        </Label>
        <Select
          name="dayOfWeek"
          defaultValue={workingHour?.dayOfWeek as unknown as string}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Day" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="0">Sunday</SelectItem>
              <SelectItem value="1">Monday</SelectItem>
              <SelectItem value="2">Tuesday</SelectItem>
              <SelectItem value="3">Wednesday</SelectItem>
              <SelectItem value="4">Thursday</SelectItem>
              <SelectItem value="5">Friday</SelectItem>
              <SelectItem value="6">Saturday</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        {errors?.dayOfWeek ? (
          <p className="text-xs text-destructive mt-2">{errors.dayOfWeek[0]}</p>
        ) : (
          <div className="h-6" />
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
            onChange={() => {}}
            readOnly
            value={startTime?.toUTCString() ?? new Date().toUTCString()}
            className="hidden"
          />
        <TimePicker
          onChange={(e) => setEndTime(e)}
          value={endTime}
        />
        {errors?.startTime ? (
          <p className="text-xs text-destructive mt-2">{errors.startTime[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
<div>
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
            onChange={() => {}}
            readOnly
            value={endTime?.toUTCString() ?? new Date().toUTCString()}
            className="hidden"
          />
        <TimePicker
          onChange={(e) => setEndTime(e)}
          value={endTime}
        />

        {errors?.endTime ? (
          <p className="text-xs text-destructive mt-2">{errors.endTime[0]}</p>
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
              addOptimistic && addOptimistic({ action: "delete", data: workingHour });
              const error = await deleteWorkingHourAction(workingHour.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: workingHour,
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

export default WorkingHourForm;

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
