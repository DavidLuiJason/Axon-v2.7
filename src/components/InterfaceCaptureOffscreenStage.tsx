import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScreenId } from '../types';
import { useApp } from '../context/AppContext';
import { registerOffscreenStageRequester, StageHandle } from '../lib/interfaceCaptureEngine';

import { DualPaneContainer } from './DualPaneContainer';
import { ToolsMenuScreen } from '../screens/ToolsMenuScreen';
import { VideoEditorScreen } from '../screens/VideoEditorScreen';
import { AxonCodeScreen } from '../screens/AxonCodeScreen';
import { AutomationScreen } from '../screens/AutomationScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { TextToolsScreen } from '../screens/tools/TextToolsScreen';
import { CalculationToolsScreen } from '../screens/tools/CalculationToolsScreen';
import { ColorToolsScreen } from '../screens/tools/ColorToolsScreen';
import { ImageToolsScreen } from '../screens/tools/ImageToolsScreen';
import { FileConversionToolsScreen } from '../screens/tools/FileConversionToolsScreen';
import { StorageDiagnosticsScreen } from '../screens/StorageDiagnosticsScreen';
import { SpeechRateAnalysisScreen } from '../screens/tools/SpeechRateAnalysisScreen';
import { OfflineBibleScreen } from '../screens/tools/OfflineBibleScreen';
import { InterfaceCaptureScreen } from '../screens/tools/InterfaceCaptureScreen';

// Registry of built-in screens
const STAGE_BUILTIN_COMPONENTS: Record<string, React.ComponentType<any>> = {
  axon: DualPaneContainer,
  tools: ToolsMenuScreen,
  code: AxonCodeScreen,
  automation: AutomationScreen,
  video_editor: VideoEditorScreen,
  notes: NotesScreen,
  settings: SettingsScreen,
  account: AccountScreen,
  notifications: NotificationsScreen,
  tool_text: TextToolsScreen,
  tool_calc: CalculationToolsScreen,
  tool_units: CalculationToolsScreen,
  tool_colors: ColorToolsScreen,
  tool_images: ImageToolsScreen,
  tool_files: FileConversionToolsScreen,
  tool_speech_rate: SpeechRateAnalysisScreen,
  tool_bible: OfflineBibleScreen,
  storage: StorageDiagnosticsScreen,
  tool_interface_capture: InterfaceCaptureScreen,
};

// Dynamic component registry for future-proof runtime interface additions
const dynamicStageComponents = new Map<string, React.ComponentType<any>>();

export function registerDynamicStageComponent(
  route: string,
  component: React.ComponentType<any>
): void {
  dynamicStageComponents.set(route, component);
}

export function unregisterDynamicStageComponent(route: string): void {
  dynamicStageComponents.delete(route);
}

interface QueuedStageRequest {
  id: number;
  route: ScreenId;
  isFull: boolean;
  resolve: (handle: StageHandle | null) => void;
  reject: (err: any) => void;
}

let requestIdCounter = 0;

export const InterfaceCaptureOffscreenStage: React.FC = () => {
  const { theme } = useApp();
  const [activeRequest, setActiveRequest] = useState<QueuedStageRequest | null>(null);
  const queueRef = useRef<QueuedStageRequest[]>([]);
  const isBusyRef = useRef<boolean>(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const processQueue = useCallback(() => {
    if (isBusyRef.current) return;
    if (queueRef.current.length === 0) {
      setActiveRequest(null);
      return;
    }

    const next = queueRef.current.shift()!;
    isBusyRef.current = true;
    setActiveRequest(next);
  }, []);

  const releaseCurrentRequest = useCallback(() => {
    isBusyRef.current = false;
    processQueue();
  }, [processQueue]);

  useEffect(() => {
    // Register the FIFO queue-backed offscreen stage requester
    registerOffscreenStageRequester((route: ScreenId, isFull: boolean) => {
      return new Promise<StageHandle | null>((resolve, reject) => {
        const item: QueuedStageRequest = {
          id: ++requestIdCounter,
          route,
          isFull,
          resolve,
          reject,
        };
        queueRef.current.push(item);
        processQueue();
      });
    });

    return () => {
      registerOffscreenStageRequester(null);
      queueRef.current = [];
      isBusyRef.current = false;
    };
  }, [processQueue]);

  // When activeRequest changes, wait for DOM layout and resolve with release handle
  useEffect(() => {
    if (!activeRequest) return;

    let isMounted = true;
    let hasReleased = false;

    const safeRelease = () => {
      if (hasReleased) return;
      hasReleased = true;
      releaseCurrentRequest();
    };

    // Watchdog timer: If caller fails to release within 12s, release automatically to prevent stalled queue
    const watchdogTimer = setTimeout(() => {
      if (!hasReleased && isMounted) {
        console.warn(`Stage watchdog auto-released request for "${activeRequest.route}"`);
        safeRelease();
      }
    }, 12000);

    // Wait 80ms + 2 animation frames for children to mount and compute styles
    const renderTimer = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!isMounted || hasReleased) return;

          const el = stageRef.current;
          if (el) {
            activeRequest.resolve({
              element: el,
              release: safeRelease,
            });
          } else {
            activeRequest.reject(
              new Error(`Stage element unavailable for route "${activeRequest.route}"`)
            );
            safeRelease();
          }
        });
      });
    }, 80);

    return () => {
      isMounted = false;
      clearTimeout(renderTimer);
      clearTimeout(watchdogTimer);
    };
  }, [activeRequest, releaseCurrentRequest]);

  if (!activeRequest) {
    return null;
  }

  const { route, isFull } = activeRequest;
  const Component = STAGE_BUILTIN_COMPONENTS[route] || dynamicStageComponents.get(route);
  const formattedTitle = route.replace(/_/g, ' ').toUpperCase();

  return (
    <div
      id="axon-offscreen-capture-stage"
      ref={stageRef}
      style={{
        position: 'fixed',
        left: '-99999px',
        top: 0,
        width: '430px',
        height: isFull ? 'auto' : '932px',
        minHeight: '932px',
        zIndex: -99999,
        visibility: 'visible',
        pointerEvents: 'none',
        overflow: isFull ? 'visible' : 'hidden',
      }}
      className={`flex flex-col font-sans select-none ${
        theme.mode === 'dark' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-900'
      }`}
      aria-hidden="true"
    >
      {/* Offscreen Top Header Bar */}
      <div className="h-12 w-full bg-black border-b border-neutral-800 px-3 flex items-center justify-between shrink-0">
        <span className="text-xs font-bold tracking-tight text-white">
          AXON • {formattedTitle}
        </span>
        <span className="text-[10px] font-mono text-neutral-400">OFFLINE UI</span>
      </div>

      {/* Screen Component */}
      <div
        className={`flex-1 min-h-0 flex flex-col ${
          isFull ? 'h-auto overflow-visible' : 'overflow-hidden'
        }`}
      >
        {Component ? (
          <Component />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-neutral-500 text-xs font-mono">
            Interface component for &quot;{route}&quot; not registered
          </div>
        )}
      </div>
    </div>
  );
};
