import { createContext, useContext, useState } from "react";

const SortContext = createContext();

export const useSort = () => useContext(SortContext);

export const SortProvider = ({ children }) => {
  const [sortOrder, setSortOrder] = useState("newest"); // "newest", "oldest"

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === "newest" ? "oldest" : "newest"));
  };

  return (
    <SortContext.Provider value={{ sortOrder, toggleSortOrder }}>
      {children}
    </SortContext.Provider>
  );
};
