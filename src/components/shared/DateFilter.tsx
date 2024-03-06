import React, { useEffect } from 'react'
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { date } from "zod";
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";

interface DateFilterProps {
    page: string,
    initialDate?: Date
}

const DateFilter: React.FC<DateFilterProps> = ({ page, initialDate }) => {
    const router = useRouter()
    const [filterDate, setFilterDate] = React.useState<Date>(initialDate ?? new Date(new Date().setHours(0, 0, 0)))

    const handleDateChange = () => {
        router.push(page + "?date=" + format(filterDate, "yyyy-MM-dd"))
    }

    useEffect(() => {
        handleDateChange()
        // eslint-disable-next-line
    }, [filterDate])

  return (
      <form>
          <Popover>
              <PopoverTrigger asChild>
                  <Button
                      variant={"outline"}
                      className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                      )}
                  >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterDate ? format(filterDate, "PPP") : <span>Pick a date</span>}
                  </Button>
              </PopoverTrigger>
              <PopoverContent
                  align="start"
                  className="flex w-auto flex-col space-y-2 p-2"
              >
                  <Select
                      onValueChange={(value) =>
                          setFilterDate(addDays(new Date(), parseInt(value)))
                      }
                  >
                      <SelectTrigger>
                          <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                          <SelectItem value="0">Today</SelectItem>
                          <SelectItem value="1">Tomorrow</SelectItem>
                          <SelectItem value="3">In 3 days</SelectItem>
                          <SelectItem value="7">In a week</SelectItem>
                      </SelectContent>
                  </Select>
                  <div className="rounded-md border">
                      <Calendar mode="single" disabled={() => {
                          return false
                      }} selected={filterDate} onSelect={setFilterDate as any} />
                  </div>
              </PopoverContent>
          </Popover>
      </form>  )
}

export default DateFilter