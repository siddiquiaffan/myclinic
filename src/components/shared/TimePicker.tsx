import React, { useEffect, useState } from "react";
// import { Input, Button, Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// import { format, parseISO } from "date-fns";

interface TimePickerProps {
    value?: Date;
    onChange?: (selectedTime: Date) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
    const [time, setTime] = useState<Date>(value ?? new Date());
    // const [formattedTime, setFormattedTime] = useState<string>("");

    useEffect(() => {
        onChange?.(time)        
        // eslint-disable-next-line
    }, [time])

    const handleIncrement = (field: "hours" | "minutes") => {
        const newTime = new Date(time.getTime());
        if (field === "hours") {
            newTime.setHours(newTime.getHours() + 1);
        } else {
            newTime.setMinutes(newTime.getMinutes() + 1);
        }

        setTime(newTime);
    };

    const handleDecrement = (field: "hours" | "minutes") => {
        const newTime = new Date(time.getTime());
        if (field === "hours") {
            newTime.setHours(newTime.getHours() - 1);
        } else {
            newTime.setMinutes(newTime.getMinutes() - 1);
        }

        setTime(newTime)
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = new Date(time.getTime());
        const value = parseInt(event.target.value) || 0;

        if (event.target.name === "hours") {
            newTime.setHours(value);
        } else {
            newTime.setMinutes(value);
        }

        setTime(newTime);
        // setTime({ ...time, [event.target.name]: parseInt(event.target.value) });
    };

    const formattedTime = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;

    const handleTimeChange = () => {
        onChange?.(time);
    };

    useEffect(() => {
        console.log(time)
    }, [time])

    return (
        <div>
            <Popover>
                <PopoverTrigger asChild>
                    <Input value={formattedTime} onChange={handleInputChange} onBlur={handleTimeChange} />
                </PopoverTrigger>
                <PopoverContent>
                    <div className="flex items-center justify-between gap-2">
                        <span>Hours:</span>
                        <Button variant="outline" onClick={() => handleDecrement("hours")}>
                            -
                        </Button>
                        <Input type="number" name="hours" value={time.getHours()} onChange={handleInputChange} min={0} max={23} />
                        <Button variant="outline" onClick={() => handleIncrement("hours")}>
                            +
                        </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-2">
                        <span>Minutes:</span>
                        <Button variant="outline" onClick={() => handleDecrement("minutes")}>
                            -
                        </Button>
                        <Input type="number" name="minutes" value={time.getMinutes()} onChange={handleInputChange} min={0} max={59} />
                        <Button variant="outline" onClick={() => handleIncrement("minutes")}>
                            +
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default TimePicker;
