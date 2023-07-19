import {
  Box,
  Button,
  Divider,
  Grid,
  List,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import { useDispatch, useSelector } from "react-redux";
import ChatMessage from "./ChatMessage";
import "../firebase";
import {
  child,
  get,
  getDatabase,
  onChildAdded,
  onValue,
  orderByChild,
  query,
  ref,
  remove,
  serverTimestamp,
  set,
  startAt,
} from "firebase/database";
import LockTwoToneIcon from "@mui/icons-material/LockTwoTone";
import PinDigit from "../components/PinDigit";
import "./ChatMain.css";
import DeleteIcon from "@mui/icons-material/Delete";
import { setChatAlarmNum } from "../store/chatAlarmSlice";

function ChatMain() {
  const { user, channel } = useSelector((state) => state);
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [pinSolve, setPinSolve] = useState(false);
  const pinRef = useRef(null);
  const [channelDeleteOpen, setChannelDeleteOpen] = useState(false);
  const [lastOnlineTimestamp, setLastOnlineTimestamp] = useState(0);
  const dispatch = useDispatch();

  // 메시지 불러오기
  useEffect(() => {
    if (!channel.currentChannel) return;

    async function getMessages() {
      const snapshot = await get(
        child(ref(getDatabase()), "messages/" + channel.currentChannel.id)
      );
      setMessages(snapshot.val() ? Object.values(snapshot.val()) : []);
    }

    getMessages();

    return () => {
      setMessages([]);
    };
  }, [channel.currentChannel]);

  // 메시지 추가시 리스너 등록
  useEffect(() => {
    if (!channel.currentChannel) return;

    const sorted = query(
      ref(getDatabase(), "messages/" + channel.currentChannel.id),
      orderByChild("timestamp")
    );

    const unsubscribe = onChildAdded(
      query(sorted, startAt(Date.now())),
      (snapshot) =>
        setMessages((oldMessages) => [...oldMessages, snapshot.val()])
    );

    return () => {
      unsubscribe?.();
    };
  }, [channel.currentChannel, dispatch]);

  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 500);

    return () => {
      clearTimeout(setTimeoutId);
    };
  }, [messages.length]);

  const handlePinChange = (e) => {
    if (e.target.value.length <= 4) {
      setPin(e.target.value.toString());
    }
  };

  const handlePinClick = () => {
    pinRef.current.focus();
  };

  useEffect(() => {
    // 핀 4개 입력시 비밀번호 검사
    if (pin.length === 4) {
      if (channel.islocked !== pin) {
        setPinError(true);
        setPin("");
      } else {
        setPinSolve(true);
        setPinError(false);
        setPin("");
      }
    }
  }, [pin.length, channel.islocked, pin]);

  const getErrorText = () => {
    if (pinError) {
      return (
        <div style={{ color: "red", margin: "10px" }}>Invalid PassWord</div>
      );
    }
  };

  const handleSetModalOpen = useCallback(() => {
    setChannelDeleteOpen(true);
  }, []);

  const handleDeleteChannel = useCallback(async () => {
    await remove(ref(getDatabase(), "channels/" + channel.currentChannel?.id));
    await remove(ref(getDatabase(), "messages/" + channel.currentChannel?.id));
  }, [channel.currentChannel?.id]);

  const handleModalClose = useCallback(() => {
    setChannelDeleteOpen(false);
  }, []);
  const style_modal = {
    backgroundColor: "white",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    border: "2px solid whitesmoke",
    borderRadius: "20px",
    p: 4,
  };

  return (
    <>
      {!channel.currentChannel ? (
        <Grid container className="chat_basic" variant="outlined">
          <h1>Chat GOOOOOOÖPT</h1>
        </Grid>
      ) : !channel.islocked ? (
        <Grid
          container
          className="chat_main"
          component={Paper}
          variant="outlined"
          sx={{
            position: "relative",
            backgroundColor: "whitesmoke",
            boxShadow:
              "inset -3px -3px 1px white, inset 5px 5px 10px rgba(0, 0, 0, 0.3)",
          }}>
          <div
            style={{
              width: "100%",
              backgroundColor: "transparent",
              color: "gray",
              padding: "20px",
            }}>
            <span
              style={{
                border: "1px solid gray",
                padding: "3px",
                borderRadius: "20px",
              }}>
              <span style={{ color: "orange", padding: "2px" }}>
                {channel.currentChannel.madeBy}'s
              </span>{" "}
              Chat Room
            </span>

            {channel.currentChannel.madeBy === user.currentUser.displayName && (
              <span style={{ position: "absolute", right: "20px" }}>
                <DeleteIcon onClick={handleSetModalOpen} />
              </span>
            )}
            <Modal
              open={channelDeleteOpen}
              onClose={handleModalClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description">
              <Box style={style_modal}>
                <Typography
                  id="modal-modal-description"
                  sx={{ mt: 2, textAlign: "center" }}>
                  정말 삭제 하시겠습니까? (채팅내용도 모두 사라집니다!)
                </Typography>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button onClick={handleDeleteChannel}>확인</Button>
                  <Button onClick={handleModalClose}>취소</Button>
                </div>
              </Box>
            </Modal>
          </div>
          <List
            sx={{
              height: "67vh",
              overflow: "scroll",
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} user={user} />
            ))}
            <div ref={messageEndRef}></div>
          </List>
          <Divider />
          <ChatInput />
        </Grid>
      ) : pinSolve ? (
        <Grid
          container
          component={Paper}
          variant="outlined"
          sx={{
            position: "relative",
            backgroundColor: "whitesmoke",
            boxShadow:
              "inset -3px -3px 1px white, inset 5px 5px 10px rgba(0, 0, 0, 0.3)",
          }}>
          <div
            style={{
              width: "100%",
              backgroundColor: "transparent",
              color: "gray",
              padding: "20px",
              display: "flex",
            }}>
            <span
              style={{
                border: "1px solid gray",
                padding: "3px",
                borderRadius: "20px",
              }}>
              <span style={{ color: "orange", padding: "2px" }}>
                {channel.currentChannel.madeBy}'s
              </span>{" "}
              Chat Room
            </span>

            {channel.currentChannel.madeBy === user.currentUser.displayName && (
              <span style={{ position: "absolute", right: "20px" }}>
                <DeleteIcon onClick={handleSetModalOpen} />
              </span>
            )}

            <Modal
              open={channelDeleteOpen}
              onClose={handleModalClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description">
              <Box style={style_modal}>
                <Typography
                  id="modal-modal-description"
                  sx={{ mt: 2, textAlign: "center" }}>
                  정말 삭제 하시겠습니까? (채팅내용도 모두 사라집니다!)
                </Typography>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button onClick={handleDeleteChannel}>확인</Button>
                  <Button onClick={handleModalClose}>취소</Button>
                </div>
              </Box>
            </Modal>
          </div>
          <List
            sx={{
              height: "67vh",
              overflow: "scroll",
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} user={user} />
            ))}
            <div ref={messageEndRef}></div>
          </List>
          <Divider />
          <ChatInput />
        </Grid>
      ) : (
        <Grid
          container
          component={Paper}
          variant="outlined"
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "whitesmoke",
            boxShadow:
              "inset -3px -3px 1px white, inset 5px 5px 10px rgba(0, 0, 0, 0.3)",
            height: "85vh",
          }}>
          <LockTwoToneIcon
            className={pinError ? "moveEmoji" : null}
            sx={{ fontSize: "300px", marginBottom: "100px" }}
          />
          <div
            style={{
              marginTop: "30px",
              width: "350px",
              position: "absolute",
              bottom: "100px",
              left: "50%",
            }}>
            <div id="app-pin-wrapper">
              <input
                id="app-pin-hidden-input"
                maxLength={4}
                ref={pinRef}
                type="number"
                value={pin}
                onChange={handlePinChange}
              />
              <div id="app-pin" onClick={handlePinClick}>
                <PinDigit
                  focused={pin.length === 0}
                  value={pin[0]}
                  error={pinError}
                />
                <PinDigit
                  focused={pin.length === 1}
                  value={pin[1]}
                  error={pinError}
                />
                <PinDigit
                  focused={pin.length === 2}
                  value={pin[2]}
                  error={pinError}
                />
                <PinDigit
                  focused={pin.length === 3}
                  value={pin[3]}
                  error={pinError}
                />
              </div>
              <h3>{getErrorText()}</h3>
            </div>
          </div>
        </Grid>
      )}
    </>
  );
}

export default ChatMain;
