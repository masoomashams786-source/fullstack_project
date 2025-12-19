import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Field,
  Fieldset,
  Input,
  Spinner,
  Stack,
  Alert,
} from "@chakra-ui/react";
import useSWRMutation from "swr/mutation";
import api from "../api/axios";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  /* ------------------ Signup Mutation ------------------ */
  const { trigger: signupTrigger, isMutating: loading } = useSWRMutation(
    "/auth/signup",
    async (url, { arg }) => {
      const res = await api.post(url, arg);
      return res.data;
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "password" ? value : value.trim(),
    }));
  };

  const validateForm = () => {
    const { username, email, password } = formData;

    if (!username || !email || !password) {
      setError("All fields are required.");
      return false;
    }

    if (username.length < 3 || username.length > 20) {
      setError("Username must be between 3 and 20 characters.");
      return false;
    }

    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(username)) {
      setError(
        "Username can only contain letters, numbers, underscore (_), dot (.), or hyphen (-)."
      );
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    const { username, email, password } = formData;

    try {
      const data = await signupTrigger({
        username,
        email,
        password,
      });

      setSuccess(data.message || "Signup successful!");
      setFormData({ username: "", email: "", password: "" });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      // Handle backend errors
      if (err.response?.data?.errors) {
        // Pydantic validation errors
        const validationErrors = err.response.data.errors
          .map((e) => Object.values(e)[0])
          .join(" ");
        setError(validationErrors);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Signup failed.");
      }
    }
  };

  return (
    <Box
      p={8}
      borderWidth="1px"
      borderRadius="md"
      maxW="500px"
      mx="auto"
      mt="70px"
      boxShadow="lg"
      bg="whiteAlpha.100"
    >
      <form onSubmit={handleSubmit}>
        <Fieldset.Root size="lg" maxW="md">
          <Stack spacing={4}>
            <Fieldset.Legend>Signup</Fieldset.Legend>

            {error && (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Invalid Fields</Alert.Title>
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}

            {success && (
              <Alert.Root status="success" variant="subtle">
                <Alert.Indicator />
                <Alert.Title>{success}</Alert.Title>
              </Alert.Root>
            )}
          </Stack>

          <Fieldset.Content>
            <Field.Root>
              <Field.Label>Username</Field.Label>
              <Input
                name="username"
                placeholder="Your username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Email</Field.Label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Password</Field.Label>
              <Input
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </Field.Root>
          </Fieldset.Content>

          <Button type="submit" mt={4} colorScheme="blue" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Sign Up"}
          </Button>
        </Fieldset.Root>
      </form>
    </Box>
  );
}

export default Signup;
