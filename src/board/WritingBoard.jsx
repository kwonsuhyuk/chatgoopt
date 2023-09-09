import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Input,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import "../firebase";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
import PhotoIcon from "@mui/icons-material/Photo";
import BoardImageModal from "../components/modal/BoardImageModal";
import {
  child,
  getDatabase,
  push,
  ref,
  serverTimestamp,
  set,
} from "firebase/database";

function WritingBoard() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { theme, user } = useSelector((state) => state);
  const [checked, setChecked] = useState(false);
  const [checkedYoutube, setcheckedYoutube] = useState(false);
  const [title, setTitle] = useState("");
  const [imageList, setImageList] = useState([]);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [content, setContent] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");

  const handleAddImage = () => {
    setOpenImageModal(true);
  };

  const handleClickClose = () => {
    setOpenImageModal(false);
  };

  const handleImageDelete = (index) => {
    const newImageList = imageList.filter((_, i) => i !== index);
    setImageList(newImageList);
  };

  const handleCheckboxChange = (event) => {
    setChecked(event.target.checked);
  };

  const handleYoutubeCheckboxChange = (event) => {
    setcheckedYoutube(event.target.checked);
  };

  const navigate = useNavigate();
  const handleBackMain = () => {
    navigate("/board");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const dbRef = ref(getDatabase(), "board");
      const newPostRef = push(dbRef);
      const key = newPostRef.key; // 생성된 키를 가져옴

      const formData = {
        id: key, // 생성된 키를 데이터에 포함
        notice: checked,
        title: title,
        content: content,
        images: imageList,
        youtubeLink: checkedYoutube ? youtubeLink : null,
        user: {
          id: user.currentUser.uid,
          name: user.currentUser.displayName,
          avatar: user.currentUser.photoURL,
        },
        timestamp: serverTimestamp(),
      };

      // 폼 데이터를 Firebase 실시간 데이터베이스에 저장
      await set(newPostRef, formData); // 생성된 키를 경로로 사용
    } catch (error) {
      console.error("폼 데이터 제출 중 오류가 발생하였습니다:", error);
    } finally {
      handleBackMain();
      setTitle("");
      setContent("");
      setImageList([]);
      setChecked(false);
      setcheckedYoutube(false); // 유튜브 삽입 체크박스 초기화
      setYoutubeLink(""); // 유튜브 링크 초기화
    }
  };
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const borderStyle = "2px solid whitesmoke";

  return (
    <Box
      sx={{
        minHeight: "91vh",
        backgroundColor: "transparent",
        padding: "9vh 20vw 0",
      }}>
      <Box
        sx={{
          borderRadius: "20px",
          border: borderStyle,
          backgroundColor: "rgba(5,5,5,0.3)",
          boxShadow:
            "inset -3px -3px 10px rgba(0, 0, 0, 0.2), inset 5px 5px 10px rgba(0, 0, 0, 0.2)",
        }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <ArrowBackIcon
            onClick={handleBackMain}
            sx={{
              color: "white",
            }}
          />
          <Box>
            <button
              onClick={handleBackMain}
              style={{
                border: "1px solid white",
                borderRadius: "10px",
                backgroundColor: "transparent",
                margin: "10px",
                padding: "10px",
                color: "white",
              }}>
              취소
            </button>
            <button
              onClick={handleSubmit}
              style={{
                border: "none",
                borderRadius: "10px",
                margin: "10px",
                padding: "10px",
                backgroundColor: "white",
                color: "black",
              }}>
              완료
            </button>
          </Box>
        </Box>
        <Divider />
        <Box
          component="form"
          sx={{
            padding: "2vh 5vw",
          }}>
          <TextField
            sx={{
              width: "80%",
              placeholder: { color: "white" },
              borderBottom: "2px solid white",
            }}
            color="success"
            name="title"
            variant="standard"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            InputProps={{
              placeholder: "제목",
              style: {
                color: "white",
                fontSize: "20px", // 글자 크기를 16px로 지정
                fontWeight: "bold", // 글자 두께를 굵게 지정
              },
              maxLength: 40,
            }}
          />
          <Divider sx={{ margin: "20px 0 10px" }} />
          <Box
            sx={{ display: "flex", alignItems: "center", overflowX: "hidden" }}>
            <PhotoIcon
              onClick={handleAddImage}
              sx={{
                cursor: "pointer",
                width: "30px",
                height: "30px",
                color: "white",
              }}
            />
            {imageList.length === 0 && (
              <FormControlLabel
                value="start"
                sx={{ color: "white" }}
                control={
                  <>
                    <Checkbox
                      sx={{ color: "white" }}
                      checked={checkedYoutube}
                      onChange={handleYoutubeCheckboxChange}
                    />
                  </>
                }
                label="유튜브 삽입"
                labelPlacement="start"
              />
            )}
            {user.currentUser.uid === "8IAW2DPyJGXAMPIassY57YMpkqB2" && (
              <FormControlLabel
                value="start"
                sx={{ color: "white" }}
                control={
                  <>
                    <Checkbox
                      sx={{ color: "white" }}
                      checked={checked}
                      onChange={handleCheckboxChange}
                    />
                  </>
                }
                label="공지"
                labelPlacement="start"
              />
            )}
            {checkedYoutube && (
              <>
                <Typography
                  sx={{
                    color: "white",
                    borderRadius: "20px",
                    margin: "0 20px",
                  }}
                  aria-owns={open ? "mouse-over-popover" : undefined}
                  aria-haspopup="true"
                  onMouseEnter={handlePopoverOpen}
                  onMouseLeave={handlePopoverClose}>
                  (유튜브 쇼츠 넣는법)
                </Typography>
                <Popover
                  id="mouse-over-popover"
                  sx={{
                    pointerEvents: "none",
                  }}
                  open={open}
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  onClose={handlePopoverClose}
                  disableRestoreFocus>
                  <Typography sx={{ p: 1, width: "20vw" }}>
                    유튜브의 쇼츠링크전체를 복사 붙혀넣기 (현재 쇼츠 링크만
                    지원함)
                  </Typography>
                </Popover>
                <Input
                  sx={{
                    borderBottom: "1px solid white",
                    color: "white",
                    width: "50%",
                  }}
                  placeholder="유튜브 링크를 삽입해주세요"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                />
              </>
            )}

            {imageList?.length > 0 &&
              imageList.map((image, index) => (
                <div style={{ position: "relative" }}>
                  <img
                    key={index}
                    src={image}
                    alt="미리보기이미지"
                    style={{
                      marginLeft: "20px",
                      padding: "0 10px",
                      width: "70px",
                      height: "70px",
                    }}
                  />
                  <button
                    onClick={() => handleImageDelete(index)}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      border: "none",
                      borderRadius: "50%",
                      color: "black",
                      backgroundColor: "white",
                    }}>
                    x
                  </button>
                </div>
              ))}
          </Box>
          <Divider sx={{ margin: "10px 0 10px" }} color="white" />
          <textarea
            name="content"
            rows={8} // 입력 영역의 행 수를 지정
            value={content}
            onChange={(event) => setContent(event.target.value)}
            style={{
              width: "95%",
              height: "60vh",
              backgroundColor: "rgba(5,5,5,0.3)",
              boxShadow:
                "inset -3px -3px 10px rgba(0, 0, 0, 0.2), inset 5px 5px 10px rgba(0, 0, 0, 0.2)",
              outline: "none",
              fontSize: "16px",
              fontFamily: "sans-serif",
              color: "white",
            }}
          />
        </Box>
      </Box>
      <BoardImageModal
        open={openImageModal}
        handleClose={handleClickClose}
        setImage={setImageList}
      />
    </Box>
  );
}

export default WritingBoard;
