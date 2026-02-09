import { renderHook, act } from "@testing-library/react";
import { useImagesLoaded } from "@/hooks/useImagesLoaded";

interface MockImage {
  src: string;
  onload: (() => void) | null;
  onerror: (() => void) | null;
}

let capturedImages: MockImage[];

beforeEach(() => {
  capturedImages = [];
  vi.stubGlobal(
    "Image",
    class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      private _src = "";
      get src() {
        return this._src;
      }
      set src(v: string) {
        this._src = v;
        capturedImages.push(this as unknown as MockImage);
      }
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useImagesLoaded", () => {
  it("returns false initially while images load", () => {
    const { result } = renderHook(() =>
      useImagesLoaded(["image1.jpg", "image2.jpg"]),
    );
    expect(result.current).toBe(false);
  });

  it("returns true after all images fire onload", () => {
    const { result } = renderHook(() =>
      useImagesLoaded(["image1.jpg", "image2.jpg"]),
    );

    expect(result.current).toBe(false);

    act(() => {
      capturedImages[0].onload?.();
    });
    expect(result.current).toBe(false);

    act(() => {
      capturedImages[1].onload?.();
    });
    expect(result.current).toBe(true);
  });

  it("returns true after threshold images load", () => {
    const { result } = renderHook(() =>
      useImagesLoaded(["image1.jpg", "image2.jpg", "image3.jpg"], 2),
    );

    expect(result.current).toBe(false);

    act(() => {
      capturedImages[0].onload?.();
    });
    expect(result.current).toBe(false);

    act(() => {
      capturedImages[1].onload?.();
    });
    expect(result.current).toBe(true);
  });

  it("counts onerror as done", () => {
    const { result } = renderHook(() =>
      useImagesLoaded(["image1.jpg", "image2.jpg"]),
    );

    expect(result.current).toBe(false);

    act(() => {
      capturedImages[0].onload?.();
    });
    expect(result.current).toBe(false);

    act(() => {
      capturedImages[1].onerror?.();
    });
    expect(result.current).toBe(true);
  });

  it("returns true immediately when urls is empty array", () => {
    const { result } = renderHook(() => useImagesLoaded([]));
    expect(result.current).toBe(false);
  });

  it("does not reset when same URL values pass in new array reference", () => {
    const { result, rerender } = renderHook(
      ({ urls }) => useImagesLoaded(urls),
      { initialProps: { urls: ["image1.jpg", "image2.jpg"] } },
    );

    act(() => {
      capturedImages[0].onload?.();
      capturedImages[1].onload?.();
    });
    expect(result.current).toBe(true);

    const initialCapturedCount = capturedImages.length;

    rerender({ urls: ["image1.jpg", "image2.jpg"] });

    expect(result.current).toBe(true);
    expect(capturedImages.length).toBe(initialCapturedCount);
  });

  it("handles threshold larger than urls.length", () => {
    const { result } = renderHook(() =>
      useImagesLoaded(["image1.jpg", "image2.jpg"], 10),
    );

    expect(result.current).toBe(false);

    act(() => {
      capturedImages[0].onload?.();
      capturedImages[1].onload?.();
    });

    expect(result.current).toBe(true);
  });

  it("handles threshold of zero", () => {
    const { result } = renderHook(() =>
      useImagesLoaded(["image1.jpg", "image2.jpg"], 0),
    );

    expect(result.current).toBe(false);
  });
});
