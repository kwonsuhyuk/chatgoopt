import { Button, MenuItem } from "@mui/material";
import React, { useState } from "react";
import "./AlarmItem.css";
import { useDispatch } from "react-redux";
import { deleteUserAlarms } from "../store/alarmSlice";

function AlarmItem({ value }) {
  const dispatch = useDispatch();

  const maxcontentLength = 6;
  const truncatedText =
    value.content.length > maxcontentLength
      ? value.content.substring(0, maxcontentLength) + "..."
      : value.content;
  const alarmText =
    value.type === "todo_tomorrow"
      ? "  마감일이 내일 입니다"
      : "todo_today"
      ? "  마감일이 오늘 입니다"
      : "채팅부분//";

  const handleClose = () => {
    dispatch(deleteUserAlarms(value));
  };

  return (
    <div className="alarm_Box">
      <MenuItem className="alarmItem" onClick={handleClose}>
        <span className="alarm_content">{truncatedText} </span>
        <br />
        <span className="alarm_message">{alarmText}</span>
      </MenuItem>
      <Button onClick={handleClose}>X</Button>
    </div>
  );
}

export default AlarmItem;
