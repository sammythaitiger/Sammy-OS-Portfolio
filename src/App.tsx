/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Preloader } from './components/Preloader';
import { MonitorFrame } from './components/MonitorFrame';
import { Desktop } from './components/Desktop';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <main className="h-[100svh] overflow-hidden bg-retro-bg selection:bg-retro-green selection:text-black">
      {!isLoaded ? (
        <Preloader onComplete={() => setIsLoaded(true)} />
      ) : (
        <MonitorFrame>
          <Desktop />
        </MonitorFrame>
      )}
    </main>
  );
}
