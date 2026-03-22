import { useEffect, useRef } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import type { LogEntry } from '../types';

/**
 * Simulates log entries and status changes flowing through the demo workflow
 * to showcase the tracing and log panel functionality.
 */
export function useDemoSimulation() {
  const addLog = useWorkflowStore((s) => s.addLog);
  const updateSubNodeStatus = useWorkflowStore((s) => s.updateSubNodeStatus);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const traceId = 'trace-' + Math.random().toString(36).slice(2, 10);

    const steps: { delay: number; fn: () => void }[] = [
      {
        delay: 1000,
        fn: () => {
          addLog(makeLog('container-ingress', 'ingress-router', 'info', 'Incoming request routed', traceId));
          updateSubNodeStatus('container-ingress', 'ingress-router', 'running');
        },
      },
      {
        delay: 1500,
        fn: () => {
          addLog(makeLog('container-ingress', 'ingress-auth', 'info', 'JWT validated successfully', traceId));
          updateSubNodeStatus('container-ingress', 'ingress-auth', 'success');
          updateSubNodeStatus('container-ingress', 'ingress-router', 'success');
        },
      },
      {
        delay: 2500,
        fn: () => {
          addLog(makeLog('container-ai-pipeline', 'ai-classify', 'info', 'Classifying intent...', traceId));
          updateSubNodeStatus('container-ai-pipeline', 'ai-classify', 'running');
        },
      },
      {
        delay: 4000,
        fn: () => {
          addLog(makeLog('container-ai-pipeline', 'ai-classify', 'info', 'Intent: data_query (0.94)', traceId));
          updateSubNodeStatus('container-ai-pipeline', 'ai-classify', 'success');
          updateSubNodeStatus('container-ai-pipeline', 'ai-extract', 'running');
          updateSubNodeStatus('container-ai-pipeline', 'ai-generate', 'running');
          addLog(makeLog('container-ai-pipeline', 'ai-extract', 'info', 'Extracting entities...', traceId));
          addLog(makeLog('container-ai-pipeline', 'ai-generate', 'info', 'Generating response...', traceId));
        },
      },
      {
        delay: 6000,
        fn: () => {
          addLog(makeLog('container-ai-pipeline', 'ai-extract', 'info', 'Extracted 3 entities', traceId));
          updateSubNodeStatus('container-ai-pipeline', 'ai-extract', 'success');
        },
      },
      {
        delay: 7000,
        fn: () => {
          addLog(makeLog('container-ai-pipeline', 'ai-generate', 'info', 'Response generated (247 tokens)', traceId));
          updateSubNodeStatus('container-ai-pipeline', 'ai-generate', 'success');
          updateSubNodeStatus('container-ai-pipeline', 'ai-merge', 'running');
        },
      },
      {
        delay: 8000,
        fn: () => {
          addLog(makeLog('container-ai-pipeline', 'ai-merge', 'info', 'Results merged', traceId));
          updateSubNodeStatus('container-ai-pipeline', 'ai-merge', 'success');
          updateSubNodeStatus('container-data-store', 'db-write', 'running');
          addLog(makeLog('container-data-store', 'db-write', 'info', 'Writing to database...', traceId));
        },
      },
      {
        delay: 9000,
        fn: () => {
          updateSubNodeStatus('container-data-store', 'db-write', 'success');
          addLog(makeLog('container-data-store', 'db-write', 'info', 'Row inserted', traceId));
          updateSubNodeStatus('container-notifier', 'notify-format', 'running');
          addLog(makeLog('container-notifier', 'notify-format', 'info', 'Formatting notification...', traceId));
        },
      },
      {
        delay: 10000,
        fn: () => {
          updateSubNodeStatus('container-notifier', 'notify-format', 'success');
          updateSubNodeStatus('container-notifier', 'notify-send', 'running');
          addLog(makeLog('container-notifier', 'notify-send', 'info', 'Sending notification...', traceId));
        },
      },
      {
        delay: 11000,
        fn: () => {
          updateSubNodeStatus('container-notifier', 'notify-send', 'success');
          addLog(makeLog('container-notifier', 'notify-send', 'info', 'Notification delivered', traceId));
          addLog(makeLog('container-ingress', undefined, 'info', `Trace ${traceId} completed in 10s`, traceId));
        },
      },
    ];

    const timeouts = steps.map(({ delay, fn }) => setTimeout(fn, delay));

    return () => {
      timeouts.forEach(clearTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

let logCounter = 0;
function makeLog(
  containerId: string,
  subNodeId: string | undefined,
  level: LogEntry['level'],
  message: string,
  traceId: string,
): LogEntry {
  return {
    id: `log-${++logCounter}`,
    timestamp: Date.now(),
    containerId,
    subNodeId,
    level,
    message,
    traceId,
  };
}
