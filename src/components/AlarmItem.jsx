import { Button, MenuItem } from "@mui/material";
import React, { useState } from "react";
import "./AlarmItem.css";
import { useDispatch, useSelector } from "react-redux";
import { deleteUserAlarms } from "../store/alarmSlice";
import "../firebase";
import { getDatabase, ref, remove } from "firebase/database";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
function AlarmItem({ value, handleAlarmClose }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state);
  const dispatch = useDispatch();

  const maxcontentLength = 6;
  const truncatedText =
    value.content && value.content.length > maxcontentLength
      ? value.content.substring(0, maxcontentLength) + "..."
      : value.content;

  const alarmText =
    value.type === "todo_tomorrow"
      ? " 이 내일 마감입니다"
      : value.type === "todo_today" // 오류 수정: value.type === "todo_today"로 수정
      ? "  마감일이 오늘 입니다"
      : `${value.title}`;

  const handleClose = () => {
    handleAlarmClose();
    dispatch(deleteUserAlarms(value));
  };

  const handleCommentClose = () => {
    handleAlarmClose();
    navigate(`/board/${value.boardId}`);

    try {
      // Redux store에서 알림 데이터 삭제
      dispatch(deleteUserAlarms(value));

      // Firebase Realtime Database에서 알림 데이터 삭제
      const alarmRef = ref(
        getDatabase(),
        "users/" + user.currentUser.uid + "/alarms/" + value.id
      );
      remove(alarmRef);
    } catch (error) {
      console.error("Error deleting comment alarm:", error);
    }
  };

  return (
    <>
      {value.type === "todo_tomorrow" || value.type === "todo_today" ? (
        <div className="alarm_Box">
          <MenuItem className="alarmItem" onClick={handleClose}>
            <span className="alarm_content">{truncatedText} </span>
            <br />
            <span className="alarm_message">{alarmText}</span>
          </MenuItem>
        </div>
      ) : value.type === "comment" ? (
        <div className="alarm_Box comment">
          <MenuItem
            className="alarmItem"
            sx={{
              fontSize: "12px",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onClick={handleCommentClose}>
            <div>
              <span style={{ color: "#f7786b", fontSize: "18px" }}>
                {alarmText}
              </span>
              게시물에
            </div>
            <span style={{ color: "#f7786b", fontSize: "15px" }}>
              {value.username}
            </span>
            님이 댓글을 달았습니다.
          </MenuItem>
          <div
            style={{
              fontSize: "10px",
              color: "gray",
            }}>
            {dayjs(value.timestamp).fromNow()}
          </div>
        </div>
      ) : value.type === "like" ? (
        <div className="alarm_Box comment">
          <MenuItem
            className="alarmItem"
            sx={{
              fontSize: "12px",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onClick={handleCommentClose}>
            <div>
              <span style={{ color: "#f7786b", fontSize: "18px" }}>
                {alarmText}
              </span>
              게시물에
            </div>
            <span style={{ color: "#f7786b", fontSize: "15px" }}>
              {value.username}
            </span>
            님이 좋아요를 눌렀습니다.
          </MenuItem>
          <div
            style={{
              fontSize: "10px",
              color: "gray",
            }}>
            {dayjs(value.timestamp).fromNow()}
          </div>
        </div>
      ) : value.type === "dislike" ? (
        <div className="alarm_Box comment">
          <MenuItem
            className="alarmItem"
            sx={{
              fontSize: "12px",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onClick={handleCommentClose}>
            <div>
              <span style={{ color: "#f7786b", fontSize: "18px" }}>
                {alarmText}
              </span>
              게시물에
            </div>
            <span style={{ color: "#f7786b", fontSize: "15px" }}>
              {value.username}
            </span>
            님이 싫어요를 눌렀습니다.
          </MenuItem>
          <div
            style={{
              fontSize: "10px",
              color: "gray",
            }}>
            {dayjs(value.timestamp).fromNow()}
          </div>
        </div>
      ) : (
        <div className="alarm_Box comment">
          <MenuItem
            className="alarmItem"
            sx={{
              fontSize: "12px",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onClick={handleCommentClose}>
            <div>
              <span style={{ color: "#abc900", fontSize: "18px" }}>
                {alarmText}
              </span>
              게시물에
            </div>
            <span style={{ color: "#abc900", fontSize: "15px" }}>
              {value.username}
            </span>
            님이 언급 하였습니다.
          </MenuItem>
          <div
            style={{
              fontSize: "10px",
              color: "gray",
            }}>
            {dayjs(value.timestamp).fromNow()}
          </div>
        </div>
      )}
    </>
  );
}

export default AlarmItem;
