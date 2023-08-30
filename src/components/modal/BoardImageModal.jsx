import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  getDownloadURL,
  getStorage,
  ref as refStorage,
  uploadBytesResumable,
} from "firebase/storage";

function BoardImageModal({ open, handleClose, setImage }) {
  const [file, setFile] = useState(null);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB를 최대 파일 크기로 설정

  const onChangeAddFile = useCallback((e) => {
    const addedFile = e.target?.files[0];
    if (addedFile) setFile(addedFile);
  }, []);

  const uploadFile = useCallback(async () => {
    if (file && file.size > MAX_FILE_SIZE) {
      console.error("파일 크기가 제한을 초과하였습니다.");
      return;
    }
    const filePath = `board/${uuidv4()}?.${file?.name.split(".").pop()}`;
    const upload = uploadBytesResumable(
      refStorage(getStorage(), filePath),
      file
    );

    try {
      const uploadTaskSnapshot = await upload;
      const downloadUrl = await getDownloadURL(uploadTaskSnapshot.ref);
      setImage((prev) => [...prev, downloadUrl]);
    } catch (error) {
      console.error(error);
    }
  }, [file, setImage, MAX_FILE_SIZE]);

  const handleSendFile = useCallback(() => {
    uploadFile();
    handleClose();
    setFile(null);
  }, [handleClose, uploadFile]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>이미지 추가하기</DialogTitle>
      <DialogContent>
        <Input
          margin="dense"
          inputProps={{
            accept: "image/jpeg, image/jpg, image/png, image/gif",
          }}
          type="file"
          fullWidth
          variant="standard"
          onChange={onChangeAddFile}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={handleSendFile}>확인</Button>
      </DialogActions>
    </Dialog>
  );
}

export default BoardImageModal;
