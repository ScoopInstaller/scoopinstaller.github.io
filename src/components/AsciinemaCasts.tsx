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
  defaultCast: string;
  currentCast: string;
  onCastChange: (castKey: string) => void;
};

const AsciinemaCasts = (props: AsciinemaCastsProps): JSX.Element => {
  const asciiPlayerDivRef = useRef<HTMLDivElement>(null);
  const asciiPlayerRef = useRef<AsciinemaPlayer.Player>();
  const [asciiPlayerUrl, setAsciiPlayerUrl] = useState<string>();

  const { casts, defaultCast, currentCast, onCastChange } = props;

  useEffect(() => {
    const match = casts.find((x) => x.key == currentCast);
    if (match) {
      setAsciiPlayerUrl(match.url);
    }
  }, [currentCast, casts]);

  useEffect(() => {
    if (asciiPlayerDivRef.current) {
      const options = {
        loop: true,
        autoPlay: true,
        rows: 15,
        cols: 80,
      };

      if (asciiPlayerUrl) {
        asciiPlayerRef.current?.dispose();
        asciiPlayerRef.current = AsciinemaPlayer.create(asciiPlayerUrl, asciiPlayerDivRef.current, options);
      }
    }
  }, [asciiPlayerUrl]);

  return (
    <>
      <Nav
        fill
        variant="tabs"
        defaultActiveKey={defaultCast}
        activeKey={currentCast}
        onSelect={(k) => onCastChange(k ?? defaultCast)}
      >
        {casts.map((item, i) => (
          <Nav.Item key={i}>
            <Nav.Link eventKey={item.key}>{item.displayName}</Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
      <div ref={asciiPlayerDivRef} />
    </>
  );
};

export default React.memo(AsciinemaCasts);
