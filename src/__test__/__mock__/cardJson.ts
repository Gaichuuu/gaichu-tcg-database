// Raw card mock data (normalized format without derived fields)
// These will be enriched by CardSchema.transform() using sets.json data
export const cardListMock = [
  {
    id: "1",
    name: { en: "test_1" },
    number: 1,
    variant: "normal",
    image: "https://example.com/test_1_image.png",
    sort_by: 1,
    set_ids: ["set-id-1"], // References setJsonMock[0] with short_name: "set1"
    thumb: "https://example.com/test_1_thumb.png",
  },
  {
    id: "30",
    name: { en: "test_1-1" },
    number: 30,
    variant: "reverse holo",
    image: "https://example.com/test_1-1_image.png",
    sort_by: 30,
    set_ids: ["set-id-1"], // Also in set1
    thumb: "https://example.com/test_1-1_thumb.png",
  },
  {
    id: "2",
    name: { en: "test_2" },
    number: 20,
    variant: "holo",
    image: "https://example.com/test_2_image.png",
    sort_by: 20,
    set_ids: ["set-id-2"], // References setJsonMock[1] with short_name: "set2"
    thumb: "https://example.com/test_2_thumb.png",
  },
];
