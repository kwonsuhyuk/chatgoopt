import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
} from "@mui/material";
import {
  getDatabase,
  push,
  ref,
  serverTimestamp,
  set,
} from "firebase/database";
import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  getDownloadURL,
  getStorage,
  ref as refStorage,
  uploadBytesResumable,
} from "firebase/storage";

function ImageModal({ open, handleClose, setPercent, setUploading }) {
  const { user, channel } = useSelector((state) => state);
  const [file, setFile] = useState(null);

  const onChangeAddFile = useCallback((e) => {
    const addedFile = e.target.files[0];
    if (addedFile) setFile(addedFile);
  }, []);

  const createImageMessage = useCallback(
    (fileUrl) => ({
      timestamp: serverTimestamp(),
      user: {
        id: user.currentUser.uid,
        name: user.currentUser.displayName,
        avatar: user.currentUser.photoURL,
      },
      image: fileUrl,
    }),
    [
      user.currentUser.uid,
      user.currentUser.displayName,
      user.currentUser.photoURL,
    ]
  );
  const uploadFile = useCallback(() => {
    setUploading(true);
    const filePath = `chat/${uuidv4()}.${file.name.split(".").pop()}`;
    const upload = uploadBytesResumable(
      refStorage(getStorage(), filePath),
      file
    );
    const unsubscribe = upload.on(
      "state_changed",
      (snap) => {
        const percentUploaded = Math.round(
          (snap.bytesTransferred / snap.totalBytes) * 100
        );
        setPercent(percentUploaded);
      },
      (error) => {
        console.error(error);
        setUploading(false);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(upload.snapshot.ref);
          await set(
            push(ref(getDatabase(), "messages/" + channel.currentChannel.id)),
            createImageMessage(downloadUrl)
          );
          setUploading(false);
          unsubscribe();
        } catch (error) {
          console.error(error);
          setUploading(false);
          unsubscribe();
        }
      }
    );
  }, [
    channel.currentChannel?.id,
    createImageMessage,
    file,
    setPercent,
    setUploading,
  ]);
  const handleSendFile = useCallback(() => {
    uploadFile();
    handleClose();
    setFile(null);
  }, [handleClose, uploadFile]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>이미지 보내기</DialogTitle>
      <DialogContent>
        <Input
          margin="dense"
          inputProps={{ accept: "image/jpeg, image/jpg, image/png, image/gif" }}
          type="file"
          fullWidth
          variant="standard"
          onChange={onChangeAddFile}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={handleSendFile}>전송</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImageModal;
