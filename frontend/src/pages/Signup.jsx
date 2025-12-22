import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import background from "../img/background.png";

import {
  Box,
  Button,
  Field,
  Fieldset,
  Grid,
  GridItem,
  Input,
  Spinner,
  Text,
  Stack,
  Link,
  VStack,
  Card,
  Heading,
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
      [name]: value.trim(),
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

    if (!validateForm()) return;

    try {
      const data = await signupTrigger(formData);
      setSuccess(data.message || "Signup successful!");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed.");
    }
  };

  return (
    <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} minH="100vh">
      {/* ================= LEFT IMAGE (Desktop Only) ================= */}
      <GridItem
        display={{ base: "none", lg: "block" }}
        bgImage={`url(${background})`}
        bgSize="cover"
        bgPosition="center"
      />

      {/* ================= RIGHT FORM ================= */}
      <GridItem
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgGradient="linear(to-br, blue.50, cyan.50)"
        px={{ base: 4, md: 8 }}
      >
        <Box w="100%" maxW="420px">
          <Card.Root bg="white" borderRadius="xl" boxShadow="xl" p={6}>
            <Card.Header>
              <VStack spacing={1}>
                <Heading size="lg">Create Account</Heading>
                <Text color="gray.600">Join Notionflow today</Text>
              </VStack>
            </Card.Header>

            <Card.Body>
              <form onSubmit={handleSubmit}>
                <Fieldset.Root>
                  <Stack spacing={4}>
                    {error && (
                      <Alert.Root status="error">
                        <Alert.Description>{error}</Alert.Description>
                      </Alert.Root>
                    )}

                    {success && (
                      <Alert.Root status="success">
                        <Alert.Description>{success}</Alert.Description>
                      </Alert.Root>
                    )}

                    <Field.Root>
                      <Field.Label>Username</Field.Label>
                      <Input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Email</Field.Label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Password</Field.Label>
                      <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </Field.Root>

                    <Button
                      type="submit"
                      colorPalette="blue"
                      w="full"
                      disabled={loading}
                    >
                      {loading ? <Spinner size="sm" /> : "Sign Up"}
                    </Button>
                  </Stack>
                </Fieldset.Root>
              </form>
            </Card.Body>

            <Card.Footer justifyContent="center">
              <Text fontSize="sm">
                Already have an account?{" "}
                <Link
                  as={RouterLink}
                  to="/login"
                  color="blue.500"
                  fontWeight="medium"
                >
                  Sign in
                </Link>
              </Text>
            </Card.Footer>
          </Card.Root>
        </Box>
      </GridItem>
    </Grid>
  );
}

export default Signup;
