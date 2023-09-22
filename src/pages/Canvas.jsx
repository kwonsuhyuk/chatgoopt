import React, { useEffect, useRef, useState } from "react";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { Link } from "react-router-dom";

import "./Canvas.css";
function Canvas() {
  const canvaRef = useRef(null);
  const colorRef = useRef();
  const modeRef = useRef();
  const settingRef = useRef();
  const wordRef = useRef();
  const [getCtx, setGetCtx] = useState(null);
  const [painting, setPainting] = useState(false);
  const [touch, setTouch] = useState(false);
  const [lineWidth, setLineWidth] = useState(10);
  const [view, setView] = useState("hidden");
  const [randomWord, setRandomWord] = useState("");

  // const addLine = (point) => {
  //   setLines((prevLines) => [...prevLines, point]);
  // };

  //그릴때 스크롤바 없애기
  const preventScroll = (event) => {
    event.preventDefault();
  };
  //지우기기능
  const onErase = () => {
    const canvas = canvaRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#ffffff";
  };
  //색깔 input color에서 고르기
  const selectColor = (event) => {
    const canvas = canvaRef.current;
    const ctx = canvas.getContext("2d");
    const colorValue = event.target.value;
    ctx.strokeStyle = colorValue;
    ctx.fillStyle = colorValue;
  };
  //색깔 data-color에서 고르기
  const clickColor = (event) => {
    const color = event.target.dataset.color;
    const canvas = canvaRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
  };
  //연필두께 설정하기
  const fixLineWidth = (event) => {
    setLineWidth(event.target.value);

    const canvas = canvaRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = event.target.value;
  };
  //그리기 처음 세팅
  useEffect(() => {
    const canvas = canvaRef.current;
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.7;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#000000";
    setGetCtx(ctx);
  }, []);
  ///////////////////////////////////////////데스크톱 그리기
  const drawFn = (e) => {
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;
    if (!painting) {
      getCtx.beginPath();
      getCtx.moveTo(mouseX, mouseY);
    } else {
      setView("hidden");
      getCtx.lineTo(mouseX, mouseY);
      getCtx.stroke();
    }
  };
  //////////////////////////////////////////모바일 그리기
  const startDrawing = (event) => {
    setTouch(true);
    const { clientX, clientY } = event.touches[0];
    const rect = canvaRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
    getCtx.beginPath();
    getCtx.moveTo(offsetX, offsetY);
    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventScroll, { passive: false });
  };
  const draw = (event) => {
    if (!touch) return;
    setView("hidden");
    const { clientX, clientY } = event.touches[0];
    const rect = canvaRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
    getCtx.lineTo(offsetX, offsetY);
    getCtx.stroke();
    // addLine({ x: offsetX, y: offsetY });
  };
  const stopDrawing = () => {
    setTouch(false);
    getCtx.closePath();
    document.body.style.overflow = "auto";
    document.removeEventListener("touchmove", preventScroll);
  };
  /////////////////////////////////////////////////////////
  //베경색 바꾸기
  const changeBackgroundColor = (event) => {
    const canvas = canvaRef.current;
    canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
  };
  //그림전체 삭제하기
  const onReset = () => {
    const canvas = canvaRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };
  //메뉴바 보이게하기
  const viewSetting = () => {
    if (view === "hidden") {
      setView("visible");
    } else {
      setView("hidden");
    }
  };
  //단어 배열
  const words = [
    "사과",
    "바나나",
    "체리",
    "권수혁",
    "나초",
    "담배",
    "바다거북이",
    "골대",
    "건물",
    "군기교육대",
    "기린",
    "기름",
    "굴뚝",
    "배추흰나비",
    "늑대",
    "가죽",
    "비닐하우스",
    "냄비",
    "넝쿨",
    "공대공미사일",
    "낙타",
    "독감",
    "목포는항구다",
    "대문",
    "레오나르도다빈치",
    "독서",
    "다비드비야",
    "라면",
    "미술관옆동물원",
    "아라한장풍대작전",
    "봄여름가을겨울",
    "롤러코스터",
    "팔월의크리스마스",
    "모기",
    "목사",
    "맨홀",
    "스티븐호킹",
    "프리미어리그",
    "벽돌",
    "아메리카노",
    "불꽃",
    "시골",
    "선물",
    "생일",
    "석유",
    "석탄",
    "단거리달리기",
    "여름",
    "해리포터",
    "전술",
    "장착",
    "허수아비",
    "진땀",
    "짐꾼",
    "출발",
    "호로비츠를위하여",
    "청년",
    "철탑",
    "참깨",
    "캠핑",
    "튜브",
    "표현",
    "옵티머스프라임",
    "함장",
    "크리스마스이브",
    "꽁초",
    "베트남",
    "마름모",
    "덩크슛",
    "라디오",
    "송곳니",
    "손흥민",
    "진달래",
    "첫날밤",
    "키보드",
    "탈영병",
    "박성수",
    "패싸움",
    "관자놀이",
    "미식축구",
    "신용카드",
    "이목구비",
    "야반도주",
    "아주머니",
    "전자제품",
    "특수문자",
    "페널티킥",
    "기상관측소",
  ];
  //랜덤단어 나타나기
  const generateRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    setRandomWord(words[randomIndex]);
  };
  useEffect(() => {
    generateRandomWord();
  }, []);
  //그림저장하고 catchmind에 데이터 보내기

  // const [imageURL, setImageURL] = useState([]);
  // const addImageURL = () => {
  //   const newImageURL = {
  //     id: imageURL.length + 1,
  //     name: `ImageURL ${imageURL.length + 1}`,
  //   };
  //   console.log(newImageURL);
  //   setImageURL([...imageURL, newImageURL]);
  // };

  const [test, setTest] = useState(1);
  const handleTest = () => {
    setTest(test + 1);
  };

  return (
    <div className="canvasPage">
      <header className="header">LET'S DRAW</header>
      <Link to="/catchmind">뒤로가기</Link>
      <div className="container">
        <canvas
          className="canvas"
          ref={canvaRef}
          onMouseDown={() => setPainting(true)}
          onMouseUp={() => setPainting(false)}
          onMouseMove={(e) => drawFn(e)}
          onMouseLeave={() => setPainting(false)}
          onTouchStart={startDrawing}
          onTouchMove={(event) => draw(event)}
          onTouchEnd={stopDrawing}
        ></canvas>
        <BorderColorIcon className="setBtn" onClick={viewSetting} />
        <div
          className="setting"
          ref={settingRef}
          style={{ visibility: `${view}` }}
        >
          <div className="color-options">
            <input
              type="color"
              className="fixColor"
              ref={colorRef}
              onChange={selectColor}
            />
            <div
              className="color-option"
              style={{ backgroundColor: "#000000" }}
              data-color="#000000"
              onClick={clickColor}
            ></div>
            <div
              className="color-option"
              style={{ backgroundColor: "#ff0000" }}
              data-color="#ff0000"
              onClick={clickColor}
            ></div>
            <div
              className="color-option"
              style={{ backgroundColor: "#ffff00" }}
              data-color="#ffff00"
              onClick={clickColor}
            ></div>
            <div
              className="color-option"
              style={{ backgroundColor: "#008000" }}
              data-color="#008000"
              onClick={clickColor}
            ></div>
            <div
              className="color-option"
              style={{ backgroundColor: "#0000ff" }}
              data-color="#0000ff"
              onClick={clickColor}
            ></div>
            <div
              className="color-option"
              style={{ backgroundColor: "#000080" }}
              data-color="#000080"
              onClick={clickColor}
            ></div>
            <div
              className="color-option"
              style={{ backgroundColor: "#800080" }}
              data-color="#800080"
              onClick={clickColor}
            ></div>
            <div
              className="color-option"
              style={{ backgroundColor: "#ff00ff" }}
              data-color="#ff00ff"
              onClick={clickColor}
            ></div>
          </div>
          <div className="options">
            <span>
              연필 두께:{lineWidth}
              <input
                className="line-width"
                type="range"
                min={0}
                max={50}
                step={1}
                onChange={fixLineWidth}
                value={lineWidth}
              />
            </span>
            <button className="btns" onClick={onErase}>
              Erase
            </button>
            <button className="btns" onClick={onReset}>
              Clear
            </button>
            <button
              className="btns"
              ref={modeRef}
              onClick={changeBackgroundColor}
            >
              BackGround
            </button>
          </div>
        </div>
      </div>
      <div className="wordBox" ref={wordRef}>
        <span>제시어:{randomWord}</span>
      </div>
      <Link
        to={{
          pathname: "/catchmind",
          state: { test }, // imageURL도 함께 전달
        }}
      >
        <button onClick={handleTest}>포스트 하기</button>
      </Link>
    </div>
  );
}

export default Canvas;
