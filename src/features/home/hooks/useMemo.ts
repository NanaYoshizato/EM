"use client";

import { useState } from "react";

export default function useMemo() {
  const [memo, setMemo] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(event.currentTarget.value);
  };

  const handleSave = () => {
    alert(memo);
  };

  return { memo, handleChange, handleSave };
}