import { createContext, useContext, useState } from "react";

const TextSizeContext = createContext();

export const useTextSize = () => useContext(TextSizeContext);

export const TextSizeProvider = ({ children }) => {
  const [textSize, setTextSize] = useState("md"); // "sm", "md", "lg"

  const cycleTextSize = () => {
    setTextSize((current) => {
      if (current === "sm") return "md";
      if (current === "md") return "lg";
      return "sm";
    });
  };

  return (
    <TextSizeContext.Provider value={{ textSize, cycleTextSize }}>
      {children}
    </TextSizeContext.Provider>
  );
};
