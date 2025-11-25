// Shim from https://developers.google.com/web/updates/2015/08/using-requestidlecallback
export const requestIdleCallback =
  window.requestIdleCallback ||
  function ric(cb: any) {
    const start = Date.now();

    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: function timeRemaining() {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };
