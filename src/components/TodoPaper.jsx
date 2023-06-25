import React, { useCallback, useState } from "react";
import "./TodoPaper.css";
import { Button } from "@mui/material";
import "../firebase";
import { useSelector } from "react-redux";
import { getDatabase, ref, remove } from "firebase/database";

function TodoPaper({ id, todo }) {
  const { user } = useSelector((state) => state);
  const [content, setContent] = useState(todo.todoMessage);
  const [color, setColor] = useState(todo.color);
  const [dueDates, setDueDates] = useState(todo.dueDates);

  const handleDelete = useCallback(async () => {
    await remove(
      ref(getDatabase(), "users/" + user.currentUser.uid + "/todos/" + todo.id)
    );
  }, [user.currentUser.uid, todo.id]);

  return (
    <div
      className="postit"
      id={id}
      style={{
        background: `linear-gradient(180deg, ${color} 20%, ${color} 40% ,white 100%)`,
        position: "relative",
      }}>
      <div className="tape"></div>
      <p className="content">{content}</p>
      <p className="dueDates">~{dueDates}</p>
      <Button
        onClick={handleDelete}
        sx={{ position: "absolute", bottom: 0, right: 0 }}>
        X
      </Button>
    </div>
  );
}

export default TodoPaper;
