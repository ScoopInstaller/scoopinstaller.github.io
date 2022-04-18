import React, { useEffect, useState } from 'react';

import { Container, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import powershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell';
import lightStyle from 'react-syntax-highlighter/dist/esm/styles/prism/vs';
import darkStyle from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';

SyntaxHighlighter.registerLanguage('powershell', powershell);
SyntaxHighlighter.registerLanguage('json', json);

const Home = (): JSX.Element => {
  const [currentStyle, setCurrentStyle] = useState<unknown>();

  useEffect(() => {
    const colorSchemeQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    setCurrentStyle(colorSchemeQueryList.matches ? darkStyle : lightStyle);
    colorSchemeQueryList.addEventListener('change', (e) => setCurrentStyle(e.matches ? darkStyle : lightStyle));
  }, []);

  return (
    <>
      <Container className="mt-5 mb-5">
        <h1 className="display-4 text-center">Scoop</h1>
        <h2 className="fw-light text-center mb-5">A command-line installer for Windows</h2>

        <h3 className="mb-4 text-center fw-normal">Quickstart</h3>
        <p className="text-center">
          Make sure PowerShell 5.1 (or later) is installed, and its <code className="bg-light">ExecutionPolicy</code> is
          set to &apos;RemoteSigned&apos;. In it, run:
        </p>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
        <SyntaxHighlighter language="powershell" style={currentStyle}>
          &gt; Invoke-WebRequest get.scoop.sh | Invoke-Expression
        </SyntaxHighlighter>
        <p className="text-center">
          For advanced installation options, check out the{' '}
          <a href="https://github.com/ScoopInstaller/Install#readme"> Installer&apos;s Readme</a>.
        </p>

        <h3 className="mt-5 mb-4 text-center fw-normal">What does Scoop do?</h3>

        <Row>
          <Col lg={6}>
            Scoop installs programs you know and love, from the command line with a minimal amount of friction. It:
            <br />
            <br />
            <ul>
              <li>Eliminates permission popup windows</li>
              <li>Hides GUI wizard-style installers</li>
              <li>Prevents PATH pollution from installing lots of programs</li>
              <li>Avoids unexpected side-effects from installing and uninstalling programs</li>
              <li>Finds and installs dependencies automatically</li>
              <li>Performs all the extra setup steps itself to get a working program</li>
            </ul>
          </Col>
          <Col lg={6}>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            <SyntaxHighlighter language="powershell" style={currentStyle}>
              {`> scoop install vscode

Installing 'vscode' (1.66.0) [64bit]
dl.7z (104.1 MB) [=========================================] 100%
Checking hash of dl.7z ... ok.
Extracting dl.7z ... done.
Linking ~\\scoop\\apps\\vscode\\current => ~\\scoop\\apps\\vscode\\1.66.0
Creating shortcut for Visual Studio Code (code.exe)
Persisting data
Running post-install script...
'vscode' (1.66.0) was installed successfully!`}
            </SyntaxHighlighter>
          </Col>
        </Row>
        <hr />

        <Row>
          <Col lg={6}>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            <SyntaxHighlighter language="powershell" style={currentStyle}>
              {`> dir ~\\scoop

    Directory: C:\\Users\\User\\scoop

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
da---          02-04-2022    16:06                apps
d----          30-03-2022    13:22                buckets
d----          02-04-2022    16:06                cache
da---          30-03-2022    21:32                persist
da---          02-04-2022    16:06                shims
d----          20-02-2022    01:22                workspace`}
            </SyntaxHighlighter>
          </Col>
          <Col lg={6}>
            Scoop downloads and manages packages in their own directory and then creates shims for them in{' '}
            <code className="bg-light">~\scoop\shims</code>. It won&apos;t install files outside its home, and you can
            place a Scoop installation wherever you like.
          </Col>
        </Row>

        <h3 className="mt-5 mb-4 text-center fw-normal">Discovering Packages</h3>
        <p className="text-center">
          Scoop packages exist as a part of Git repositories, called &apos;buckets&apos;. The{' '}
          <Link to="/apps">package search</Link> can be used to search all Scoop manifests on GitHub. <br />
          The list of all Scoop buckets on GitHub can be browsed <Link to="/buckets">here</Link>.
        </p>

        <h3 className="mt-5 mb-4 text-center fw-normal">Creating Packages</h3>
        <Row>
          <Col lg={6}>Scoop allows you to trivially create your own packages.</Col>
          <Col lg={6}>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            <SyntaxHighlighter language="powershell" style={currentStyle}>
              {`> scoop create https://example.com/foobar/1.2.3/foobar-package.zip

1) foobar
2) 1.2.3
3) foobar-package.zip
App name: 1
1) foobar
2) 1.2.3
3) foobar-package.zip
Version: 2
Created 'C:\\Users\\User\\Desktop\\foobar.json'.`}
            </SyntaxHighlighter>
          </Col>
        </Row>
        <hr />

        <Row>
          <Col lg={6}>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            <SyntaxHighlighter language="json" style={currentStyle}>
              {`> scoop cat gifski

{
    "version": "1.6.4",
    "description": "GIF encoder based on libimagequant (pngquant).",
    "homepage": "https://gif.ski",
    "license": "AGPL-3.0-or-later",
    "url": "https://gif.ski/gifski-1.6.4.zip",
    "hash": "dc97c92c9685742c4cf3de59ae12bcfcfa6ee08d97dfea26ea88728a388440cb",
    "pre_install": "if (!(Test-Path '$dir\\\\config')) { New-Item '$dir\\\\config' }",
    "bin": "gifski.exe",
    "checkver": "For Windows.*?gifski-([\\\\d.]+)\\\\.zip",
    "autoupdate": {
        "url": "https://gif.ski/gifski-$version.zip"
    }
}`}
            </SyntaxHighlighter>
          </Col>
          <Col lg={6}>
            Scoop manifests are simple JSON files, which can be optionally complemented with inline PowerShell
            statements.
          </Col>
        </Row>

        <h3 className="mt-5 mb-4 text-center fw-normal">Documentation</h3>
        <p className="text-center">
          Looking for something specific, or ready to dive into Scoop internals? Check out{' '}
          <a href="https://github.com/ScoopInstaller/Scoop#readme">Scoop&apos;s Readme</a> or refer to the{' '}
          <a href="https://github.com/ScoopInstaller/Scoop/wiki">Wiki</a>.
        </p>
      </Container>
    </>
  );
};

export default React.memo(Home);
