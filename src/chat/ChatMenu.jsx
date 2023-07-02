import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import React, { useCallback, useEffect, useState } from "react";
import "../firebase";
import {
  child,
  getDatabase,
  onChildAdded,
  push,
  ref,
  update,
} from "firebase/database";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentChannel } from "../store/channelSlice";

function ChatMenu() {
  const { channel } = useSelector((state) => state);
  const [channels, setChannels] = useState();
  const [channelName, setChannelName] = useState("");
  const [channelDetail, setChannelDetail] = useState("");
  const [open, setOpen] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);
  const [listOpen, setListOpen] = useState(true);
  const dispatch = useDispatch();

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleClickOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleChangeChannelName = useCallback((e) => {
    setChannelName(e.target.value);
  }, []);

  const handleChangeChannelDetail = useCallback((e) => {
    setChannelDetail(e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    const dataBase = getDatabase();
    const key = push(child(ref(dataBase), "chnnels")).key;
    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetail,
    };
    const updates = {};
    updates["/channels/" + key] = newChannel;

    try {
      await update(ref(dataBase), updates);
      setChannelName("");
      setChannelDetail("");
      handleClose();
    } catch (e) {
      console.error(e);
    }
  }, [channelDetail, channelName, handleClose]);

  const changeChannel = useCallback(
    (channel) => {
      if (channel.id === activeChannelId) return;
      setActiveChannelId(channel.id);
      dispatch(setCurrentChannel(channel));
    },

    [dispatch, activeChannelId]
  );

  useEffect(() => {
    const unsubscribe = onChildAdded(
      ref(getDatabase(), "channels"),
      (snapshot) => {
        setChannels((oldChannel) => [...oldChannel, snapshot.val()]);
      }
    );

    return () => {
      setChannels([]);
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (firstLoad) {
      dispatch(setCurrentChannel(null));
      setFirstLoad(false);
    }
  }, [firstLoad, dispatch]);

  return (
    <>
      <List sx={{ overflow: "auto", width: 240 }}>
        <ListItem
          secondaryAction={
            <IconButton sx={{ color: "gray" }} onClick={handleClickOpen}>
              <AddIcon />
            </IconButton>
          }>
          <ListItemIcon
            sx={{ color: "#9A939B" }}
            onClick={(listOpen) => setListOpen((listOpen) => !listOpen)}>
            <ArrowDropDownIcon
              sx={{
                transform: listOpen ? "rotate(0deg)" : "rotate(-180deg)",
                transition: ".5s linear",
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary="채널"
            sx={{ wordBreak: "break-all", color: "gray" }}
          />
        </ListItem>
        <List>
          {listOpen &&
            channels?.map((channel) => (
              <ListItem
                key={channel.id}
                onClick={() => changeChannel(channel)}
                selected={channel.id === activeChannelId}
                button>
                <ListItemText
                  primary={`# ${channel.name}`}
                  sx={{ wordBreak: "break-all", color: "#918890" }}
                />
              </ListItem>
            ))}
        </List>
      </List>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>채널 추가</DialogTitle>
        <DialogContent>
          <DialogContentText>
            생성할 채널명과 설명을 입력해주세요.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="채널명"
            type="text"
            fullWidth
            variant="standard"
            onChange={handleChangeChannelName}
            autoComplete="off"
          />
          <TextField
            margin="dense"
            label="설명"
            type="text"
            fullWidth
            variant="standard"
            onChange={handleChangeChannelDetail}
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleSubmit}>생성</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ChatMenu;
