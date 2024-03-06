import React from 'react'

interface TimeSelectorProps {
  onSelect: (time: Date) => void
  selected: Date
}

const TimeSelector = () => {
  return (
    <div>TimeSelector</div>
  )
}

export default TimeSelector