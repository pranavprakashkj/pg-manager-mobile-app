import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppBar } from "../../src/components/ui/AppBar";
import { ErrorState } from "../../src/components/ui/ErrorState";
import { FormLayout } from "../../src/components/ui/FormLayout";
import { LoadingState } from "../../src/components/ui/LoadingState";
import { Screen } from "../../src/components/ui/Screen";
import { TextField } from "../../src/components/ui/TextField";
import { showToast } from "../../src/components/ui/Toast";
import { roomSchema, RoomFormInput } from "../../src/features/rooms/schemas";
import { useRoom, useUpdateRoom } from "../../src/features/rooms/hooks";
import { getErrorMessage } from "../../src/utils/errorUtils";
import type { Room } from "../../src/types";

function EditRoomForm({ room }: { room: Room }) {
  const updateMutation = useUpdateRoom();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RoomFormInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: { roomNumber: room.roomNumber },
  });

  const onSubmit = (data: RoomFormInput) => {
    updateMutation.mutate(
      { id: room.id, data },
      {
        onSuccess: () => {
          showToast("Room updated");
          router.back();
        },
        onError: (e: unknown) => setError("root", { message: getErrorMessage(e) }),
      }
    );
  };

  return (
    <FormLayout
      title="Edit Room"
      subtitle={`Room ${room.roomNumber}`}
      submitLabel="Save Changes"
      submitting={updateMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        control={control}
        name="roomNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Room number"
            placeholder="e.g. 101"
            icon="door"
            autoCapitalize="characters"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.roomNumber?.message ?? errors.root?.message}
          />
        )}
      />
    </FormLayout>
  );
}

export default function EditRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: room, isLoading, isError, error, refetch } = useRoom(id);

  if (room) return <EditRoomForm room={room} />;

  return (
    <Screen>
      <AppBar title="Edit Room" back />
      {isLoading ? (
        <LoadingState message="Loading room" rows={1} />
      ) : (
        <ErrorState
          title="Couldn't load this room"
          message={isError ? getErrorMessage(error) : "This room is no longer available."}
          onRetry={refetch}
        />
      )}
    </Screen>
  );
}
