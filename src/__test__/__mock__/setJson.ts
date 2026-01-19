import type { CollectionSet } from "@/types/CollectionSet";

export const setJsonMock: CollectionSet[] = [
  {
    id: "set-id-1",
    short_name: "set1",
    series_short_name: "wm",
    series_id: "1",
    logo: "pkm-test_1.png",
    name: "Test Set 1",
    sort_by: 1,
    total_cards_count: 50,
  },
  {
    id: "set-id-2",
    short_name: "set2",
    series_short_name: "wm",
    series_id: "1",
    logo: "pkm-test_2.png",
    name: "Test Set 2",
    sort_by: 2,
    total_cards_count: 30,
    description: "test_2 description",
    set_images: [
      {
        url: "https://example.com/test_2_image_1.png",
        pathType: "pack-art",
        packs: [
          {
            url: "https://example.com/test_2_pack_1.png",
            label: "Pack 1",
          },
        ],
      },
    ],
  },
  {
    id: "set-id-3",
    short_name: "test_1",
    series_short_name: "wm",
    series_id: "2",
    logo: "mgc-test_1-1.png",
    name: "test_1-1",
    sort_by: 1,
    total_cards_count: 20,
  },
];
