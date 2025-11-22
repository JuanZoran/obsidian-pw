import * as React from "react";

interface TodayHoursComponentProps {
  startTime: string;
  endTime: string;
  defaultStartHour: string;
  defaultEndHour: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export function TodayHoursComponent({
  startTime,
  endTime,
  defaultStartHour,
  defaultEndHour,
  onStartTimeChange,
  onEndTimeChange
}: TodayHoursComponentProps) {
  return (
    <div className="pw-today-hours-container">
      <h3>今日工作时段</h3>
      <div className="pw-today-hours-inputs">
        <div className="pw-today-hours-input">
          <label>开始：</label>
          <input 
            type="time" 
            value={startTime} 
            onChange={(e) => onStartTimeChange(e.target.value)} 
          />
        </div>
        <div className="pw-today-hours-input">
          <label>结束：</label>
          <input 
            type="time" 
            value={endTime} 
            onChange={(e) => onEndTimeChange(e.target.value)} 
          />
        </div>
        <button 
          className="pw-today-hours-reset" 
          onClick={() => {
            onStartTimeChange(defaultStartHour);
            onEndTimeChange(defaultEndHour);
          }}
        >
          重置为默认
        </button>
      </div>
    </div>
  );
}
