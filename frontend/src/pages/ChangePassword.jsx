import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { changePassword } from "../api/ChangePassword";
import { Button, Card, Field, Input, Stack, Text } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { trigger, isMutating } = useSWRMutation("/change-password", changePassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!oldPassword || !newPassword) {
      setFormError("All fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setFormError("New password must be at least 8 characters long.");
      return;
    }

    try {
      const data = await trigger({ oldPassword, newPassword });

      toaster.create({
        title: data.message || "Password changed successfully",
        type: "success",
      });

      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      toaster.create({
        title: err.response?.data?.error || "Failed to change password",
        type: "error",
      });
    }
  };

  return (
    <Card.Root maxW="sm" mx="auto" mt={10}>
      <Card.Header>
        <Card.Title color="teal.600">Change Password</Card.Title>
        <Card.Description>
          Enter your old password and new password below
        </Card.Description>
      </Card.Header>

      <Card.Body>
        <form onSubmit={handleSubmit}>
          <Stack gap="4" w="full">
            <Field.Root>
              <Field.Label>Old Password</Field.Label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter old password"
                required
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>New Password</Field.Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </Field.Root>

            {formError && (
              <Text color="red.500" fontSize="sm">
                {formError}
              </Text>
            )}
          </Stack>
        </form>
      </Card.Body>

      <Card.Footer justifyContent="flex-end">
        <Button
          variant="solid"
          onClick={handleSubmit}
          colorPalette="blue"
          isLoading={isMutating}
          loadingText="Changing..."
        >
          Change Password
        </Button>
      </Card.Footer>
    </Card.Root>
  );
};

export default ChangePassword;
