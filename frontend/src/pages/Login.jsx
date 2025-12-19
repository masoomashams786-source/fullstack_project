import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./auth-context";
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

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  /* ------------------ Login Mutation ------------------ */
  const { trigger: loginTrigger, isMutating: loading } = useSWRMutation(
    "/auth/login",
    async (url, { arg }) => {
      const res = await api.post(url, arg);
      return res.data;
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }

    try {
      const data = await loginTrigger(formData);
      const {user, token} = data;

      // Store token in AuthContext
      authContext.login({ user, token });

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong. Try again.");
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
            <Fieldset.Legend>Login</Fieldset.Legend>

            {error && (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Error</Alert.Title>
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}
          </Stack>

          <Fieldset.Content>
            <Field.Root>
              <Field.Label>Email</Field.Label>
              <Input
                name="email"
                type="email"
                autoComplete="email"
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
                autoComplete="current-password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Field.Root>
          </Fieldset.Content>

          <Button type="submit" mt={4} colorScheme="blue" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Login"}
          </Button>
        </Fieldset.Root>
      </form>
    </Box>
  );
}

export default Login;
