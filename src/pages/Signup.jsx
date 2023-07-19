import {
  Alert,
  Avatar,
  Box,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { gsap } from "gsap";
import React, { useCallback, useEffect, useRef, useState } from "react";
import LoginIcon from "@mui/icons-material/Login";
import LoadingButton from "@mui/lab/LoadingButton";
import { Link } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
import md5 from "md5";
import { getDatabase, ref, set } from "firebase/database";

function Signup() {
  const boxRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const sendUserInfo = useCallback(
    async (name, email, password) => {
      setLoading(true);
      try {
        const auth = getAuth();
        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(user, {
          displayName: name,
          photoURL: `https://www.gravatar.com/avatar/${md5(email)}?d=retro`,
        });
        await set(ref(getDatabase(), "users/" + user.uid), {
          name: user.displayName,
          avatar: user.photoURL,
          id: user.uid,
        });
        dispatch(setUser(user));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      const name = data.get("nickname");
      const email = data.get("email");
      const password = data.get("password");
      const confirmPW = data.get("confirmPW");

      if (!name || !email || !password || !confirmPW) {
        setError("모든 항목을 입력해주세요");
        return;
      }
      if (
        password !== confirmPW ||
        password.length < 6 ||
        confirmPW.length < 6
      ) {
        setError("비밀번호를 확인해 주세요");
        return;
      }

      sendUserInfo(name, email, password);
    },
    [sendUserInfo]
  );

  useEffect(() => {
    const box = boxRef.current;
    gsap.fromTo(
      box,
      { backgroundColor: "black" },
      { backgroundColor: "white", duration: 1 }
    );
  }, []);

  return (
    <div
      ref={boxRef}
      style={{
        height: "100vh",
        backgroundColor: "white",
      }}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}>
          <Avatar sx={{ m: 1, bgcolor: "black" }}>
            <LoginIcon />
          </Avatar>
          <Typography component="h1" variant="h5" color="black">
            Signup
          </Typography>
          <div style={{ color: "gray", margin: "20px" }}>
            <Typography>
              사이트가 처음이시라면 들어가셔서 사이트 왼쪽상단
              <br /> 물음표 아이콘을 클릭해 설명을 읽어보세요!
            </Typography>
          </div>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="닉네임"
              name="nickname"
              autoComplete="off"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="이메일 주소"
              name="email"
              autoComplete="off"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="비밀번호"
              name="password"
              type="password"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="비밀번호확인"
              name="confirmPW"
              type="password"
            />

            {error ? (
              <Alert sx={{ mt: 3 }} severity="error">
                {error}
              </Alert>
            ) : null}
            <LoadingButton
              type="submit"
              fullWidth
              variant="outlined"
              color="primary"
              loading={loading}
              sx={{ mt: 3, mb: 2 }}>
              회원가입
            </LoadingButton>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link
                  to="/signin"
                  style={{ textDecoration: "none", color: "gray" }}>
                  이미 계정이 있나요? 로그인으로 이동
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Box></Box>
      </Container>
    </div>
  );
}

export default Signup;
