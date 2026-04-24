/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center font-sans">
      <div className="text-center bg-black/30 p-12 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm max-w-2xl px-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent mb-6 tracking-tight">BMW Chatbot Hub</h1>
        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          The BMAX chatbot widget is actively running on this page. Look for the floating blue BMW bubble in the bottom right corner of your screen.
        </p>
        <div className="inline-flex items-center gap-3 bg-blue-500/10 text-blue-400 px-6 py-3 rounded-full text-sm font-medium border border-blue-500/20">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          BMAX is Online
        </div>
      </div>
    </div>
  );
}
