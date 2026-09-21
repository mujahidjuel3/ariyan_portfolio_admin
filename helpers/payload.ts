/** Remove ORM metadata so admin PUT/POST bodies pass DTO validation cleanly. */
export function stripEntityMeta<T extends Record<string, unknown>>(data: T) {
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    images: _images,
    ...rest
  } = data;
  return rest as Omit<T, "id" | "createdAt" | "updatedAt" | "images">;
}

/** Drop empty optional UUID fields that fail @IsUUID(). */
export function omitEmptyUuids<T extends Record<string, unknown>>(data: T) {
  const next = { ...data };
  for (const [key, value] of Object.entries(next)) {
    if (
      (key.endsWith("MediaId") || key === "mediaId") &&
      (value === "" || value == null)
    ) {
      delete next[key];
    }
  }
  return next;
}
