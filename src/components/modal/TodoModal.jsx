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
import React from "react";
import { CirclePicker } from "react-color";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function TodoModal({ open, handleClose }) {
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
              <DatePicker label="Due Date" />
            </DemoContainer>
          </LocalizationProvider>
          <CirclePicker />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={handleClose}>확인</Button>
      </DialogActions>
    </Dialog>
  );
}

export default TodoModal;
