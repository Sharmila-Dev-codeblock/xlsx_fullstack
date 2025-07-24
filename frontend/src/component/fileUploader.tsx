import React, { useEffect, useState } from "react";
import axios from "../axios/axiosInstance";
import {
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Box,
  Alert,
  Input,
  Stack,
} from "@mui/material";
import { UserType } from "../types/user";
import User from "../Users";

const FileUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setProgress(0);
    setSuccessMessage("");
    setErrorMessages([]);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get<UserType[]>("/user/all");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setErrorMessages(["Please select a file"]);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/user/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent: any) => {
          const total = progressEvent.total || 1;
          const loaded = progressEvent.loaded;
          const target = Math.round((loaded * 100) / total);

          let current = progress;
          const step = () => {
            if (current < target) {
              current += 5;
              setProgress(Math.min(current, target));
              setTimeout(step, 20); // delay each step
            }
          };
          step();
        },
      });

      setSuccessMessage(response.data.message || "File uploaded successfully.");
      setErrorMessages([]);
      fetchUsers(); // Refresh users
    } catch (err: any) {
      console.error(err);

      const backendError = err?.response?.data?.message;

      if (Array.isArray(backendError)) {
        setErrorMessages(backendError);
      } else if (typeof backendError === "string") {
        setErrorMessages([backendError]);
      } else {
        setErrorMessages(["Upload failed. Please try again."]);
      }

      setSuccessMessage("");
      setProgress(0);
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 600, margin: "auto", mt: 6, p: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Upload Excel File
          </Typography>

          <Input
            type="file"
            onChange={handleFileChange}
            inputProps={{ accept: ".xlsx" }}
            disableUnderline
            aria-label="Upload Excel File"
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file}
            sx={{ mb: 4 }}
          >
            Upload
          </Button>

          {progress > 0 && (
            <Box sx={{ width: "100%" }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                {progress}%
              </Typography>
            </Box>
          )}

          {successMessage && (
            <Alert severity="success" variant="outlined" role="alert">
              {successMessage}
            </Alert>
          )}

          {errorMessages.length > 0 && (
            <Alert severity="error" variant="outlined" role="alert">
              <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                {errorMessages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </Alert>
          )}
        </CardContent>
      </Card>

      {users.length > 0 && <User users={users} />}
    </>
  );
};

export default FileUploader;
