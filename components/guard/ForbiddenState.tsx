type ForbiddenStateProps = {
  title?: string;
  description?: string;
};

export function ForbiddenState({
  title = "Access denied",
  description = "You do not have permission to access this section.",
}: ForbiddenStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm">{description}</p>
    </div>
  );
}
