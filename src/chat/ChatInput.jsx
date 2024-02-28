import {
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  TextField,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import ImageIcon from "@mui/icons-material/Image";
import SendIcon from "@mui/icons-material/Send";
import ImageModal from "../components/modal/ImageModal";
import "../firebase";
import {
  getDatabase,
  push,
  ref,
  serverTimestamp,
  set,
} from "firebase/database";
import { useSelector } from "react-redux";

function ChatInput() {
  const { user, channel, theme } = useSelector((state) => state);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageOpenModal, setImageOpenModal] = useState(false);
  const [percent, setPercent] = useState(0);

  const handleChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);

  const createMessage = useCallback(
    () => ({
      timestamp: serverTimestamp(),
      user: {
        id: user.currentUser.uid,
        name: user.currentUser.displayName,
        avatar: user.currentUser.photoURL,
      },
      content: message,
    }),
    [
      message,
      user.currentUser.uid,
      user.currentUser.displayName,
      user.currentUser.photoURL,
    ]
  );

  const handleClickOpen = useCallback(() => {
    setImageOpenModal(true);
  }, []);

  const handleClickClose = useCallback(() => {
    setImageOpenModal(false);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!message) return;
    setLoading(true);

    try {
      await set(
        push(ref(getDatabase(), "messages/" + channel.currentChannel.id)),
        createMessage()
      );
      setLoading(false);
      setMessage("");
    } catch (e) {
      setMessage("");
      setLoading(false);
    }
  }, [message, channel.currentChannel?.id, createMessage]);

  const keyEnter = useCallback(
    (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <Grid container sx={{ p: "20px" }}>
      <Grid
        item
        xs={12}
        sx={{
          position: "relative",
        }}>
        <TextField
          sx={{
            input: { color: "white" },
            label: { color: "white" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton onClick={handleClickOpen}>
                  <ImageIcon sx={{ color: "white" }} />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="start">
                <IconButton disabled={loading} onClick={sendMessage}>
                  <SendIcon sx={{ color: "white" }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          fullWidth
          onKeyPress={keyEnter}
          label="메시지를 입력하세요"
          autoComplete="off"
          value={message}
          onChange={handleChange}
        />
        {uploading ? (
          <Grid item xs={12} sx={{ m: "10px" }}>
            <LinearProgress variant="determinate" value={percent} />
          </Grid>
        ) : null}
        <ImageModal
          open={imageOpenModal}
          handleClose={handleClickClose}
          setPercent={setPercent}
          setUploading={setUploading}
        />
      </Grid>
    </Grid>
  );
}

export default ChatInput;
