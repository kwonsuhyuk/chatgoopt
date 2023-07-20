import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
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
  get,
  getDatabase,
  onChildAdded,
  onChildRemoved,
  onValue,
  push,
  ref,
  serverTimestamp,
  set,
  update,
} from "firebase/database";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentChannel, setIsLocked } from "../store/channelSlice";
import LockIcon from "@mui/icons-material/Lock";
import "./ChatMenu.css";
import { setChatAlarmNum } from "../store/chatAlarmSlice";

function ChatMenu() {
  const [channels, setChannels] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [channelDetail, setChannelDetail] = useState("");
  const [open, setOpen] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);
  const [listOpen, setListOpen] = useState(true);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [pw, setPW] = useState("");
  const { user, chatAlarmNum } = useSelector((state) => state);
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
    if (checked && pw.length !== 4) {
      setError("숫자 4자리를 입력해주세요");
      return;
    }
    const dataBase = getDatabase();
    const key = push(child(ref(dataBase), "channels")).key;
    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetail,
      password: pw,
      madeBy: user.currentUser.displayName,
    };
    const updates = {};
    updates["/channels/" + key] = newChannel;

    try {
      await update(ref(dataBase), updates);
      setChannelName("");
      setChannelDetail("");
      setPW("");
      handleClose();
      setError("");
    } catch (e) {
      console.error(e);
    }
  }, [
    channelDetail,
    channelName,
    handleClose,
    pw,
    checked,
    user.currentUser.displayName,
  ]);

  const changeChannel = useCallback(
    (channel) => {
      if (channel.id === activeChannelId) return;
      setActiveChannelId(channel.id);
      dispatch(setCurrentChannel(channel));
      dispatch(setIsLocked(channel.password));

      // 채팅 알림숫자 초기화하기
      const userRef = ref(getDatabase(), `users/${user.currentUser.uid}`);
      const channelClickTimeRef = child(
        userRef,
        `channelclicktime/${channel.id}`
      );

      // 현재 시간의 타임스탬프 생성
      const currentTimeStamp = serverTimestamp();

      // channelclicktime 경로에 현재 시간의 타임스탬프 저장
      set(channelClickTimeRef, currentTimeStamp);
    },

    [dispatch, activeChannelId, user.currentUser.uid]
  );

  useEffect(() => {
    const unsubscribe = onChildAdded(
      ref(getDatabase(), "channels"),
      (snapshot) => {
        setChannels((oldChannel) => [...oldChannel, snapshot.val()]);
      }
    );

    return () => {
      unsubscribe?.();
      setChannels([]);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onChildRemoved(
      ref(getDatabase(), "channels"),
      (snapshot) => {
        setChannels(
          channels.filter((channel) => channel.id !== channel.val().id)
        );
      }
    );
    return () => {
      unsubscribe();
    };
  }, [channels]);

  useEffect(() => {
    if (firstLoad) {
      dispatch(setCurrentChannel(null));
      setFirstLoad(false);
    }
  }, [firstLoad, dispatch]);

  const handleListOpen = (listOpen) => {
    setListOpen((listOpen) => !listOpen);
    dispatch(setCurrentChannel(null));
  };

  const lockChecked = useCallback((e) => {
    setChecked(e.target.checked);
  }, []);

  const handlePWChange = useCallback((event) => {
    const inputValue = event.target.value;

    // 입력된 값이 4자리 숫자인 경우에만 상태를 업데이트합니다.
    if (/^\d{4}$/.test(inputValue)) {
      setPW(inputValue);
    }
  }, []);

  return (
    <>
      <List className="chatMenuTitle">
        <ListItem
          secondaryAction={
            <IconButton
              sx={{ color: "gray", border: "3px solid tomato", padding: "0" }}
              onClick={handleClickOpen}>
              <AddIcon />
            </IconButton>
          }>
          <ListItemIcon sx={{ color: "#9A939B" }} onClick={handleListOpen}>
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
        <List className="chatMenuItem">
          {listOpen &&
            channels?.map((channel) => (
              <ListItem
                key={channel.id}
                onClick={() => changeChannel(channel)}
                selected={channel.id === activeChannelId}
                button>
                <ListItemText
                  primary={`# ${channel.name}`}
                  // secondary={` ${
                  //   chatAlarmNum[channel?.id]
                  // } 개 새 메시지가 있습니다!`}
                  // secondaryTypographyProps={{
                  //   style: {
                  //     color: "#5e67c3",
                  //   },
                  // }}
                  sx={{ wordBreak: "break-all", color: "#918890" }}
                />
                {channel.password ? <LockIcon /> : null}
                {
                  <span
                    style={{
                      backgroundColor: "#E86B79",
                      color: "whitesmoke",
                      padding: "2px 5px",
                      borderRadius: "10px",
                    }}>
                    {chatAlarmNum[channel?.id]}
                  </span>
                }
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

          <FormControlLabel
            value="start"
            control={
              <>
                <TextField
                  disabled={!checked}
                  margin="dense"
                  type="text"
                  variant="standard"
                  autoComplete="off"
                  placeholder="*  *  *  *"
                  onChange={handlePWChange}
                  inputProps={{ maxLength: 4 }}
                  sx={{
                    width: "100px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                />

                <Checkbox checked={checked} onChange={lockChecked} />
              </>
            }
            label="비밀번호 생성"
            labelPlacement="start"
          />

          {error ? (
            <Alert sx={{ mt: 3 }} severity="error">
              {error}
            </Alert>
          ) : null}
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
