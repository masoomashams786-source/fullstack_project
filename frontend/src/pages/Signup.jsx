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
import api from "../api/axios";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    if (formData.username.length < 3 || formData.username.length > 20) {
        setError("Username must be between 3 and 20 characters."); 
        setLoading(false);
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/signup", formData);
      setSuccess(res.data.message || "Signup successful!");
      setFormData({ username: "", email: "", password: "" });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed.");
    }finally {
      setLoading(false);
    }
  };

  return (
    <Box p={8} borderWidth="1px" borderRadius="md" maxW="500px" mx="auto" mt="70px" boxShadow="lg" bg="whiteAlpha.100">
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
                required
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
                required
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
