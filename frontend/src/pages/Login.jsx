import React, { useState, useContext } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
import { AuthContext } from "./auth-context";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

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
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }

    try {
      const { user, token } = await loginTrigger(formData);
      authContext.login({ user, token });
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(err.response?.data?.error || "Login failed.");
      }
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
          <Card.Root  borderRadius="xl" boxShadow="xl" p={6}>
            <Card.Header>
              <VStack spacing={1}>
                <Heading size="lg">Welcome Back</Heading>
                <Text color="gray.600">Sign in to your account</Text>
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
                      {loading ? <Spinner size="sm" /> : "Sign In"}
                    </Button>
                  </Stack>
                </Fieldset.Root>
              </form>
            </Card.Body>

            <Card.Footer justifyContent="center">
              <Text fontSize="sm">
                Don’t have an account?{" "}
                <Link
                  as={RouterLink}
                  to="/signup"
                  color="blue.500"
                  fontWeight="medium"
                >
                  Sign up
                </Link>
              </Text>
            </Card.Footer>
          </Card.Root>
        </Box>
      </GridItem>
    </Grid>
  );
}

export default Login;
