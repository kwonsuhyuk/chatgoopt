import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  TextField,
} from "@mui/material";
import "../../firebase";
import React, { useCallback, useState } from "react";
import { CirclePicker } from "react-color";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { child, getDatabase, push, ref, set, update } from "firebase/database";
import { useSelector } from "react-redux";

function TodoModal({ open, handleClose }) {
  const { user } = useSelector((state) => state);
  const [color, setColor] = useState("#f44336");
  const [dueDate, setDueDate] = useState(new Date());
  const [todo, setTodo] = useState("");

  const handleSubmit = useCallback(async () => {
    const database = getDatabase();
    const key = push(
      child(ref(database), "users/" + user.currentUser.uid + "/todos/")
    ).key;
    const todos = {
      todoMessage: todo,
      dueDates: `${
        dueDate.getMonth() + 1
      }/${dueDate.getDate()}/${dueDate.getFullYear()}`,
      color: color,
      id: key,
    };

    const updates = {};
    updates["users/" + user.currentUser.uid + "/todos/" + key] = todos;

    try {
      await update(ref(database), updates);
      handleClose();
    } catch (e) {
      console.error(e);
    }
  }, [handleClose, user.currentUser.uid, color, todo, dueDate]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          position: "fixed",
          top: "10",
          left: "10",
          width: "50vw",
          height: "50vh",
        },
      }}>
      <DialogTitle>추가할 할일을 작성하세요</DialogTitle>
      <LinearProgress />
      <DialogContent>
        <TextField
          autoComplete="off"
          label="todo"
          onChange={(e) => setTodo(e.currentTarget.value)}
          type="text"
          sx={{
            width: "90%",
            margin: "30px",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            width: "90%",
            margin: "30px",
          }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DatePicker"]}>
              <DatePicker label="Due Date" onChange={(e) => setDueDate(e.$d)} />
            </DemoContainer>
          </LocalizationProvider>
          <CirclePicker onChange={(color, event) => setColor(color.hex)} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={handleSubmit}>확인</Button>
      </DialogActions>
    </Dialog>
  );
}

export default TodoModal;
