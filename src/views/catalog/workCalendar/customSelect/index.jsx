import React, { useState } from "react";
import { Select } from "antd";

const { Option } = Select;

const CustomSelect = ({ value = {}, onChange, options, disabledSelect }) => {
  const [start, setStart] = useState(undefined);
  const [end, setEnd] = useState(undefined);

  const triggerChange = (changedValue) => {
    onChange?.({
      start,
      end,
      ...value,
      ...changedValue,
    });
  };

  const onStartChange = (newStart) => {
    setStart(newStart);

    triggerChange({
      start: newStart,
    });
  };

  const onEndChange = (newEnd) => {
    setEnd(newEnd);

    triggerChange({
      end: newEnd,
    });
  };

  return (
    <>
      <Select
        value={value.start}
        style={{
          width: 80,
          margin: "0px 8px 0px 0px",
        }}
        onChange={onStartChange}
        placeholder="--:--"
        disabled={disabledSelect}
      >
        {options.map((value, index) => (
          <Option key={index} value={value}>
            {value}
          </Option>
        ))}
      </Select>
      -
      <Select
        value={value.end}
        style={{
          width: 80,
          margin: "0 8px",
        }}
        onChange={onEndChange}
        placeholder="--:--"
        disabled={disabledSelect}
      >
        {options.map((value, index) => (
          <Option key={index} value={value}>
            {value}
          </Option>
        ))}
      </Select>
    </>
  );
};

export default CustomSelect;
