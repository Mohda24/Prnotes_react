import React, { useState, useEffect } from "react";
import {
  CssBaseline,
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Button,
  Dialog,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Add, Edit, Delete, Logout } from "@mui/icons-material";
import axios from "axios";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [cin, setCin] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchNotes();
      fetchUsers();
      
    }
  }, [token]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get("https://notes.devlop.tech/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data);
      console.log(response.data);
      
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://notes.devlop.tech/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("https://notes.devlop.tech/api/login", {
        cin,
        password,
      });
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);
      setLoginError("");
      fetchNotes();
      fetchUsers();
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Invalid CIN or password. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const handleAddEditNote = async () => {
    try {
      const userId = selectedUser || null;
      if (editingNote) {
        await axios.put(
          `https://notes.devlop.tech/api/notes/${editingNote.id}`,
          { title: noteTitle, content: noteContent, shared_with: [userId] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "https://notes.devlop.tech/api/notes",
          { title: noteTitle, content: noteContent, shared_with: [userId] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await fetchNotes();
      setDialogOpen(false);
      setNoteTitle("");
      setNoteContent("");
      setSelectedUser("");
      setEditingNote(null);
      
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await axios.delete(`https://notes.devlop.tech/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const openEditDialog = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setSelectedUser(note.user_id || "");
    setDialogOpen(true);
    
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Notes App
          </Typography>
          {isLoggedIn && (
            <Button
              color="inherit"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {isLoggedIn ? (
          <>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h4">Your Notes</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setDialogOpen(true)}
              >
                Add Note
              </Button>
            </Box>

            {notes.length > 0 ? (
              <Paper>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Content</TableCell>
                      <TableCell>Assigned User</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notes.map((note) => {
                      
                      return (
                        <TableRow key={note.id}>
                          <TableCell>{note.title}</TableCell>
                          <TableCell>{note.content}</TableCell>
                          <TableCell>
                            {note.shared_with.length > 0 
                              ? `${note.shared_with[0].first_name} ${note.shared_with[0].last_name}`
                              : "Not Assigned"}
                          </TableCell>

                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => openEditDialog(note)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Paper>
            ) : (
              <Typography variant="body1">No notes available.</Typography>
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
              <Box sx={{ p: 3, width: 400 }}>
                <Typography variant="h6" gutterBottom>
                  {editingNote ? "Edit Note" : "Add Note"}
                </Typography>
                <TextField
                  label="Title"
                  fullWidth
                  margin="normal"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
                <TextField
                  label="Content"
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel id="user-select-label">Assign to User</InputLabel>
                  <Select
                    labelId="user-select-label"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                >
                  <Button onClick={() => setDialogOpen(false)} sx={{ mr: 2 }}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleAddEditNote}>
                    Save
                  </Button>
                </Box>
              </Box>
            </Dialog>
          </>
        ) : (
          <Box sx={{ maxWidth: 400, mx: "auto", mt: 8 }}>
            <Typography variant="h5" gutterBottom>
              Login
            </Typography>
            <TextField
              label="CIN"
              fullWidth
              margin="normal"
              value={cin}
              onChange={(e) => setCin(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {loginError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {loginError}
              </Typography>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button variant="contained" onClick={handleLogin}>
                Login
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
}

export default App;
