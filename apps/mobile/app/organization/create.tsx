import React from "react";
import { View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppBar } from "../../src/components/ui/AppBar";
import { Banner } from "../../src/components/ui/Banner";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { FormScreen, ScreenScroll } from "../../src/components/ui/Screen";
import { Text } from "../../src/components/ui/Text";
import { TextField } from "../../src/components/ui/TextField";
import { OrganizationSchema, OrganizationFormInput } from "../../src/features/organizations/schemas";
import { useCreateOrganization } from "../../src/features/organizations/hooks";
import { authService } from "../../src/features/auth/authService";
import { useOrganizationStore } from "../../src/stores/organizationStore";
import { getErrorMessage } from "../../src/utils/errorUtils";
import { useAuthStore } from "../../src/stores/authStore";

export default function CreateOrganization() {
  const createMutation = useCreateOrganization();
  const { loadMemberships } = useOrganizationStore();
  const { user } = useAuthStore();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormInput>({
    resolver: zodResolver(OrganizationSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (data: OrganizationFormInput) => {
    if (!user) return;
    try {
      await createMutation.mutateAsync(data.name);
      // Routing follows from the membership state (1 active membership → selected).
      await loadMemberships(user.uid);
    } catch (error) {
      setError("root", { message: getErrorMessage(error) });
    }
  };

  return (
    <FormScreen>
      <AppBar large eyebrow="Welcome" title="Set up your business" />
      <ScreenScroll contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <Card>
          <View className="gap-4">
            <View className="gap-1">
              <Text variant="title-md">Create your organization</Text>
              <Text variant="body" tone="muted">
                An organization is the PG or property business you manage. Buildings, rooms and beds live inside it.
              </Text>
            </View>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Organization name"
                  placeholder="e.g. Green Haven PG"
                  icon="building"
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />
            {errors.root?.message ? <Banner tone="danger" title="Couldn't create organization" message={errors.root.message} /> : null}
            <Button
              label="Create Organization"
              icon="check"
              size="lg"
              block
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting || createMutation.isPending}
            />
          </View>
        </Card>
        <Button label="Log Out" variant="ghost" block onPress={() => authService.logout()} />
      </ScreenScroll>
    </FormScreen>
  );
}
