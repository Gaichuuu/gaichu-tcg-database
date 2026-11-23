import React from "react";
import { buttonClasses } from "@/components/ui";

const AboutPage: React.FC = () => {
  return (
    <div className="pb-4">
      <title>About - Gaichu</title>
      <meta
        name="description"
        content="Gaichu is an open-source database project for homemade card games."
      />
      <meta property="og:title" content="About - Gaichu" />
      <meta
        property="og:description"
        content="Gaichu is an open-source database project for homemade card games."
      />

      <div className="mx-auto flex w-full max-w-210 flex-col gap-7">
        <h1 className="font-jp text-accentAmber text-[30px] leading-[1.2] font-normal text-shadow-none">
          <span aria-hidden lang="ja">
            概要
          </span>
          <span className="sr-only">About</span>
        </h1>

        <p className="font-display text-primaryText text-xl leading-[1.45] text-pretty">
          Gaichu is an open-source database project for homemade card games.
        </p>

        <section className="flex flex-col gap-3" aria-labelledby="license">
          <h2 id="license" className="flex items-baseline gap-2.5">
            <span className="font-jp text-accentAmber text-xs" lang="ja">
              ライセンス
            </span>
            <span className="sr-only">License</span>
            <span className="font-display text-mutedLabel text-[11px]">
              MIT
            </span>
          </h2>
          <div className="bg-insetBg border-tileBorder text-secondaryText flex flex-col gap-3.5 border-2 px-5.5 py-5 text-[13.5px] leading-[1.7] text-pretty shadow-[inset_2px_2px_0_rgba(0,0,0,0.6),4px_5px_0_rgba(0,0,0,0.6)] [&>p]:max-w-[72ch]">
            <p>
              Permission is hereby granted, free of charge, to any person
              obtaining a copy of this software and associated documentation
              files (the "Software"), to deal in the Software without
              restriction, including without limitation the rights to use, copy,
              modify, merge, publish, distribute, sublicense, and/or sell copies
              of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
            </p>
            <p>
              The above copyright notice and this permission notice shall be
              included in all copies or substantial portions of the Software.
            </p>
            <p className="text-mutedLabel">
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
              NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
              HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
              WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
              DEALINGS IN THE SOFTWARE.
            </p>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <a
            href="https://github.com/Gaichuuu/gaichu-tcg-database"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses()}
          >
            View source on GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
