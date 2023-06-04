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
import React, { useEffect, useRef } from "react";
import LoginIcon from "@mui/icons-material/Login";
import LoadingButton from "@mui/lab/LoadingButton";
import { Link } from "react-router-dom";

function Signin() {
  const boxRef = useRef(null);

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
            Login
          </Typography>
          <Box
            component="form"
            noValidate
            // onSubmit={handleSubmit}
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

            {/* {error ? (
              <Alert sx={{ mt: 3 }} severity="error">
                {error}
              </Alert>
            ) : null} */}
            <LoadingButton
              type="submit"
              fullWidth
              variant="outlined"
              color="primary"
              // loading={loading}
              sx={{ mt: 3, mb: 2 }}>
              로그인
            </LoadingButton>
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
