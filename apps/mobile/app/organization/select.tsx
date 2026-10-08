import React from "react";
import { View } from "react-native";
import { AppBar } from "../../src/components/ui/AppBar";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { ListRow } from "../../src/components/ui/ListRow";
import { LoadingState } from "../../src/components/ui/LoadingState";
import { Screen, ScreenScroll } from "../../src/components/ui/Screen";
import { Text } from "../../src/components/ui/Text";
import { useOrganizationStore } from "../../src/stores/organizationStore";
import { useOrganizations } from "../../src/features/organizations/hooks";
import { authService } from "../../src/features/auth/authService";
import { getErrorMessage } from "../../src/utils/errorUtils";

const roleLabel = { owner: "Owner", admin: "Admin" } as const;

export default function SelectOrganization() {
  const { memberships, setActiveOrganizationId } = useOrganizationStore();
  const organizationIds = memberships.map((m) => m.organizationId);
  const { data: organizations, isLoading, isError, error, refetch } = useOrganizations(organizationIds);

  // Routing to the tabs is handled by app/_layout.tsx once state becomes "selected".
  const handleSelect = (id: string) => setActiveOrganizationId(id);

  return (
    <Screen>
      <AppBar large title="Choose organization" subtitle={`You're a member of ${memberships.length}`} />
      {isLoading ? (
        <LoadingState message="Loading organizations" rows={memberships.length || 2} />
      ) : isError ? (
        <ErrorState title="Couldn't load organizations" message={getErrorMessage(error)} onRetry={refetch} />
      ) : (
        <ScreenScroll>
          <Text variant="body" tone="muted">
            Pick the business you want to manage. You can switch any time from Settings.
          </Text>
          <Card flush>
            {organizations?.map((org, i) => {
              const membership = memberships.find((m) => m.organizationId === org.id);
              return (
                <ListRow
                  key={org.id}
                  divider={i > 0}
                  icon="building"
                  title={org.name}
                  subtitle={membership ? roleLabel[membership.role] : undefined}
                  onPress={() => handleSelect(org.id)}
                />
              );
            })}
          </Card>
          <View className="mt-2">
            <Button label="Log Out" icon="log-out" variant="danger-ghost" block onPress={() => authService.logout()} />
          </View>
        </ScreenScroll>
      )}
    </Screen>
  );
}
