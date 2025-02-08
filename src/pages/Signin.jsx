"use client";

import {
  Alert,
  Avatar,
  Box,
  Container,
  Grid,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { gsap } from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import LoginIcon from "@mui/icons-material/Login";
import LoadingButton from "@mui/lab/LoadingButton";
import { Link } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

function Signin() {
  const boxRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password).catch((error) => {
      const errorMessage = error.message;
      setError(errorMessage);
    });
    setLoading(false);
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const email = data.get("email");
      const password = data.get("password");

      if (!email || !password) {
        setError("모든 항목을 입력해주세요");
        return;
      }
      login(email, password);
    },
    [login]
  );

  const handleGuestLogin = useCallback(() => {
    login("test@naver.com", "qweqwe");
  }, [login]);

  useEffect(() => {
    const box = boxRef.current;
    gsap.fromTo(
      box,
      { backgroundColor: "black" },
      { backgroundColor: "white", duration: 1 }
    );
  }, []);

  useEffect(() => {
    if (!error) return;
    setTimeout(() => {
      setError("");
    }, 3000);
  }, [error]);

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
            Login
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="이메일 주소"
              name="email"
              autoComplete="off"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="비밀번호"
              name="password"
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
              로그인
            </LoadingButton>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleGuestLogin}
              disabled={loading}
              sx={{ mb: 2 }}>
              Guest 로그인
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link
                  to="/signup"
                  style={{ textDecoration: "none", color: "gray" }}>
                  계정이 없나요? 회원가입으로 이동
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </div>
  );
}

export default Signin;
