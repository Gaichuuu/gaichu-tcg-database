// src/pages/AboutPage.tsx
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-8">
        <p className="mb-4">
          Gaichu is an open-source database project for homemade card games.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">MIT License</h2>
        <p className="mb-4">
&copy; {new Date().getFullYear()} Gaichu<br /><br />

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:<br /><br />

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.<br /><br />

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
        </p>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-3">Write to us</h2>
        <p className="mb-2">
        GAICHU<br />
        26400 NE Valley St #643<br />
        DUVALL WA 98019
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
