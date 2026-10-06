import { z } from "zod";

export const roomSchema = z.object({
  roomNumber: z
    .string()
    .trim()
    .min(1, "Room number is required")
    .max(50, "Room number must be 50 characters or fewer"),
});

export type RoomFormInput = z.infer<typeof roomSchema>;

export function validateRoomInput(data: unknown): RoomFormInput {
  return roomSchema.parse(data);
}
