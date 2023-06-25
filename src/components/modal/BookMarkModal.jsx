import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import React from "react";

function BookMarkModal() {
  return (
    <Dialog>
      <DialogContent></DialogContent>
      <DialogActions>
        <Button>취소</Button>
        <Button>확인</Button>
      </DialogActions>
    </Dialog>
  );
}

export default BookMarkModal;
