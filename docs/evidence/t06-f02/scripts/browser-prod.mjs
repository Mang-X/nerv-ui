const { runLane } = await import('file:///tmp/nerv-ui-t06-f02/browser-lane.mjs');
await runLane('http://127.0.0.1:5200', 'prod');
