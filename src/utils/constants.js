export const CONDITIONS = [
  { value: "new_with_tag", label: "New with tag" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

export const CONDITION_LABEL = CONDITIONS.reduce((acc, c) => {
  acc[c.value] = c.label;
  return acc;
}, {});
