import React from "react";
import { View } from "react-native";
import { AppBar } from "../../src/components/ui/AppBar";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Screen } from "../../src/components/ui/Screen";
import { useOrganization } from "../../src/features/organizations/hooks";
import { useOrganizationStore } from "../../src/stores/organizationStore";

export default function Payments() {
  const activeOrganizationId = useOrganizationStore((s) => s.activeOrganizationId);
  const { data: organization } = useOrganization(activeOrganizationId);

  return (
    <Screen>
      <AppBar large title="Payments" subtitle={organization?.name} />
      <View className="flex-1 justify-center p-4">
        <Card>
          <EmptyState
            icon="wallet"
            title="No payments yet"
            message="Rent tracking isn't available in this version yet. Payments will appear here once guests are checked in."
          />
        </Card>
      </View>
    </Screen>
  );
}
