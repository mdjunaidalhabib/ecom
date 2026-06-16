export function makeImageUrl(path) {
  if (!path) return "/placeholder.png"; // fallback

  return path.startsWith("http")
    ? path
    : `/api${path}`;
}
