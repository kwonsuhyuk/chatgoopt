import { Route, Routes } from "react-router";
import Main from "./pages/Main";
import Signin from "./pages/Signin";

function App() {
  // 함수, 변수 , 상태 관리
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/signin" element={<Signin />} />
    </Routes>
  );
}

export default App;
