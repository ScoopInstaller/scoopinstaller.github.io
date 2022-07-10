import React, { useState, useEffect, useRef } from 'react';

import 'asciinema-player/dist/bundle/asciinema-player.css';
import * as AsciinemaPlayer from 'asciinema-player';
import { Nav } from 'react-bootstrap';

export type AsciinemaCastItem = {
  key: string;
  displayName: string;
  url: string;
};

type AsciinemaCastsProps = {
  casts: AsciinemaCastItem[];
};

const AsciinemaCasts = (props: AsciinemaCastsProps): JSX.Element => {
  const { casts } = props;

  const asciiPlayerDivRef = useRef<HTMLDivElement>(null);
  const asciiPlayerRef = useRef<AsciinemaPlayer.Player>();
  const [currentCast, setCurrentCast] = useState<AsciinemaCastItem>(casts[0]);

  useEffect(() => {
    if (asciiPlayerDivRef.current) {
      asciiPlayerRef.current?.dispose();
      const options = {
        autoPlay: true,
        rows: 15,
        cols: 80,
      };
      asciiPlayerRef.current = AsciinemaPlayer.create(currentCast.url, asciiPlayerDivRef.current, options);
    }
  }, [currentCast]);

  return (
    <>
      <Nav
        fill
        variant="tabs"
        defaultActiveKey={casts[0].key}
        activeKey={currentCast.key}
        onSelect={(k) => setCurrentCast(casts.find((x) => x.key === k) ?? casts[0])}
      >
        {casts.map((item, i) => (
          <Nav.Item key={i}>
            <Nav.Link eventKey={item.key}>{item.displayName}</Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
      <div ref={asciiPlayerDivRef} className="asciinema-player-no-controls" />
    </>
  );
};

export default React.memo(AsciinemaCasts);
