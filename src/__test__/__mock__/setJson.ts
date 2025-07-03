import type { CollectionSet } from "@/types/CollectionSet";

export const setJsonMock: CollectionSet[] = [
  {
    id: "10",
    short_name: "test_1",
    series_short_name: "wm",
    series_id: "1",
    logo: "pkm-test_1.png",
    name: "test_1",
    sortBy: 1,
  },
  {
    id: "20",
    short_name: "test_2",
    series_short_name: "wm",
    series_id: "1",
    logo: "pkm-test_2.png",
    name: "test_2",
    sortBy: 2,
    description: "test_2 description",
    set_images: [
      {
        url: "https://example.com/test_2_image_1.png",
        label: "test_2 image 1",
      },
    ],
  },
  {
    id: "30",
    short_name: "test_1",
    series_short_name: "wm",
    series_id: "2",
    logo: "mgc-test_1-1.png",
    name: "test_1-1",
    sortBy: 1,
  },
];
