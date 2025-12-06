import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./auth-context";
import api from "../api/axios";

function Dashboard() {
  const { token, logout } = useContext(AuthContext); // get token
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes", {
          headers: {
            Authorization: `Bearer ${token}`, // send token
          },
        });
        setNotes(res.data.notes);
      } catch (err) {
        console.error("Failed to load notes:", err);
        setError("Failed to load notes. Try logging in again.");
        if (err.response?.status === 401) logout(); // log out if token expired/unauthorized
      }
    };

    fetchNotes();
  }, [token]);

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p>{error}</p>}
      {notes.map((note) => (
        <div key={note.id}>{note.title}</div>
      ))}
    </div>
  );
}

export default Dashboard;
