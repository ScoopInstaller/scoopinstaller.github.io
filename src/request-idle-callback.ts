// Shim from https://developers.google.com/web/updates/2015/08/using-requestidlecallback
export const requestIdleCallback =
  window.requestIdleCallback ||
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function ric(cb: any) {
    const start = Date.now();

    return setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      cb({
        didTimeout: false,
        timeRemaining: function timeRemaining() {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };
