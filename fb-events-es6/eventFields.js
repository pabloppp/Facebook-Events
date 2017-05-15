export default (since) => {
  const eventsFields = [
    "id",
    "type",
    "name",
    "cover.fields(id,source)",
    "picture.type(large)",
    "description",
    "start_time",
    "end_time",
    "category",
    "attending_count",
    "declined_count",
    "maybe_count",
    "noreply_count"
  ];

  const fields = [
    "id",
    "name",
    "about",
    "emails",
    "cover.fields(id,source)",
    "picture.type(large)",
    "category",
    "category_list.fields(name)",
    "location",
    "events.fields(" + eventsFields.join(",") + ").since(" + since + ")"
  ];

  return fields
}
