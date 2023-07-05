import { Box, Divider, Grid, List, Paper } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import { useSelector } from "react-redux";
import ChatMessage from "./ChatMessage";
import "../firebase";
import {
  child,
  get,
  getDatabase,
  onChildAdded,
  orderByChild,
  query,
  ref,
  startAt,
} from "firebase/database";
import LockTwoToneIcon from "@mui/icons-material/LockTwoTone";
import PinDigit from "../components/PinDigit";
import "./ChatMain.css";

function ChatMain() {
  const { user, channel } = useSelector((state) => state);
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [pinSolve, setPinSolve] = useState(false);
  const pinRef = useRef(null);

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
  }, [channel.currentChannel]);

  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 2000);

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

  console.log(pin);

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

  return (
    <>
      {!channel.currentChannel ? (
        <Grid
          container
          component={Paper}
          variant="outlined"
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "whitesmoke",
            boxShadow:
              "inset -3px -3px 1px white, inset 5px 5px 10px rgba(0, 0, 0, 0.3)",
            height: "85vh",
          }}>
          <h1
            style={{
              fontSize: "50px",
              color: "gray",
              letterSpacing: "15px",
              fontFamily: "'Dancing Script', cursive",
            }}>
            Chat GOOOOOOÖPT
          </h1>
        </Grid>
      ) : !channel.islocked ? (
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
            }}>
            <span
              style={{
                border: "1px solid gray",
                padding: "3px",
                borderRadius: "20px",
              }}>
              <span style={{ color: "orange" }}>
                {channel.currentChannel.madeBy}'s
              </span>{" "}
              Chat Room
            </span>
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
              <ChatMessage
                key={message.timestamp}
                message={message}
                user={user}
              />
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
            }}>
            <span
              style={{
                border: "1px solid gray",
                padding: "3px",
                borderRadius: "20px",
              }}>
              <span style={{ color: "orange" }}>
                {channel.currentChannel.madeBy}'s
              </span>{" "}
              Chat Room
            </span>
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
              <ChatMessage
                key={message.timestamp}
                message={message}
                user={user}
              />
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
