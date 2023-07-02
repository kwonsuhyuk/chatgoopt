import { Box, Divider, Grid, List, Paper } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
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

function ChatMain() {
  const { user, channel } = useSelector((state) => state);
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef();

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

  return (
    <>
      {channel.currentChannel ? (
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
          <List
            sx={{
              height: "73vh",
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
      )}
    </>
  );
}

export default ChatMain;
