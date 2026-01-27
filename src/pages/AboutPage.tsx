import React from "react";

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
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

      <section className="mb-8">
        <p className="mb-4">
          Gaichu is an open-source database project for homemade card games.
          <br />
          <br />
          Permission is hereby granted, free of charge, to any person obtaining
          a copy of this software and associated documentation files (the
          "Software"), to deal in the Software without restriction, including
          without limitation the rights to use, copy, modify, merge, publish,
          distribute, sublicense, and/or sell copies of the Software, and to
          permit persons to whom the Software is furnished to do so, subject to
          the following conditions:
          <br />
          <br />
          The above copyright notice and this permission notice shall be
          included in all copies or substantial portions of the Software.
          <br />
          <br />
          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
          IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
          CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
          TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
          SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
