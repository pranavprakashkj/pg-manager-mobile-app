import React from "react";
import { View } from "react-native";
import { AppBar } from "../../src/components/ui/AppBar";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Screen } from "../../src/components/ui/Screen";
import { useOrganization } from "../../src/features/organizations/hooks";
import { useOrganizationStore } from "../../src/stores/organizationStore";

export default function Guests() {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  const { data: organization } = useOrganization(activeOrganizationId);

  return (
    <Screen>
      <AppBar large title="Guests" subtitle={organization?.name} />
      <View className="flex-1 justify-center p-4">
        <Card>
          <EmptyState
            icon="users"
            title="No guests yet"
            message="Guest check-in isn't available in this version yet. The rooms and beds you set up now will be ready for it."
          />
        </Card>
      </View>
    </Screen>
  );
}
