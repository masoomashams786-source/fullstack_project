import React, { useState } from "react";
import {
  Box,
  Button,
  Field,
  Fieldset,
  Input,
  Stack,
  Alert,
} from "@chakra-ui/react";
import api from "../api/axios";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      const res = await api.post("/signup", formData);
      setSuccess(res.data.message || "Signup successful!");
      setFormData({ username: "", email: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed.");
    }
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="md" maxW="400px" mx="auto" mt="50px">
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
                required
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
                required
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
                required
              />
            </Field.Root>
          </Fieldset.Content>

          <Button type="submit" mt={4} colorScheme="blue">
            Sign Up
          </Button>
        </Fieldset.Root>
      </form>
    </Box>
  );
}

export default Signup;
