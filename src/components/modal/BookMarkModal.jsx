import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import "../../firebase";
import { child, getDatabase, push, ref, update } from "firebase/database";
import { useSelector } from "react-redux";

function BookMarkModal({ open, handleClose }) {
  const { user } = useSelector((state) => state);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [favicon, setFavicon] = useState("");

  const handleUrlFav = (e) => {
    setUrl(e.currentTarget.value);
    setFavicon(
      "https://s2.googleusercontent.com/s2/favicons?domain=" +
        e.currentTarget.value
    );
  };

  const handleSubmit = useCallback(async () => {
    const db = getDatabase();
    const key = push(
      child(ref(db), "users/" + user.currentUser.uid + "/bookmark/")
    ).key;
    const bookMark = {
      name: name,
      url: url,
      favicon: favicon,
      id: key,
    };

    const updates = {};
    updates["users/" + user.currentUser.uid + "/bookmark/" + key] = bookMark;

    try {
      await update(ref(db), updates);
      handleClose();
    } catch (e) {
      console.error(e);
      handleClose();
    }
  }, [handleClose, favicon, name, url, user.currentUser.uid]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>등록할 BookMark를 입력하세요</DialogTitle>
      <Divider />
      <DialogContent>
        <TextField
          label="Name"
          fullWidth
          type="text"
          autoFocus
          autoComplete="off"
          onChange={(e) => setName(e.currentTarget.value)}
          variant="standard"
          sx={{ marginBottom: "20px" }}
        />
        <TextField
          label="URL"
          fullWidth
          type="text"
          onChange={handleUrlFav}
          autoComplete="off"
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={handleSubmit}>확인</Button>
      </DialogActions>
    </Dialog>
  );
}

export default BookMarkModal;
