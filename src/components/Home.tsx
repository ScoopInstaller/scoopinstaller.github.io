import React, { useContext, useState } from 'react';

import { Container, Col, Row } from 'react-bootstrap';
import { Link, useNavigate, createSearchParams } from 'react-router-dom';
import { PrismLight as SyntaxHighlighterBase, SyntaxHighlighterProps } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import powershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell';
import darkStyle from 'react-syntax-highlighter/dist/esm/styles/prism/a11y-dark';
import lightStyle from 'react-syntax-highlighter/dist/esm/styles/prism/ghcolors';

import { ColorSchemeContext } from '../colorscheme/ColorSchemeContext';
import AsciinemaCasts, { AsciinemaCastItem } from './AsciinemaCasts';
import SearchBar from './SearchBar';

SyntaxHighlighterBase.registerLanguage('powershell', powershell);
SyntaxHighlighterBase.registerLanguage('json', json);

const Home = (): JSX.Element => {
  const { isDarkMode } = useContext(ColorSchemeContext);
  const colorStyle: unknown = isDarkMode ? darkStyle : lightStyle;

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const handleSearchQuerySubmit = (): void => {
    navigate({
      pathname: '/apps',
      search: createSearchParams({ q: searchQuery }).toString(),
    });
  };

  const CASTS_CONFIG: AsciinemaCastItem[] = [
    { key: 'nodejs', displayName: 'Node.js', url: 'casts/nodejs.cast' },
    { key: 'neovim', displayName: 'Neovim', url: 'casts/neovim.cast' },
    { key: 'vscode', displayName: 'VS Code (extras)', url: 'casts/vscode.cast' },
    { key: 'cascadia-code', displayName: 'Cascadia Code (nerd-fonts)', url: 'casts/cascadia-code.cast' },
  ];

  const SyntaxHighlighter = (syntaxHighlighterProps: SyntaxHighlighterProps): JSX.Element => {
    const { children, ...syntaxHighlighterRest } = syntaxHighlighterProps;

    // Adjust light and dark styles to have similar visual result
    const customStyle = {
      lineHeight: '1.4',
      fontSize: '0.9em',
      margin: '0',
    };

    const codeTagProps = {
      style: customStyle,
    };

    return (
      <SyntaxHighlighterBase
        {...syntaxHighlighterRest}
        style={colorStyle}
        customStyle={customStyle}
        codeTagProps={codeTagProps}
      >
        {children}
      </SyntaxHighlighterBase>
    );
  };

  return (
    <>
      <Container className="mt-5 mb-5">
        <h1 className="display-4 text-center">Scoop</h1>
        <h2 className="fw-light text-center mb-5">A command-line installer for Windows</h2>

        <Row className="justify-content-center mb-5">
          <Col lg={6}>
            <SearchBar query={searchQuery} onQueryChange={setSearchQuery} onSubmit={handleSearchQuerySubmit} />
          </Col>
        </Row>

        <h3 className="mb-4 text-center fw-normal">Quickstart</h3>
        <p className="text-center">
          Open a{' '}
          <abbr
            style={{ textDecorationStyle: 'solid' }}
            /* eslint-disable-next-line max-len */
            title="If you don't know what it is, don't worry, you can use the standard command line after installation. Just search for 'PowerShell' in the Start menu. Windows 7 users must install PowerShell version 5.1 or later manually."
          >
            PowerShell terminal
          </abbr>{' '}
          (version 5.1 or later) and run:
        </p>
        <SyntaxHighlighter language="powershell">
          {`> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser # Optional: Needed to run a remote script the first time
> irm get.scoop.sh | iex`}
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
            <AsciinemaCasts casts={CASTS_CONFIG} />
          </Col>
        </Row>
        <hr />

        <Row>
          <Col lg={6}>
            <SyntaxHighlighter language="powershell">
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
            Scoop downloads and manages packages in a portable way, keeping them neatly isolated in{' '}
            <code className="bg-light">~\scoop</code>. It won&apos;t install files outside its home, and you can place a
            Scoop installation wherever you like.
          </Col>
        </Row>
        <hr />

        <Row>
          <Col lg={6}>
            For terminal applications, Scoop creates <i>shims</i>, a kind of command-line shortcuts, inside the{' '}
            <code className="bg-light">~\scoop\shims</code> folder, which is accessible in the PATH. For graphical
            applications, Scoop creates program shortcuts in a dedicated Start menu folder, called &apos;Scoop
            Apps&apos;. This way, packages are always cleanly uninstalled and you can be sure what tools are currently
            in your PATH and in your Start menu.
          </Col>
          <Col lg={6}>
            <SyntaxHighlighter language="json">
              {`> scoop search python
Results from local buckets...

Name      Version  Source Binaries
----      -------  ------ --------
python    3.10.5   main
winpython 3.10.4.0 main

> scoop install python
...
Creating shim for 'python.exe'.
'python' (3.10.5) was installed successfully!

> python -c "print('Hello from Python installed by Scoop!')"
Hello from Python installed by Scoop!`}
            </SyntaxHighlighter>
          </Col>
        </Row>

        <h3 className="mt-5 mb-4 text-center fw-normal">Discovering Packages</h3>
        <Row>
          <Col lg={6}>
            <SyntaxHighlighter language="json">
              {`> scoop search mongo
Results from local buckets...

Name                   Version Source Binaries
----                   ------- ------ --------
mongodb-compass        1.32.2  extras
mongosh                1.5.0   extras
mongodb-database-tools 100.5.3 main
mongodb                5.3.2   main

> scoop search citra
Results from other known buckets...
(add them using 'scoop bucket add <name>')

Name         Source
----         ------
citra-canary games
citra        games`}
            </SyntaxHighlighter>
          </Col>
          <Col lg={6}>
            Scoop packages exist as a part of Git repositories, called <i>buckets</i>. In addition to the builtin{' '}
            <code className="bg-light">search</code> sub-command, the <Link to="/apps">package search</Link> can be used
            to search all Scoop manifests on GitHub.
            <br />
            <br />
            The list of all Scoop buckets on GitHub can be browsed <Link to="/buckets">here</Link>.
          </Col>
        </Row>

        <h3 className="mt-5 mb-4 text-center fw-normal">Creating Packages</h3>
        <Row>
          <Col lg={6}>Scoop allows you to trivially create your own packages.</Col>
          <Col lg={6}>
            <SyntaxHighlighter language="powershell">
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
            <SyntaxHighlighter language="json">
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
