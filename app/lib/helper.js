import { parse, format } from "date-fns";

function formatMarkdownDate(date) {
  if (!date) return "";
  try {
    return format(parse(date, "yyyy-MM", new Date()), "MMM yyyy");
  } catch {
    return date;
  }
}

export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const dateRange = entry.current
          ? `${formatMarkdownDate(entry.startDate)} - Present`
          : `${formatMarkdownDate(entry.startDate)} - ${formatMarkdownDate(entry.endDate)}`;
        return `### ${entry.title} @ ${entry.organization}\n${dateRange}\n\n${entry.description || "_No description_"}`
      })
      .join("\n\n")
  );
}
