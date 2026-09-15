import React, { useState, useEffect, useRef } from 'react';
import { ScreenId } from '../types';
import { useApp } from '../context/AppContext';
import { registerOffscreenStageRequester } from '../lib/interfaceCaptureEngine';

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

interface PendingStageRequest {
  route: ScreenId;
  isFull: boolean;
  resolve: (element: HTMLElement | null) => void;
  reject: (err: any) => void;
}

export const InterfaceCaptureOffscreenStage: React.FC = () => {
  const { theme } = useApp();
  const [activeRequest, setActiveRequest] = useState<PendingStageRequest | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register this component as the offscreen stage provider
    registerOffscreenStageRequester((route: ScreenId, isFull: boolean) => {
      return new Promise<HTMLElement | null>((resolve, reject) => {
        setActiveRequest({
          route,
          isFull,
          resolve,
          reject,
        });
      });
    });

    return () => {
      registerOffscreenStageRequester(null);
    };
  }, []);

  // When activeRequest changes, notify once rendered
  useEffect(() => {
    if (!activeRequest) return;

    let isMounted = true;
    // Wait two animation frames for component tree to mount and compute layout styles
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isMounted && activeRequest) {
            const el = stageRef.current;
            activeRequest.resolve(el);
            // Delay clearing so html2canvas has ample time to read canvas
            setTimeout(() => {
              if (isMounted) {
                setActiveRequest(null);
              }
            }, 4000);
          }
        });
      });
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [activeRequest?.route, activeRequest?.isFull]);

  if (!activeRequest) {
    return null;
  }

  const { route, isFull } = activeRequest;

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
      {/* Offscreen Simulated Top Header Bar */}
      <div className="h-12 w-full bg-black border-b border-neutral-800 px-3 flex items-center justify-between shrink-0">
        <span className="text-xs font-bold tracking-tight text-white uppercase">
          AXON • {route.replace(/_/g, ' ')}
        </span>
        <span className="text-[10px] font-mono text-neutral-400">OFFLINE UI</span>
      </div>

      {/* Screen Component */}
      <div className={`flex-1 min-h-0 flex flex-col ${isFull ? 'h-auto overflow-visible' : 'overflow-hidden'}`}>
        {route === 'axon' && <DualPaneContainer />}
        {route === 'tools' && <ToolsMenuScreen />}
        {route === 'code' && <AxonCodeScreen />}
        {route === 'automation' && <AutomationScreen />}
        {route === 'video_editor' && <VideoEditorScreen />}
        {route === 'notes' && <NotesScreen />}
        {route === 'settings' && <SettingsScreen />}
        {route === 'account' && <AccountScreen />}
        {route === 'notifications' && <NotificationsScreen />}
        {route === 'tool_text' && <TextToolsScreen />}
        {route === 'tool_calc' && <CalculationToolsScreen />}
        {route === 'tool_units' && <CalculationToolsScreen />}
        {route === 'tool_colors' && <ColorToolsScreen />}
        {route === 'tool_images' && <ImageToolsScreen />}
        {route === 'tool_files' && <FileConversionToolsScreen />}
        {route === 'tool_speech_rate' && <SpeechRateAnalysisScreen />}
        {route === 'tool_bible' && <OfflineBibleScreen />}
        {route === 'storage' && <StorageDiagnosticsScreen />}
        {route === 'tool_interface_capture' && <InterfaceCaptureScreen />}
      </div>
    </div>
  );
};
