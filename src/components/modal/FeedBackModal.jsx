import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
} from "@mui/material";
import { useCallback, useState } from "react";
import "../../firebase";
import { useSelector } from "react-redux";
import { getStorage, ref as refStorage, uploadString } from "firebase/storage";

function FeedBackModal({ open, handleClose }) {
  const { user } = useSelector((state) => state);
  const [value, setValue] = useState("");
  const handleSubmit = useCallback(async () => {
    if (!user.currentUser?.uid) return;

    const storageRef = refStorage(
      getStorage(),
      `feedback/${user.currentUser.displayName}`
    );
    uploadString(storageRef, value);
    handleClose();
  }, [user.currentUser.displayName, user.currentUser?.uid, value, handleClose]);

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
        },
      }}>
      <DialogTitle>
        사용하시면서 불편하시거나 오류 등 <br />
        자유롭게 피드백주시면 감사하겠습니다
      </DialogTitle>
      <Divider />
      <DialogContent>
        <TextField
          autoComplete="off"
          autoFocus
          label="feedback"
          type="text"
          onChange={(e) => setValue(e.target.value)}
          sx={{
            width: "90%",
            margin: "30px",
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={handleSubmit}>확인</Button>
      </DialogActions>
    </Dialog>
  );
}

export default FeedBackModal;
